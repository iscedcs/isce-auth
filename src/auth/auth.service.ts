import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service'; 
import { CreateUserDto, RegisterDto, ResetPasswordDto, transformToUserDto, UserDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { MailService } from './mail.service';
import { UserType, User, IdentificationType } from '@prisma/client';
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
                update: { verifyCode, expiresAt, isVerified: false },
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
            });

            return { 
                success: true, 
                message: 'Email verified successfully.', 
                data: updatedEmailRecord 
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to verify email.',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async verifyAdminEmail(superAdminId: string, adminEmail: string) {
        try {
            // Verify the creator is a SUPER_ADMIN
            const superAdmin = await this.databaseService.user.findUnique({
                where: { id: superAdminId }
            });

            if (!superAdmin || superAdmin.userType !== UserType.SUPER_ADMIN) {
                throw new UnauthorizedException('Only Super Admin can verify admin emails');
            }

            const formattedEmail = adminEmail.toLowerCase();

            // Check if email already exists
            const existingUser = await this.databaseService.user.findUnique({
                where: { email: formattedEmail }
            });

            if (existingUser) {
                throw new BadRequestException('Email already exists');
            }

               // Create email verification record
               const verifyCode = generateCode();
               const expiresAt = new Date();
               expiresAt.setMinutes(expiresAt.getMinutes() + 5);
   
               await this.databaseService.emailVerify.upsert({
                   where: { email: formattedEmail },
                   update: { 
                       verifyCode, 
                       expiresAt, 
                       isVerified: true,
                       // Removed userType as it is not a valid property
                   },
                   create: { 
                       email: formattedEmail, 
                       verifyCode, 
                       expiresAt, 
                       isVerified: true,
                   },
               });

               // Send verification email to admin
            await this.mailService.sendVerifyEmail(formattedEmail, verifyCode);

            return {
                success: true,
                message: 'Admin email verified successfully. Admin can now complete registration.',
                email: formattedEmail
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to verify admin email',
                HttpStatus.BAD_REQUEST
            );
    }
        }

    async verifyUserEmail(userId: string, verificationCode: string) {
            try {
                const user = await this.databaseService.user.findUnique({
                    where: { id: userId }
                });
        
                if (!user) {
                    throw new BadRequestException('User not found');
                }
        
                if (user.isEmailVerified) {
                    throw new BadRequestException('Email is already verified');
                }
        
                const emailVerification = await this.databaseService.emailVerify.findFirst({
                    where: { 
                        email: user.email,
                        verifyCode: verificationCode
                    }
                });
        
                if (!emailVerification) {
                    throw new BadRequestException('Invalid verification code');
                }
        
                if (emailVerification.expiresAt < new Date()) {
                    throw new BadRequestException('Verification code has expired');
                }
        
                // Update user email verification status
                const updatedUser = await this.databaseService.user.update({
                    where: { id: userId },
                    data: { isEmailVerified: true }
                });
        
                return {
                    success: true,
                    message: 'Email verified successfully',
                    user: transformToUserDto(updatedUser)
                };
            } catch (error) {
                throw new HttpException(
                    error.message || 'Failed to verify email',
                    HttpStatus.BAD_REQUEST
                );
            }
        }
        
        async sendVerificationEmail(userId: string) {
            try {
                const user = await this.databaseService.user.findUnique({
                    where: { id: userId }
                });
        
                if (!user) {
                    throw new BadRequestException('User not found');
                }
        
                if (user.isEmailVerified) {
                    throw new BadRequestException('Email is already verified');
                }
        
                const verifyCode = generateCode();
                const expiresAt = new Date();
                expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        
                // Create or update email verification record
                await this.databaseService.emailVerify.upsert({
                    where: { email: user.email },
                    update: { 
                        verifyCode, 
                        expiresAt, 
                        isVerified: false 
                    },
                    create: { 
                        email: user.email, 
                        verifyCode, 
                        expiresAt, 
                        isVerified: false 
                    }
                });
        
                // Send verification email
                await this.mailService.sendVerifyEmail(user.email, verifyCode);
        
                return {
                    success: true,
                    message: 'Verification email sent successfully'
                };
            } catch (error) {
                throw new HttpException(
                    error.message || 'Failed to send verification email',
                    HttpStatus.BAD_REQUEST
                );
            }
        }



        async signupUser(dto: CreateUserDto) {
            try {
            const { email, phone, password, firstName, lastName } = dto;

            dto.email = dto.email.toLowerCase();

            dto.firstName = dto.firstName.toUpperCase();
            dto.lastName = dto.lastName.toUpperCase();

            // 💥 Check for existing user
            const existingUser = await this.databaseService.user.findFirst({
                where: {
                OR: [{ email }, { phone }],
                },
            });

            if (existingUser) {
                throw new ConflictException('User with provided email or phone already exists');
            }

            // 🔐 Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // 🧑 Create user
            const newUser = await this.databaseService.user.create({
                data: {
                email,
                phone,
                password: hashedPassword,
                firstName,
                lastName,
                },
                select: {
                id: true,
                email: true,
                phone: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                },
            });

            return {
                success: true,
                message: 'User signed up successfully',
                data: newUser,
            };
            } catch (error) {
            throw new HttpException(
                error.message || 'Failed to sign up user',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
            }
        }


    async signup(dto: RegisterDto, userType: UserType) {
      return this.createUserByType(dto, userType);
  }

    private async createUserByType(
        data: RegisterDto | UserDto,
        userType: UserType,
        skipEmailVerification = false,
    ) {
        try {
            const { 
                email, phone, password, confirmpassword, displayPicture,
                businessAddress, businessEmail,  businessName, identificationType,
                position, firstName, lastName, idNumber, address, dob
                } = data as RegisterDto;

            const formattedEmail = email.toLowerCase();

            // Check if the user already exists
            const existingUser = await this.databaseService.user.findFirst({ 
                where: {
                    OR: [
                        { email: formattedEmail },
                        { phone: phone }
                    ] 
                }
            });

            if (existingUser) {
                if (existingUser.email === formattedEmail) {
                    throw new BadRequestException('Email already exists');
                }
                if (existingUser.phone === phone) {
                    throw new BadRequestException('Phone number already exists');
                }
            }
            const emailRecord = await this.databaseService.emailVerify.findUnique({
                where: { email: formattedEmail }
            });

        // Only check email verification for ADMIN users
        if (userType === UserType.ADMIN) {
            const emailRecord = await this.databaseService.emailVerify.findUnique({
                where: { email: formattedEmail }
            });

            if (!emailRecord || !emailRecord.isVerified) {
                throw new BadRequestException('Admin email must be verified by Super Admin first.');
            }
        }

        // Check password confirmation
        if (password !== confirmpassword) {
            throw new BadRequestException('Passwords do not match.');
        }
        const hashedPassword = await this.hashPassword(password);

        // Base user data
        let userData: any = {
            email: formattedEmail,
            phone,
            firstName: firstName || null,
            lastName: lastName || null,
            displayPicture: displayPicture || null,
            address: address || null,
            password: hashedPassword,
            userType,
            isEmailVerified: userType === UserType.ADMIN
        };

         // Add businessEmail for BUSINESS_USER
         if (userType === UserType.BUSINESS_USER) {
            if (!businessEmail) {
                throw new BadRequestException('Business users must provide a business email');
            }
            userData.businessEmail = businessEmail;
        }

        // Add identificationType only for BUSINESS_USER
        // if (userType === UserType.BUSINESS_USER) {
        //     if (!identificationType) {
        //         throw new BadRequestException('Business users must provide identification type');
        //     }
        //     userData.identificationType = identificationType;
        // }

            // Add permissions based on user type
        switch (userType) {
            case UserType.USER:
                Object.assign(userData, {
                    isce_permissions: {
                        create: {
                            connect: true,
                            connect_plus: false,
                            store: false,
                            wallet: false,
                            event: true,
                            access: false
                        }
                    }
                });
                    break;

                    case UserType.BUSINESS_USER:
                        const { 
                            businessName, identificationType, businessEmail, position,
                            firstName, lastName, idNumber, dob, address,
                            businessAddress, displayPicture
                        } = data as RegisterDto;
                        if (!businessName || !identificationType || !businessEmail) {
                            throw new BadRequestException("Business users must provide business name and identification type")
                        }
                        Object.assign(userData, {
                            firstName,
                            lastName,
                            address,
                            dob,
                            idNumber,
                            businessName,
                            businessAddress,
                            displayPicture,
                            businessEmail,
                            position,
                            identificationType,
                            isBusinessAdmin: true,
                            isce_permissions: {
                                create: {
                                    connect: true,
                                    connect_plus: true,
                                    store: true,
                                    wallet: true,
                                    event: true,
                                    access: false
                                }
                            },
                            business_permissions: {
                                create: {
                                    invoicing: true,
                                    appointment: true,
                                    chat: true,
                                    analytics: true,
                                    services: true
                                }
                            }
                        });
                    break;

                    case UserType.SUPER_ADMIN:
                        Object.assign(userData, {
                            firstName: 'Super',
                            lastName: 'Admin',
                            idNumber: 'SUPER_ADMIN_ID',
                            isce_permissions: {
                                create: {
                                    connect: true,
                                    connect_plus: true,
                                    store: true,
                                    wallet: true,
                                    event: true,
                                    access: true
                                }
                            }
                        });
                    break;

                    case UserType.EMPLOYEE:
                        Object.assign(userData, {
                            firstName: firstName || null,
                            lastName: lastName || null,
                            idNumber: idNumber || null,
                            address: address || null,
                            dob: dob || null,
                            position: position || null,
                            identificationType: identificationType || IdentificationType.NIN,
                            displayPicture: displayPicture || null,
                            isce_permissions: {
                                create: {
                                    connect: true,
                                    connect_plus: false,
                                    store: false,
                                    wallet: true,
                                    event: false,
                                    access: false
                                }
                            },
                            business_permissions: {
                                create: {
                                    invoicing: false,
                                    appointment: true,
                                    chat: true,
                                    analytics: false,
                                    services: true
                                }
                            }
                        });
                    break;

                    case UserType.ADMIN:
                        Object.assign(userData, {
                            firstName: firstName || null,
                            lastName: lastName || null,
                            idNumber: idNumber || null,
                            address: address || null,
                            dob: dob || null,
                            displayPicture: displayPicture || null,
                            isce_permissions: {
                                create: {
                                    connect: true,
                                    connect_plus: true,
                                    store: true,
                                    wallet: true,
                                    event: true,
                                    access: true
                                }
                            }
                        });
                    break;
            }

            let utcDob: Date | null = null;
            if (dob) {
                const parsedDob = new Date(dob);
                if (isNaN(parsedDob.getTime())) {
                    throw new Error('Invalid date format for dob');
                }
                utcDob = new Date(Date.UTC(
                    parsedDob.getFullYear(), 
                    parsedDob.getMonth(), 
                    parsedDob.getDate()
                ));
            }

            userData.dob = utcDob;

            // Create user
            const createdUser = await this.databaseService.user.create({ 
                data: userData,
                include: {
                    isce_permissions: true,
                    business_permissions: true
                }
             });

            const accessToken = await this.signToken(createdUser);

            // Transform user to DTO
            // const userDto = transformToUserDto(createdUser);

            const name = `${createdUser.firstName || ''} ${createdUser.lastName || ''}`.trim() || 'User';
            
            return {
                success: true,
                status: HttpStatus.CREATED,
                message: `${userType} created successfully`,
                data: {
                    accessToken,
                    email: createdUser.email,
                    userType: createdUser.userType,
                    businessEmail: createdUser.businessEmail || null,
                    username: name,
                    displayPicture: createdUser.displayPicture || null,
                    permissions: {
                        isce: createdUser.isce_permissions,
                        business: createdUser.business_permissions
                    }
                }
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Invalid token or request', 
                HttpStatus.BAD_REQUEST
            );    
        }
}

    async signin(dto: LoginDto, req: Request, res: Response) {
        try {
            const { email, password } = dto;
            const formattedEmail = email.toLowerCase();

            const foundUser = await this.databaseService.user.findUnique({
                 where: { 
                    email: formattedEmail
                 },
                 include: {
                    isce_permissions: true,
                    business_permissions: true
                 }
             });

            if (!foundUser) {
                throw new BadRequestException('Email does not exists');
            }

            if (foundUser.password === null) {
                throw new BadRequestException('Reset your password to use the wallet app.');
            }

            console.log('FOUNDUSER', foundUser);

            const isMatch = await this.comparePasswords({ password, hash: foundUser.password });
            console.log('ISMATCH', isMatch);
            if (!isMatch) {
                throw new BadRequestException('Incorrect Password');
            }

            const accessToken = await this.signToken(foundUser);

            if (!accessToken) {
                throw new ForbiddenException();
            }

            console.log('TOKEN', accessToken);

            res.cookie('token', accessToken);

            const name = `${foundUser.firstName || ''} ${foundUser.lastName || ''}`.trim() || 'User';

            return res.json({
                success: true,
                status: HttpStatus.OK,
                message: 'Signed in successfully',
                data: {
                    accessToken,
                    id: foundUser.id,
                    email: foundUser.email,
                    userType: foundUser.userType,
                    username: name,
                    displayPicture: foundUser.displayPicture || null,
                    permissions: {
                        isce: foundUser.isce_permissions,
                        business: foundUser.business_permissions
                    }
                }
            });
        } catch (error) {
            throw new HttpException(
                error.message || 'Invalid credentials',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async signinEvents(dto: LoginDto, req: Request, res: Response) {
        try {
            const { email, password } = dto;
            const formattedEmail = email.toLowerCase();

            const foundUser = await this.databaseService.user.findUnique({ 
                where: { email: formattedEmail, deletedAt: null },
                include: {
                    isce_permissions: true,
                    business_permissions: true
                } 
            });

            if (!foundUser) {
                throw new BadRequestException('Email does not exists');
            }

            if (foundUser.password === null) {
                throw new BadRequestException('Reset your password to use the app.');
            }

            console.log('FOUNDUSER', foundUser);

            if (password === foundUser.password) {
                const token = await this.signToken(foundUser);

                if (!token) {
                    throw new ForbiddenException();
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
        } catch (error) {
            throw new HttpException(error.message || 'Invalid token or request', HttpStatus.BAD_REQUEST);
        }
    }

    async resetPassword(resetPasswordDto: ResetPasswordDto) {
        const { resetCode, newPassword } = resetPasswordDto;

        try {
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

            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await this.databaseService.user.update({
                where: { id: passwordReset.userId },
                data: { password: hashedPassword },
            });

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

            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 15);

            const existingReset = await this.databaseService.passwordReset.findUnique({
                where: { userId: user.id },
            });

            if (existingReset) {
                await this.databaseService.passwordReset.update({
                    where: { userId: user.id },
                    data: { resetCode: resetCode, expiresAt: expiresAt },
                });
            } else {
                await this.databaseService.passwordReset.create({
                    data: { userId: user.id, resetCode: resetCode, expiresAt: expiresAt },
                });
            }

            console.log(`Reset code for ${email}: ${resetCode}`);
            await this.mailService.sendResetPasswordEmail(email, resetCode);

            return { success: true, message: 'Reset code sent to email' };
        } catch (error) {
            throw new HttpException(error.message || 'Unable to process request', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async singout(req: Request, res: Response) {
        res.clearCookie('token');
        return res.send({ message: 'Logged out successfully' });
    }

    async hashPassword(password: string) {
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        return hashedPassword;
    }

    async comparePasswords(args: { password: string, hash: string }) {
        return await bcrypt.compare(args.password, args.hash);
    }

    async getAdminStats(superAdminId: string) {
        try {
            const superAdmin = await this.databaseService.user.findUnique({
                where: { id: superAdminId }
            });

            if (!superAdmin || superAdmin.userType !== UserType.SUPER_ADMIN) {
                throw new UnauthorizedException('Only Super Admin can view admin stats');
            }

            const adminCount = await this.databaseService.user.count({
                where: { userType: UserType.ADMIN }
            });

            const activeAdmins = await this.databaseService.user.count({
                where: { 
                    userType: UserType.ADMIN,
                    isBlocked: false
                }
            });

            const blockedAdmins = await this.databaseService.user.count({
                where: { 
                    userType: UserType.ADMIN,
                    isBlocked: true
                }
            });

            return {
                success: true,
                stats: {
                    total: adminCount,
                    active: activeAdmins,
                    blocked: blockedAdmins
                }
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to get admin stats',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async blockAdmin(superAdminId: string, adminId: string) {
        try {
            const superAdmin = await this.databaseService.user.findUnique({
                where: { id: superAdminId }
            });

            if (!superAdmin || superAdmin.userType !== UserType.SUPER_ADMIN) {
                throw new UnauthorizedException('Only Super Admin can block admins');
            }

            const admin = await this.databaseService.user.findUnique({
                where: { id: adminId }
            });

            if (!admin || admin.userType !== UserType.ADMIN) {
                throw new BadRequestException('Invalid admin account');
            }

            const blockedAdmin = await this.databaseService.user.update({
                where: { id: adminId },
                data: { isBlocked: true }
            });

            
            return {
                success: true,
                message: `Admin ${blockedAdmin.email} has been blocked`
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to block admin',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async unblockAdmin(superAdminId: string, adminId: string) {
        try {
            const superAdmin = await this.databaseService.user.findUnique({
                where: { id: superAdminId }
            });

            if (!superAdmin || superAdmin.userType !== UserType.SUPER_ADMIN) {
                throw new UnauthorizedException('Only Super Admin can unblock admins');
            }

            const admin = await this.databaseService.user.findUnique({
                where: { id: adminId }
            });

            if (!admin || admin.userType !== UserType.ADMIN) {
                throw new BadRequestException('Invalid admin account');
            }

            const unblockedAdmin = await this.databaseService.user.update({
                where: { id: adminId },
                data: { isBlocked: false }
            });

            return {
                success: true,
                message: `Admin ${unblockedAdmin.email} has been unblocked`
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to unblock admin',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async deleteAdmin(superAdminId: string, adminId: string) {
        try {
            const superAdmin = await this.databaseService.user.findUnique({
                where: { id: superAdminId }
            });

            if (!superAdmin || superAdmin.userType !== UserType.SUPER_ADMIN) {
                throw new UnauthorizedException('Only Super Admin can delete admins');
            }

            const admin = await this.databaseService.user.findUnique({
                where: { id: adminId }
            });

            if (!admin || admin.userType !== UserType.ADMIN) {
                throw new BadRequestException('Invalid admin account');
            }

            const deletedAdmin = await this.databaseService.user.delete({
                where: { id: adminId }
            });

            return {
                success: true,
                message: `Admin ${deletedAdmin.email} has been deleted`
            };
        } catch (error) {
            throw new HttpException(
                error.message || 'Failed to delete admin',
                HttpStatus.BAD_REQUEST
            );
        }
    }

    async signToken(user: User) {
        const payload = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            displayPicture: user.displayPicture,
            userType: user.userType,
            password: user.password,
        };
    
        return this.jwt.signAsync(payload, { 
            secret: process.env.JWT_SECRET,
            expiresIn: '24h' // Add expiration time
        });
    }
}