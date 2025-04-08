import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class BusinessPermissionsDto {
  @ApiProperty({ default: false }) @IsOptional() invoicing?: boolean;
  @ApiProperty({ default: false }) @IsOptional() appointment?: boolean;
  @ApiProperty({ default: false }) @IsOptional() chat?: boolean;
  @ApiProperty({ default: false }) @IsOptional() analytics?: boolean;
  @ApiProperty({ default: false }) @IsOptional() services?: boolean;
}
