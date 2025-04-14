import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Query, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminVerifyEmailDto, EmailDto, RegisterDto, ResetPasswordDto, SendResetTokenDto, VerifyEmailDto } from './dto/auth.dto';
import { LoginDto } from './dto/auth.dto'; 
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { UserType } from '@prisma/client';
import { SuperAdminGuard } from './super-admin.guard';
import { JwtAuthGuard } from './jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-verify-email-code')
  @ApiOperation({ summary: 'Request an email verification code' })
  @ApiResponse({ status: 201, description: 'Email verification sent to your email successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.OK)
  requestVerifyEmailCode(@Body(ValidationPipe) requestVerifyEmailCodeDto: EmailDto) {
    const { email } = requestVerifyEmailCodeDto;
    return this.authService.requestVerifyEmailCode(email);
  }

  @Post('verify-email-code')
  @ApiOperation({ summary: 'Verify email verification code' })
  @ApiResponse({ status: 201, description: 'Email verification code verified successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @HttpCode(HttpStatus.OK)
  verifyEmailCode(@Body(ValidationPipe) verifyEmailDto: VerifyEmailDto) {
    const { email, code } = verifyEmailDto;
    return this.authService.verifyEmailCode(email, code);
  }

  @Post('/signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async signup(@Body(ValidationPipe) dto: RegisterDto, @Query('userType') userType: UserType) {  
    return this.authService.signup(dto, userType || UserType.USER);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({ status: 201, description: 'User signed in successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async signin(
    @Body(ValidationPipe) dto: LoginDto, 
    @Req() req: Request, 
    @Res() res: Response) {
    return this.authService.signin(dto, req, res);
  }

  @Post('signin-events')
  @ApiOperation({ summary: 'Sign in a user for events' })
  @ApiResponse({ status: 201, description: 'User signed in successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  signinEvents(
    @Body(ValidationPipe) dto: LoginDto, 
    @Req() req: Request, 
    @Res() res: Response) {
    return this.authService.signinEvents(dto, req, res);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset Password' })
  @ApiResponse({ status: 201, description: 'In progress.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  resetPassword(
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('send-reset-token')
  @ApiOperation({ summary: 'Send reset token to reset the password' })
  @ApiResponse({ status: 201, description: 'Reset token sent successfully.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  sendResetToken(
    @Body(ValidationPipe) sendResetTokenDto: SendResetTokenDto) {
    return this.authService.sendResetToken(sendResetTokenDto.email);
  }

  @Get('signout')
  @ApiOperation({ summary: 'Sign out current user' })
  @ApiResponse({ 
    status: 201, 
    description: 'Successfully cleared token from cookies and signed user out.'})
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  signout(
    @Req() req: Request, 
    @Res() res: Response) {
    return this.authService.singout(req, res);
  }

  
  @Post('verify-admin-email')
  @UseGuards(JwtAuthGuard, SuperAdminGuard)
  @ApiBearerAuth('access-token')  // Add this line
  @ApiOperation({ summary: 'Verify admin email (Super Admin only)' })
  @ApiResponse({ status: 201, description: 'Admin email verified successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async verifyAdminEmail(
      @Req() req: Request,
      @Body() adminVerifyDto: AdminVerifyEmailDto
  ) {
      return this.authService.verifyAdminEmail(req.user['id'], adminVerifyDto.email);
  }

  @Get('super-admin/admin-stats')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get admin statistics (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Statistics retrieved successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async getAdminStats(@Req() req: Request) {
        return this.authService.getAdminStats(req.user['id']);
    }

    @Post('super-admin/block-admin/:id')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Block admin (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Admin blocked successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async blockAdmin(
        @Req() req: Request,
        @Param('id') adminId: string
    ) {
        return this.authService.blockAdmin(req.user['id'], adminId);
    }

    @Post('super-admin/unblock-admin/:id')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Unblock admin (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Admin unblocked successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async unblockAdmin(
        @Req() req: Request,
        @Param('id') adminId: string
    ) {
        return this.authService.unblockAdmin(req.user['id'], adminId);
    }

    @Delete('super-admin/delete-admin/:id')
    @UseGuards(JwtAuthGuard, SuperAdminGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Delete admin (Super Admin only)' })
    @ApiResponse({ status: 200, description: 'Admin deleted successfully.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deleteAdmin(
        @Req() req: Request,
        @Param('id') adminId: string
    ) {
        return this.authService.deleteAdmin(req.user['id'], adminId);
    }
}