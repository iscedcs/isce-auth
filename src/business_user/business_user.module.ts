import { Module } from '@nestjs/common';
import { BusinessController } from './business_user.controller';
import { BusinessService } from './business_user.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessUserModule {}
