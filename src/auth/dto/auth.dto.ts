import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdentificationType } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class EmailDto {
  @ApiProperty({ description: 'User email', example: 'teddy@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'User email', example: 'teddy@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Verification code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'first name', example: 'Elon' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'last name', example: 'Musk' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'User phone number', example: '09067584674' })
  @IsNotEmpty()
  @MinLength(10)
  @IsString()
  phone: string;

  @ApiProperty({ description: 'User email', example: 'elonmusk@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayPicture?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idNumber?: string;

  @ApiProperty({ enum: IdentificationType })
  @IsEnum(IdentificationType)
  identificationType: IdentificationType;

  @ApiProperty({ description: 'User date of birth', example: 'mm/dd/yyyy' })
  @IsNotEmpty()
  dob?: Date;

  @ApiProperty({ description: 'User address', example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Confirm Password', example: 'password123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  confirmpassword: string;
}

export class LoginDto {
  @ApiProperty({ description: 'User email', example: 'elonmusk@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'User password', example: 'password123' })
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Code to reset password', example: 'gacrow93q7r846t734o8ey817q6etgedfkdh' })
  @IsNotEmpty()
  @IsString()
  resetCode: string;

  @ApiProperty({ description: 'New password', example: 'password456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class SendResetTokenDto {
  @ApiProperty({ description: 'User email', example: 'elonmusk@gmail.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phonenumber: string;

  @Expose()
  address: string;

  @Expose()
  role: string;

  @Expose()
  token: string;

  @Expose()
  lga: string;

  @Expose()
  nin: string;

  @Expose()
  location: string;

  @Expose()
  blacklist: boolean;

  @Expose()
  dob: Date;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}

export function transformToUserDto(user: any): UserDto {
  return plainToClass(UserDto, user, { excludeExtraneousValues: true });
}
