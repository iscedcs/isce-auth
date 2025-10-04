// create-device.dto.ts
import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export enum DeviceType {
    CARD = "6214bdef7dbcb",
    WRISTBAND = "6214bdef6dbcb",
    STICKER = "6214bdef5dbcb"
}
export class CreateDeviceDto {
  @ApiProperty({
    description: 'ID of the user that owns the device',
    example: 'abc123-user-uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Unique product ID associated with the device (e.g. NFC UID)',
    example: 'prod789-nfc-tag',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Type of device being registered',
    enum: DeviceType,
    example: DeviceType.CARD,
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;
}


export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {
  @ApiPropertyOptional({
    description: 'Label for the device (optional)',
    example: 'Ted’s Smart Watch',
  })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({
    description: 'Whether the device is currently active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is the user’s primary device',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'The timestamp when the device was assigned',
    example: '2025-06-08T14:30:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @ApiPropertyOptional({
    description: 'The last time the device was used',
    example: '2025-06-08T14:45:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  lastUsedAt?: string;

  @ApiPropertyOptional({
    description: 'Type of the device',
    enum: DeviceType,
    example: DeviceType.WRISTBAND,
  })
  @IsOptional()
  @IsEnum(DeviceType)
  deviceType?: DeviceType;
}

// Token-related DTOs
export class RequestDeviceTokenDto {
  @ApiProperty({
    description: 'Email address to send the verification token to',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'ID of the user requesting the token',
    example: 'abc123-user-uuid',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Type of device being registered',
    enum: DeviceType,
    example: DeviceType.CARD,
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({
    description: 'Unique product ID associated with the device',
    example: 'prod789-nfc-tag',
  })
  @IsString()
  productId: string;
}

export class VerifyDeviceTokenDto {
  @ApiProperty({
    description: '6-character alphanumeric verification token',
    example: 'A1B2C3',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'ID of the user verifying the token',
    example: 'abc123-user-uuid',
  })
  @IsString()
  userId: string;
}