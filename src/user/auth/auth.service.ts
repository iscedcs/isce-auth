import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import *as jwt from "jsonwebtoken";
import * as uuid from 'uuid';
import { UserType } from '@prisma/client';
import { UserService } from '../user.service';
import { randomBytes } from 'crypto';


interface SignupParams {
    name: string;
    email: string;
    password: string;
    address: string;
    phone: string;
}

interface SigninParams {
    email: string;
    password: string;
    userType?: "ADMIN"|"USER"
}

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly userService: UserService
    ) {}
    async signup(
        {
            email, 
            password, 
            name, 
            address, 
            phone
        }: SignupParams, userType: UserType) {
        // signup logic
        const id = uuid.v4(); // Generate a unique ID

        const userExist = await this.prismaService.user.findUnique({
            where: {
                email
            },
        });
        if (userExist) {
            throw new ConflictException
        }

        const hashpassword = await bcrypt.hash(password, 10) 

        const user = await this.prismaService.user.create({
            data: {
                id: id,
                email,
                name,
                phone,
                address, 
                password: hashpassword,
                userType: userType,
            },
        });

        return this.generateJWT(user.name, user.id);

    }

    async signin({email, password, userType}: SigninParams) {
        // signin logic
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
        });

        if (!user) {
            throw new HttpException("Invalid Credentails", 400);
        }
        if (user.userType !== userType){
            throw new HttpException(`You are an ${user.userType} you can not log in as an ${userType}`, 401);
        }

        const hashpassword = user.password;
        
        const isValidPassword = await bcrypt.compare(password, hashpassword) // Comparing password

        if (!isValidPassword) {
            throw new HttpException("Invalid Credentails", 400);
        }
        return this.generateJWT(user.name, user.id);
    }

    private generateJWT(name: string, id: string) {
        return jwt.sign({
            name,
            id,
        },
        process.env.JSON_TOKEN_KEY,
        {
            expiresIn: 3600000
        });
    }

    generateProductKey(email: string, userType: UserType) {
        const productKey = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`
        return bcrypt.hash(productKey, 10);
    }

    async requestResetPassword(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) throw new Error('User not found');
    
        const resetToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 3600000); // 1-hour expiration
    
        await this.userService.updateResetToken(user.id, resetToken, expiresAt);
    
        const resetLink = `https://your-app.com/reset-password?token=${resetToken}`;
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Password Reset Request',
          html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });
      }
    
      async resetPassword(token: string, newPassword: string) {
        const user = await this.userService.findByResetToken(token);
        if (!user) throw new Error('Invalid or expired reset token');
    
        await this.userService.updatePassword(user.id, newPassword);
      }
}
