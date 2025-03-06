import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { IdentificationType, UserType } from '@prisma/client';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be valid',
  })
  phone: string;

  @IsOptional()
  @IsString()
  displayPicture?: string;

  @IsOptional()
  @IsString()
  organizationAddress?: string;

  @IsEnum(IdentificationType)
  identificationType: IdentificationType;

  @IsString()
  @IsNotEmpty()
  idNumber: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'Password too weak',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsOptional()  // Role is optional; if not provided, default to USER
  @IsEnum(UserType)
  role?: UserType;
}

export class LoginBusinessUserDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}