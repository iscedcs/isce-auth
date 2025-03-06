import { Controller, Get, Post, Body, UseInterceptors, Param, Put, } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CreateBusinessDto } from './dto/create-business_user.dto';
import { UpdateBusinessUserDto } from './dto/update-business_user.dto';
import { BusinessService } from './business_user.service';

@ApiTags('business')
@Controller('business')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Post()
  @UseInterceptors(FileInterceptor('displayPicture'))
  @ApiOperation({ summary: 'Create a new business user' })
  @ApiResponse({ status: 201, description: 'The business user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateBusinessDto })
  async createBusiness(
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    return this.businessService.createBusiness(createBusinessDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing business user' })
  @ApiResponse({ status: 200, description: 'The business user has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Business user not found.' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the business user to update' })
  @ApiBody({ type: UpdateBusinessUserDto })
  async updateBusiness(
    @Param('id') id: string,
    @Body() updateBusinessDto: UpdateBusinessUserDto,
  ) {
    return this.businessService.updateBusiness(id, updateBusinessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all business users' })
  @ApiResponse({ status: 200, description: 'Fetched all business users successfully.' })
  async getAllBusinessUser() {
    return this.businessService.getAllBusinessUser();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a business user by ID' })
  @ApiResponse({ status: 200, description: 'Business user fetched successfully.' })
  @ApiResponse({ status: 404, description: 'Business user not found.' })
  @ApiParam({ name: 'id', required: true, description: 'ID of the business user to fetch' })
  async getBusinessUserById(@Param('id') id: string) {
    return this.businessService.getBusinessUserById(id);
  }
}