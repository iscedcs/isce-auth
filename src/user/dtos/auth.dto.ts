import { UserType } from "@prisma/client";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";


export class SignupDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(10)
    @IsNotEmpty()
    phone: string;

    @IsString()
    address: string;

    @IsString()
    @MinLength(5)
    password: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    productKey?: string;
}

export class SigninDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class GenerateProductKeyDto {
    @IsEmail()
    email: string;

    @IsEnum(UserType)
    userType: UserType
}