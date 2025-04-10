import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IdentificationType } from '@prisma/client';
import { Expose, plainToClass } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { BusinessPermissionsDto } from 'src/utils/common/business-permissions.dto';
import { IscePermissionsDto } from 'src/utils/common/isce-permissions.dto';

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
  firstName?: string;

  @ApiProperty({ description: 'last name', example: 'Musk' })
  @IsNotEmpty()
  @IsString()
  lastName?: string;

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

  @ApiPropertyOptional({ description: 'Business email (only for business users)', example: 'business@example.com' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    description: 'URL or path to the user’s display picture (optional)',
    example: 'https://example.com/images/john.jpg',
    required: false,
  })
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

  // Optional fields for business users only
  @ApiPropertyOptional({ enum: IdentificationType })
  @IsOptional()
  @IsEnum(IdentificationType)
  identificationType?: IdentificationType;

  // @ApiProperty({ description: 'User date of birth', example: 'mm/dd/yyyy' })
  // @IsNotEmpty()
  // dob?: Date;

  // @ApiProperty({ description: 'User address', example: '123 Main St' })
  // @IsNotEmpty()
  // @IsString()
  // address: string;

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

  @ApiPropertyOptional({ type: () => IscePermissionsDto })
  @ValidateNested()
  @IsOptional()
  isce_permissions?: IscePermissionsDto;

  @ApiPropertyOptional({ type: () => BusinessPermissionsDto })
  @ValidateNested()
  @IsOptional()
  business_permissions?: BusinessPermissionsDto;
}

// export class IscePermissionsDto {
//   @ApiProperty({ default: false })
//   @IsOptional()
//   connect?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   connect_plus?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   store?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   wallet?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   event?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   access?: boolean;
// }

// export class BusinessPermissionsDto {
//   @ApiProperty({ default: false })
//   @IsOptional()
//   invoicing?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   appointment?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   chat?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   analytics?: boolean;

//   @ApiProperty({ default: false })
//   @IsOptional()
//   services?: boolean;
// }

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

export class AdminVerifyEmailDto {
  @ApiProperty({ description: 'Admin Email', example: 'example@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
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
  phone: string;

  @Expose()
  businessName: string;

  @Expose()
  position: string;

  @Expose()
  displayPicture: string;

  @Expose()
  businessAddress: string;

  @Expose()
  idNumber: string;

  @Expose()
  identificationType: IdentificationType;

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
  const userDto = plainToClass(UserDto, {
    ...user,
    isce_permissions: user.isce_permissions || {},
    business_permissions: user.business_permissions || {}
  }, { excludeExtraneousValues: true });

  return userDto;
}
