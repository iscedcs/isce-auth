import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { NotFoundError } from 'rxjs';

@Injectable()
export class MailService {
  private transporter: { sendMail: (arg0: { from: string; to: string; subject: string; text: string; html: string; }) => any; };

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail', // Or use SMTP server details
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendResetPasswordEmail(to: string, resetCode: string) {
    try {
        if (!resetCode) {
            throw new NotFoundException("Invalid Request");
        }
        // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
        const mailOptions = {
        from: '"ISCE AUTH" osiobeted@gmail.com',
        to,
        subject: 'Reset Your Password',
        text: `Here is your Reset Code: ${resetCode}`,
        html: `<p>Here is your Reset Code ${resetCode} to reset your password.</p>`,
        };
        return await this.transporter.sendMail(mailOptions);
        
    } catch (error) {
        throw new HttpException(error.message || 'Invalid code or request', HttpStatus.BAD_REQUEST);
    }
    
  }



  async sendAdminCodeEmail(to: string, code: string) {
    try {
        if (!code) {
            throw new NotFoundException("Invalid Request");
        }
        // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
        const mailOptions = {
        from: '"ISCE AUTH" osiobeted@gmail.com',
        to,
        subject: 'ADMIN REGISTRATION CODE',
        text: `Here is your Admin Registration Code: ${code}`,
        html: `<p>Here is your Admin Registration Code ${code} to register your Admin account, it expires in 30 minutes.</p>`,
        };
        return await this.transporter.sendMail(mailOptions);
        
    } catch (error) {
        throw new HttpException(error.message || 'Invalid code or request', HttpStatus.BAD_REQUEST);
    }
  }


    
    async sendVerifyEmail(to: string, code: string) {
      try {
          if (!code) {
              throw new NotFoundException("Invalid Request");
          }
          // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
          const mailOptions = {
          from: '"ISCE AUTH" osiobeted@gmail.com',
          to,
          subject: 'VERIFY EMAIL CODE',
          text: `Here is your Verify Email Code: ${code}`,
          html: `<p>Here is your Email Verification Code ${code} to verify your email, it expires in 5 minutes.</p>`,
          };
          return await this.transporter.sendMail(mailOptions);
          
      } catch (error) {
          throw new HttpException(error.message || 'Invalid code or request', HttpStatus.BAD_REQUEST);
      }
  }

  async sendDeviceVerificationToken(to: string, token: string, deviceType: string) {
    try {
        if (!token) {
            throw new NotFoundException("Invalid Request");
        }
        
        const deviceTypeMap = {
          "6214bdef7dbcb": "Card",
          "6214bdef6dbcb": "Wristband", 
          "6214bdef5dbcb": "Sticker"
        };
        
        const deviceName = deviceTypeMap[deviceType] || "Device";
        
        const mailOptions = {
        from: '"ISCE AUTH" osiobeted@gmail.com',
        to,
        subject: 'Device Verification Token',
        text: `Here is your device verification token: ${token}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Device Verification</h2>
            <p>You have requested to add a new ${deviceName} to your account.</p>
            <p>Use the verification token below to complete the device registration:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; letter-spacing: 4px; margin: 0;">${token}</h1>
            </div>
            <p><strong>Important:</strong></p>
            <ul>
              <li>This token expires in 30 minutes</li>
              <li>Use this token only once</li>
              <li>Do not share this token with anyone</li>
            </ul>
            <p>If you did not request this device registration, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated message from ISCE AUTH system.</p>
          </div>
        `,
        };
        return await this.transporter.sendMail(mailOptions);
        
    } catch (error) {
        throw new HttpException(error.message || 'Invalid token or request', HttpStatus.BAD_REQUEST);
    }
}


  
}
