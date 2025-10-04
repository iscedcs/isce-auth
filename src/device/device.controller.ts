import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { DeviceService } from './device.service';
import { TokenService } from './token.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDeviceDto, DeviceType, UpdateDeviceDto, RequestDeviceTokenDto, VerifyDeviceTokenDto } from './dto/device.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserType } from '@prisma/client';

@ApiTags('Devices')
@Controller('device')
export class DeviceController {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly tokenService: TokenService,
    ) {}


@Post('create')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')  
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Register a new device for a user' })
@ApiResponse({
    status: 201,
    description: 'Device created successfully',
    schema: {
      example: {
        message: 'Device created successfully',
        data: {
          id: 'uuid-device-id',
          userId: 'uuid-user-id',
          type: 'WATCH',
          productId: 'product-123',
          isPrimary: true,
          isActive: true,
          assignedAt: '2025-06-08T12:00:00.000Z',
          lastUsedAt: null,
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Device with this productId already exists' })
  @ApiResponse({ status: 500, description: 'Something went wrong during device creation' })
  @ApiBody({ type: CreateDeviceDto })
  async createDevice(@Body(ValidationPipe) dto: CreateDeviceDto) {
    return await this.deviceService.createDevice(dto);
  }


  @Get('one/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserType.ADMIN)
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get device by Id' })
  @ApiParam({ name: 'id', type: String, description: 'Device ID (UUID)' })
  async getDeviceById(@Param('id', ParseUUIDPipe) id: string) {
    return this.deviceService.getDeviceById(id);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  @Roles(UserType.ADMIN)
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get all devices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getAllDevices(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deviceService.getAllDevices(page, limit);
  }

  @Get('/user/:userId')
  @UseGuards(JwtAuthGuard)
// @Roles(UserType.ADMIN)
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Get all devices for a user' })
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getDevicesByUserId(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deviceService.getDevicesByUserId(userId, page, limit);
  }

  @Get('/type/:deviceType')
  @UseGuards(JwtAuthGuard)
// @Roles(UserType.ADMIN)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get devices by type' })
  @ApiParam({ name: 'deviceType', enum: DeviceType })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
   getDevicesByType(
    @Param('deviceType') deviceType: DeviceType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.deviceService.getDevicesByType(deviceType, page, limit);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard)
// @Roles(UserType.ADMIN)
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Update a device' })
  @ApiParam({ name: 'id', type: String, description: 'Device ID to update' })
  @ApiBody({ type: UpdateDeviceDto })
   updateDevice(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.deviceService.updateDevice(id, dto);
  }

  // Token verification endpoints
  @Post('request-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a device verification token' })
  @ApiResponse({
    status: 200,
    description: 'Verification token sent to email',
    schema: {
      example: {
        success: true,
        message: 'Verification token sent to your email',
        data: {
          tokenId: 'uuid-token-id',
          expiresAt: '2025-01-15T12:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid request or device already exists' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: RequestDeviceTokenDto })
  async requestDeviceToken(@Body(ValidationPipe) dto: RequestDeviceTokenDto) {
    return await this.tokenService.requestDeviceToken(dto);
  }

  @Post('verify-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify device token and create device' })
  @ApiResponse({
    status: 200,
    description: 'Device created successfully after token verification',
    schema: {
      example: {
        success: true,
        message: 'Device created successfully after token verification',
        data: {
          device: {
            id: 'uuid-device-id',
            userId: 'uuid-user-id',
            type: '6214bdef7dbcb',
            productId: 'prod789-nfc-tag',
            isPrimary: true,
            isActive: true,
            assignedAt: '2025-01-15T12:00:00.000Z',
            lastUsedAt: null,
          },
          tokenId: 'uuid-token-id',
          verifiedAt: '2025-01-15T12:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid token, expired, or already used' })
  @ApiResponse({ status: 401, description: 'Token not assigned to this user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({ type: VerifyDeviceTokenDto })
  async verifyDeviceToken(@Body(ValidationPipe) dto: VerifyDeviceTokenDto) {
    return await this.tokenService.verifyDeviceToken(dto);
  }

}
