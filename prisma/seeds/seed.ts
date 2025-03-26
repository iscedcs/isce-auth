import { PrismaClient, UserType, IdentificationType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  const superAdminEmail = 'superadmin@isce.com';

  try {
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin123!', 10);
      await prisma.user.create({
        data: {
          firstName: 'Super Admin',
          lastName: 'Super Admin',
          email: superAdminEmail,
          phone: '0000000000',
          password: hashedPassword,
          userType: UserType.SUPER_ADMIN,
          identificationType: IdentificationType.NIN,
          idNumber: 'SUPER_ADMIN_ID',
        },
      });
      console.log('Super Admin Created');
    } else {
      console.log('ℹ️ Super Admin Already Exists');
    }
  } catch (error) {
    console.error('Error seeding super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmin();