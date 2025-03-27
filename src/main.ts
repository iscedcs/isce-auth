import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cors from 'cors'; 
import { DatabaseService } from './database/database.service';
import { IdentificationType, UserType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const databaseService = app.get(DatabaseService);

  // Ensure SUPER_ADMIN exists
  const superAdminEmail = 'superadmin@isce.com';
  const superAdminPhone = '08012345678';
  const superAdminPassword = 'password';
  const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

  const existingSuperAdmin = await databaseService.user.findFirst({ 
    where: {
       email: superAdminEmail,
       userType: UserType.SUPER_ADMIN,
      },
   });

   if (!existingSuperAdmin) {
    await databaseService.user.create({
      data: {
        email: superAdminEmail,
        phone: superAdminPhone,
        password: hashedPassword,
        userType: UserType.SUPER_ADMIN,
        identificationType: IdentificationType.NIN,
        idNumber: 'SUPER_ADMIN_ID',
      },
    });
    console.log('Super Admin created successfully');
  } else {
    console.log('Super Admin already exists');
   }
   
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    })
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://eventnest-slbg.onrender.com'], // Frontend URLs
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Include 'Authorization' if needed
    credentials: true, // Allow cookies and authorization headers
  });


  const config = new DocumentBuilder()
    .setTitle('ISCE AUTH')
    .setDescription('Authentication for ISCE product')
    .setVersion('1.0')
    .addTag('ISCE')
    .addSecurityRequirements('bearer')
    .addBearerAuth(
      { 
        description: `Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header'
      }, 
      'access-token' // The name used to reference this auth method in the Swagger UI
    )
    .build();
 const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

 const PORT = process.env.PORT || 3223;  // Ensure it uses the correct port
await app.listen(PORT);
}
bootstrap();