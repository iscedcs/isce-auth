import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { CreateBusinessDto, LoginBusinessUserDto } from './dto/create-business_user.dto';
import { UpdateBusinessUserDto } from './dto/update-business_user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class BusinessService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService
  ) {}

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
        throw new ConflictException('Business user with these details already exists');
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
        message: 'Business user created successfully',
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

  async loginBusiness(loginBusinessUserDto: LoginBusinessUserDto) {
    const { email, password } = loginBusinessUserDto;

    const business = await this.databaseService.user.findUnique({
      where: { email, userType: 'BUSINESS_USER', deletedAt: null },
    });

    if (!business) {
      throw new NotFoundException('Business user not found');
    }

    const isPasswordValid = await bcrypt.compare(password, business.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { sub: business.id, email: business.email };
    const token = this.jwtService.sign(payload);

    return {
      success: true,
      message: 'Login successful',
      data: { token },
    };
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