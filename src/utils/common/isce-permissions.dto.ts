import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class IscePermissionsDto {
  @ApiProperty({ default: false }) @IsOptional() connect?: boolean;
  @ApiProperty({ default: false }) @IsOptional() connect_plus?: boolean;
  @ApiProperty({ default: false }) @IsOptional() store?: boolean;
  @ApiProperty({ default: false }) @IsOptional() wallet?: boolean;
  @ApiProperty({ default: false }) @IsOptional() event?: boolean;
  @ApiProperty({ default: false }) @IsOptional() access?: boolean;
}
