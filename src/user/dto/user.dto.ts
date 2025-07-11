import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminRegisterDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', minLength: 6, example: 'password123' })
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'User phone number', example: '09067584674' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty({ description: 'home address', example: 'block 2 M close 5th avenue festac' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'User date of birth', example: 'mm/dd/yyyy' })
  @IsNotEmpty()
  dob: Date;

  @ApiProperty({ example: 'INVITE1234', description: 'Admin invite token' })
  @IsString()
  @IsNotEmpty()
  invite_token: string;
}

export class UserDto {
  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @IsEmail()
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'first name of the user', example: 'Elon ' })
  @IsString()
  @IsOptional()
  firstName: string;

  @ApiProperty({ description: 'last name of the user', example: ' Musk' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ description: 'User phone number', example: '09067584674' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  phone: string;

  @ApiProperty({ description: 'home address', example: 'block 2 M close 5th avenue festac' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'User date of birth', example: 'mm/dd/yyyy' })
  @IsOptional()
  dob: Date;
}

export class UpdateUserDto {
    @ApiProperty({ description: 'User email address', example: 'user@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;
  
    @ApiProperty({ description: 'first name of the user', example: 'Elon ' })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ description: 'last name of the user', example: ' Musk' })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ description: 'User phone number', example: '09067584674' })
    @IsOptional()
    @IsString()
    @MinLength(10)
    phone?: string;

    @ApiProperty({ description: 'home address', example: 'block 2 M close 5th avenue festac' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ description: 'User date of birth', example: 'mm/dd/yyyy' })
    @IsOptional()
    dob?: Date;

    @ApiProperty({ example: 'INVITE1234', description: 'Admin invite token' })
    @IsOptional()
    @IsString()
    invite_token?: string;

    @ApiPropertyOptional({
      description: 'URL or path to the user’s display picture (optional)',
      example: 'https://example.com/images/john.jpg',
      required: false,
    })
    @IsOptional()
    @IsString()
    displayPicture?: string;
}

export class BusinessAdminRegisterDto {
  @ApiProperty({ example: 'Alice', description: 'First name of the Business Admin' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of the Business Admin' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'business@example.com', description: 'Business Admin Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'BUSINESS123', description: 'Business ID for registration' })
  @IsString()
  @IsNotEmpty()
  business_id: string;
}

export class EmployeeRegisterDto {
  @ApiProperty({ example: 'Michael', description: 'First name of the Employee' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Brown', description: 'Last name of the Employee' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'employee@example.com', description: 'Employee Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'USER123', description: 'User ID of the inviter' })
  @IsString()
  @IsNotEmpty()
  invited_by_user_id: string;
}