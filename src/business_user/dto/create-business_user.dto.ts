import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches, IsNotEmpty } from 'class-validator';
import { IdentificationType } from '@prisma/client';

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
}