import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { BusinessUserModule } from './business_user/business_user.module';

@Module({
  imports: [
    UserModule, 
    AuthModule, 
    DatabaseModule,
    BusinessUserModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
