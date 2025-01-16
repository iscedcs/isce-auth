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
        console.log(process.env.EMAIL_PASS);
        if (!resetCode) {
            throw new NotFoundException("Invalid Request");
        }
        // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
        const mailOptions = {
        from: '"WALLET" osiobeted@gmail.com',
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
        console.log(process.env.EMAIL_PASS);
        if (!code) {
            throw new NotFoundException("Invalid Request");
        }
        // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
        const mailOptions = {
        from: '"Haulage" osiobeted@gmail.com',
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
          console.log(process.env.EMAIL_PASS);
          if (!code) {
              throw new NotFoundException("Invalid Request");
          }
          // const resetLink = `http://localhost:3000/reset-password?code=${resetCode}`;
          const mailOptions = {
          from: '"Haulage" osiobeted@gmail.com',
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


  
}
