import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { RequestDeviceTokenDto, VerifyDeviceTokenDto } from './dto/device.dto';
import { MailService } from 'src/auth/mail.service';
import * as crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Generate a unique 6-character alphanumeric token
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    
    for (let i = 0; i < 6; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      token += chars[randomIndex];
    }
    
    return token;
  }

  /**
   * Generate a unique token with collision detection
   */
  private async generateUniqueToken(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const token = this.generateToken();
      
      // Check if token already exists
      const existingToken = await this.databaseService.token.findUnique({
        where: { token },
      });

      if (!existingToken) {
        return token;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique token after multiple attempts');
  }

  /**
   * Request a device verification token
   */
  async requestDeviceToken(dto: RequestDeviceTokenDto) {
    const { email, userId, deviceType, productId } = dto;

    try {
      // 1. Verify user exists
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 2. Check if device with this productId already exists
      const existingDevice = await this.databaseService.device.findUnique({
        where: { productId },
      });

      if (existingDevice) {
        throw new BadRequestException('Device with this productId already exists');
      }

      // 3. Invalidate any existing tokens for this user
      await this.databaseService.token.updateMany({
        where: {
          assignedTo: email,
          used: false,
        },
        data: {
          used: true,
          usedAt: new Date(),
        },
      });

      // 4. Generate new token
      const token = await this.generateUniqueToken();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

      // 5. Store token in database with device information
      const tokenRecord = await this.databaseService.token.create({
        data: {
          token,
          assignedTo: email,
          expiresAt,
          deviceType,
          productId,
          userId,
        },
      });

      // 6. Send email with token
      await this.mailService.sendDeviceVerificationToken(email, token, deviceType);

      return {
        success: true,
        message: 'Verification token sent to your email',
        data: {
          tokenId: tokenRecord.id,
          expiresAt: tokenRecord.expiresAt,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to request verification token: ' + error.message);
    }
  }

  /**
   * Verify a device token and create the device
   */
  async verifyDeviceToken(dto: VerifyDeviceTokenDto) {
    const { token, userId } = dto;

    try {
      // 1. Find the token
      const tokenRecord = await this.databaseService.token.findUnique({
        where: { token },
        include: { device: true },
      });

      if (!tokenRecord) {
        throw new BadRequestException('Invalid verification token');
      }

      // 2. Check if token is already used
      if (tokenRecord.used) {
        throw new BadRequestException('Token has already been used');
      }

      // 3. Check if token is expired
      if (new Date() > tokenRecord.expiresAt) {
        throw new BadRequestException('Token has expired');
      }

      // 4. Verify user exists
      const user = await this.databaseService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // 5. Check if user email matches token assignment
      if (user.email !== tokenRecord.assignedTo) {
        throw new UnauthorizedException('Token is not assigned to this user');
      }

      // 6. Check if device with this productId still doesn't exist (double-check)
      const existingDevice = await this.databaseService.device.findUnique({
        where: { productId: tokenRecord.productId },
      });

      if (existingDevice) {
        throw new BadRequestException('Device with this productId already exists');
      }

      // 7. Check if user already has a primary device
      const hasPrimaryDevice = await this.databaseService.device.findFirst({
        where: {
          userId: tokenRecord.userId,
          isPrimary: true,
        },
      });

      const isPrimary = hasPrimaryDevice ? false : true;

      // 8. Create the device
      const newDevice = await this.databaseService.device.create({
        data: {
          userId: tokenRecord.userId,
          type: tokenRecord.deviceType,
          productId: tokenRecord.productId,
          isPrimary,
          assignedAt: new Date(),
          lastUsedAt: null,
        },
      });

      // 9. Update token with device ID and mark as used
      await this.databaseService.token.update({
        where: { id: tokenRecord.id },
        data: {
          used: true,
          usedAt: new Date(),
          deviceId: newDevice.id,
        },
      });

      return {
        success: true,
        message: 'Device created successfully after token verification',
        data: {
          device: newDevice,
          tokenId: tokenRecord.id,
          verifiedAt: new Date(),
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to verify token: ' + error.message);
    }
  }

  /**
   * Clean up expired tokens (can be called by a cron job)
   */
  async cleanupExpiredTokens() {
    try {
      const result = await this.databaseService.token.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
          used: false,
        },
      });

      return {
        success: true,
        message: `Cleaned up ${result.count} expired tokens`,
        data: { deletedCount: result.count },
      };
    } catch (error) {
      throw new BadRequestException('Failed to cleanup expired tokens: ' + error.message);
    }
  }
}
