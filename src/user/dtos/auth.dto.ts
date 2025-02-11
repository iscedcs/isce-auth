import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsDate } from "class-validator";
// import { UserType } from '../enums/user-type.enum'; // Adjust the import path as necessary
import { UserType } from '@prisma/client';

export class SignupDto {
    @ApiProperty({
        description: 'User name',
    })
    @IsString()
    @IsNotEmpty()
    fullname: string;

    @ApiProperty({
        description: 'User Email',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User Phone',
    })
    @MinLength(10)
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        description: 'User Address',
    })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'User Date of Birth',
    })
    @IsDate()
    @IsNotEmpty()
    dob: Date;

    @ApiProperty({
        description: 'User Password',
    })
    @IsString()
    @MinLength(5)
    password: string;

    @ApiProperty({
        description: 'Type of User',
    })
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    productKey?: string;
}

export class SigninDto {
    @ApiProperty({
        description: 'User Email',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'User Password',
    })
    @IsString()
    password: string;
}

export class GenerateProductKeyDto {
    @ApiProperty({
        description: 'User Email',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Type of User',
    })
    @IsEnum(UserType)
    userType: UserType;
}
