import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { CreateBusinessDto } from './dto/create-business_user.dto';
import { UpdateBusinessUserDto } from './dto/update-business_user.dto';

@Injectable()
export class BusinessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createBusiness(createBusinessDto: CreateBusinessDto) {
    const {
      organizationName,
      fullname,
      email,
      phone,
      displayPicture,
      organizationAddress,
      identificationType,
      idNumber,
      password,
      confirmPassword,
    } = createBusinessDto;

    try {
      // Validate password match
      if (password !== confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      // Check for existing business with same email or phone
      const existingBusiness = await this.databaseService.user.findFirst({
        where: {
          OR: [
            { email },
            { phone },
            { idNumber },
            { organizationName}
          ]
        }
      });

      if (existingBusiness) {
        throw new ConflictException('Business with these details already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const business = await this.databaseService.user.create({
        data: {
          organizationName,
          fullname, 
          email: email.toLowerCase(),
          phone,
          displayPicture,
          organizationAddress,
          identificationType,
          idNumber,
          password: hashedPassword,
        },
      });

      // Remove password from response
      const { password: _, ...businessWithoutPassword } = business;
      
      return {
        success: true,
        message: 'Business created successfully',
        data: businessWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateBusiness(id: string, updateBusinessDto: UpdateBusinessUserDto) {
    try {
      const business = await this.databaseService.user.findUnique({
        where: { id, userType: 'BUSINESS_USER', deletedAt: null },
      });

      if (!business) {
        throw new NotFoundException(`Business user with ID ${id} not found`);
      }

      const updatedBusiness = await this.databaseService.user.update({
        where: { id },
        data: updateBusinessDto,
      });

      return {
        success: true,
        message: 'Business profile updated successfully',
        data: updatedBusiness,
      };
    } catch (error) {
      throw new BadRequestException('Failed to update business user');
    }
  }

  async getAllBusinessUser() {
    try {
      const businesses = await this.databaseService.user.findMany({
        where: { userType: 'BUSINESS_USER', deletedAt: null },
      });

      return {
        success: true,
        message: 'Fetched all business users successfully',
        data: businesses,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch business users');
    }
  }

  async getBusinessUserById(id: string) {
    try {
      const business = await this.databaseService.user.findUnique({
        where: { id, userType: 'BUSINESS_USER', deletedAt: null },
      });

      if (!business) {
        throw new NotFoundException(`Business user with ID ${id} not found`);
      }

      return {
        success: true,
        message: 'Business user fetched successfully',
        data: business,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch business user');
    }
  }
}