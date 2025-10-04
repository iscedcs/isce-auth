import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TokenService } from './token.service';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseService } from 'src/database/database.service';

@Module({
  imports: [AuthModule],
  controllers: [DeviceController],
  providers: [DeviceService, TokenService, DatabaseService],
  exports: [TokenService],
})
export class DeviceModule {}
