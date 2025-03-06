import { PartialType } from '@nestjs/swagger';
import { CreateBusinessDto } from './create-business_user.dto';

export class UpdateBusinessUserDto extends PartialType(CreateBusinessDto) {}
