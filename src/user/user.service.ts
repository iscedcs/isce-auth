import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiresAt: { gte: new Date() }, // Ensure token is not expired
      },
    });
  }

  async updateResetToken(id: number, resetToken: string, expiresAt: Date) {
    await this.prisma.user.update({
      where: { id },
      data: { resetToken, resetTokenExpiresAt: expiresAt },
    });
  }

  async updatePassword(id: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword, resetToken: null, resetTokenExpiresAt: null },
    });
  }
}
