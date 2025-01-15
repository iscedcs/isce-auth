import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service'; 
import { RegisterDto, ResetPasswordDto, transformToUserDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
// import { jwtSecret } from 'src/utils/constants';
import { Request, Response } from 'express';
import { MailService } from './mail.service';
import { Role, User } from '@prisma/client';
import { BADFAMILY } from 'dns';
// import moment from 'moment';
// import { parse, format } from 'date-fns';
import { generateCode } from '../utils/utils';

@Injectable()
export class AuthService {
    constructor(
      private databaseService: DatabaseService, 
      private mailService: MailService, 
      private jwt: JwtService) {}


      // Step 2: Request Email Verification Code
  async requestVerifyEmailCode(email: string) {
    try {
      const formattedEmail = email.toLowerCase();

      const existingUser = await this.databaseService.user.findUnique({
        where: { email: formattedEmail },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists with this email.');
      }

      const verifyCode = generateCode(); // Generate a random code

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // Code expires in 5 minutes

      const emailVerificationRecord = await this.databaseService.emailVerify.upsert({
        where: { email: formattedEmail },
        update: { verifyCode, expiresAt, isVerified: false},
        create: { email: formattedEmail, verifyCode, expiresAt, isVerified: false },
      });

      // Send the verification code to the user's email
      await this.mailService.sendVerifyEmail(email, emailVerificationRecord.verifyCode);

      return { success: true, message: 'Email verification code sent to email.' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to request email verification.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Step 3: Verify Email Code
  async verifyEmailCode(email: string, code: string) {
    try {
      const formattedEmail = email.toLowerCase();

      const existingUser = await this.databaseService.user.findUnique({
        where: { email: formattedEmail },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists with this email.');
      }

      const verificationRecord = await this.databaseService.emailVerify.findUnique({
        where: { email: formattedEmail },
      });

      if (!verificationRecord) {
        throw new BadRequestException('Invalid email or code.');
      }

      const currentTime = new Date();
      if (verificationRecord.expiresAt < currentTime) {
        throw new BadRequestException('Verification code has expired.');
      }

      if (verificationRecord.verifyCode !== code) {
        throw new BadRequestException('Invalid verification code.');
      }

      const updatedEmailRecord = await this.databaseService.emailVerify.update({
        where: { email: verificationRecord.email },
        data: { isVerified: true }
      })

      return { success: true, message: 'Email verified successfully.', data: updatedEmailRecord };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to verify email.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }



    async signup(dto: RegisterDto) {
        try {
            const { fullname, email, phone, password, confirmpassword, dob } = dto;

            const formattedEmail = email.toLowerCase();

            const foundUser = await this.databaseService.user.findUnique({ where: { email: formattedEmail } });

            if (foundUser) {
                throw new BadRequestException('Email already exists');
            }

            const emailRecord = await this.databaseService.emailVerify.findUnique({
              where: { email: formattedEmail }
            })
      
            if (!emailRecord || emailRecord.isVerified === false) {
              throw new BadRequestException('Email is not verified. Verify and try again.')
            }

            // Check password confirmation
            if (password !== confirmpassword) {
              throw new BadRequestException('Passwords do not match.');
            }
            const hashedPassword = await this.hashPassword(password);

            let formattedDob: string;
            let utcDob: Date;

            if (dob) {
              // If already a Date object, format it
              formattedDob = dob.toISOString().split('T')[0];
              // If dob is a string, parse it to a Date
              const parsedDob = new Date(dob);

              if (isNaN(parsedDob.getTime())) {
                throw new Error('Invalid date format for dob');
              }

              utcDob = new Date(Date.UTC(parsedDob.getFullYear(), parsedDob.getMonth(), parsedDob.getDate()));

              console.log('utcDob', utcDob);
            }

             const user = await this.databaseService.user.create({
                data: {
                    fullname: fullname,
                    phone: phone,
                    email: formattedEmail,
                    dob: utcDob,
                    password: hashedPassword,
                    role: "USER",
                }
            });

            // Transform user to DTO for the response
            const userDto = transformToUserDto(user);
            return {
              success: true,
              message: 'Sign up successful',
              user: userDto,
            }
        } catch (error) {
            throw new HttpException(error.message || 'Invalid token or request', HttpStatus.BAD_REQUEST);    
        }
    }
    




    async signin(dto: LoginDto, req: Request, res: Response) {

        try {
            const {email, password} = dto;

            const formattedEmail = email.toLowerCase();


            const foundUser = await this.databaseService.user.findUnique({ where: { email: formattedEmail } });

            if (!foundUser) {
                throw new BadRequestException('Email does not exists');
            }

            if (foundUser.password === null) {
              throw new BadRequestException('Reset your password to use the wallet app.');
            }

            console.log('FOUNDUSER', foundUser);

            const isMatch = await this.comparePasswords({password, hash: foundUser.password});
            console.log('ISMATCH', isMatch);
            if (!isMatch) {
                throw new BadRequestException('Incorrect Password');
            }

            const token = await this.signToken(foundUser);

            if (!token) {
                throw new ForbiddenException()
            }

            console.log('TOKEN', token);

            res.cookie('token', token);

            return res.send( `Signed in Successfully jwtToken: ${token}`,);
            
        } catch (error) {
            throw new HttpException(error.message || 'Invalid token or request', HttpStatus.BAD_REQUEST);            
        }
        
    }


    async signinEvents(dto: LoginDto, req: Request, res: Response) {

      try {
          const {email, password} = dto;

          const formattedEmail = email.toLowerCase();


          const foundUser = await this.databaseService.user.findUnique({ where: { email: formattedEmail } });

          if (!foundUser) {
              throw new BadRequestException('Email does not exists');
          }

          if (foundUser.password === null) {
            throw new BadRequestException('Reset your password to use the wallet app.');
          }

          console.log('FOUNDUSER', foundUser);

          if (password === foundUser.password) {
            const token = await this.signToken(foundUser);

          if (!token) {
              throw new ForbiddenException()
          }

          console.log('TOKEN', token);
          console.log('Successful');

          res.cookie('token', token);

          return res.send({
            message: "Successfully signed in",
            success: true,
            token: token
          });
          } else {
            console.log('Incorrect Password');
            throw new BadRequestException('Incorrect Password');
          }
          // console.log('ISMATCH', isMatch);
          // if (!isMatch) {
          //     throw new BadRequestException('Incorrect Password');
          // }

          
          
      } catch (error) {
          throw new HttpException(error.message || 'Invalid token or request', HttpStatus.BAD_REQUEST);            
      }
      
  }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { resetCode, newPassword } = resetPasswordDto;
    
        try {
          // Verify the token
          // const payload = this.jwt.verify(token, { secret: process.env.JWT_SECRET });

          const passwordReset = await this.databaseService.passwordReset.findFirst({
            where: { resetCode }, // Ensure the code is not expired
          });

          if (!passwordReset) {
            throw new HttpException('Invalid reset code', HttpStatus.BAD_REQUEST);
          }

          const currentTime = new Date();
          if (passwordReset.expiresAt < currentTime) {
            throw new HttpException('Reset code has expired', HttpStatus.BAD_REQUEST);
          }
    
          // Fetch user by token payload
          // const user = await this.databaseService.user.findUnique({
          //   where: { id: payload.userId },
          // });
    
          // if (!user) {
          //   throw new HttpException('User not found', HttpStatus.NOT_FOUND);
          // }
    
          // Hash the new password
          const hashedPassword = await bcrypt.hash(newPassword, 10);
    
          // Update user's password
          await this.databaseService.user.update({
            where: { id: passwordReset.userId },
            data: { password: hashedPassword },
          });

          // Delete the reset code after successful reset
          await this.databaseService.passwordReset.delete({ where: { id: passwordReset.id } });
    
          return { success: true, message: 'Password has been reset successfully' };
        } catch (error) {
          throw new HttpException(error.message || 'Invalid code or request', HttpStatus.BAD_REQUEST);
        }
    }

    async sendResetToken(email: string) {
        try {
          const user = await this.databaseService.user.findUnique({ where: { email } });
    
          if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
          }
    
          // Generate a 6-digit code
          const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

          // const token = this.jwt.sign(
          //   { userId: user.id },
          //   { secret: process.env.JWT_SECRET });

          const expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 15);

          // Check if a reset code already exists for this user
          const existingReset = await this.databaseService.passwordReset.findUnique({
            where: { userId: user.id },
          });

          if (existingReset) {
            // Update the existing reset code and expiration time
            await this.databaseService.passwordReset.update({
              where: { userId: user.id },
              data: { resetCode: resetCode, expiresAt: expiresAt },
            });
          } else {
            // Create a new reset code record
            await this.databaseService.passwordReset.create({
              data: { userId: user.id, resetCode: resetCode, expiresAt: expiresAt },
            });
          }
    
          console.log(`Reset code for ${email}: ${resetCode}`);
          await this.mailService.sendResetPasswordEmail(email, resetCode);

          // You can integrate a mail service here (e.g., SendGrid, Nodemailer)
          // await this.mailService.sendResetPasswordEmail(email, token);
    
          return { success: true, message: 'Reset code sent to email' };
        } catch (error) {
          throw new HttpException(error.message || 'Unable to process request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async singout(req: Request, res: Response) {
        res.clearCookie('token');
        return res.send({ message: 'Logged out successfully' });
    }

    async hashPassword(password:string) {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        return hashedPassword;
    }

    async comparePasswords(args: { password: string, hash: string }) {
        return await bcrypt.compare(args.password, args.hash);
    }

    async signToken(user: User) {
        const payload = user;

        return this.jwt.signAsync(payload, { secret: process.env.JWT_SECRET });
    }
}
