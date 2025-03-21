import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { IdentificationType, UserType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

// DTO for creating a business user
export class CreateBusinessDto {
  @ApiProperty({
    description: 'The name of the organization',
    example: 'TechCorp',
  })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@techcorp.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number in international format (e.g., +1234567890)',
    example: '+1234567890',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid',
  })
  phone: string;

  @ApiProperty({
    description: 'URL or path to the user’s display picture (optional)',
    example: 'https://example.com/images/john.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  displayPicture?: string;

  @ApiProperty({
    description: 'Physical address of the organization (optional)',
    example: '123 Tech Street, Silicon Valley',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationAddress?: string;

  @ApiProperty({
    description: 'Type of identification (e.g., PASSPORT, DRIVERS_LICENSE)',
    enum: IdentificationType,
  })
  @IsEnum(IdentificationType)
  identificationType: IdentificationType;

  @ApiProperty({
    description: 'Identification number',
    example: 'A12345678',
  })
  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @ApiProperty({
    description: 'Password',
    example: 'Password123',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Confirmation of the password',
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @ApiProperty({
    description: 'Role of the user (optional, defaults to BUSINESS_USER)',
    enum: UserType,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserType)
  role: UserType = UserType.BUSINESS_USER; // Default to BUSINESS_USER
}

// DTO for logging in a business user
export class LoginBusinessUserDto {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@techcorp.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Password123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}