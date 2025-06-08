import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateDeviceDto, DeviceType, UpdateDeviceDto } from './dto/device.dto';

@Injectable()
export class DeviceService {
    constructor(private readonly databaseService: DatabaseService) {}

    async createDevice(dto: CreateDeviceDto) {
    try {
        const { userId, productId, deviceType } = dto;
        const now = new Date();

        // 1. Check if user exists
        const user = await this.databaseService.user.findUnique({
        where: { id: userId },
        });

        if (!user) {
        throw new NotFoundException('User not found.');
        }

        // 2. Check if device with this productId already exists
        const existingDevice = await this.databaseService.device.findUnique({
        where: { productId },
        });

        if (existingDevice) {
        // Optional: include user info in the error message
        throw new ConflictException('This productId is already linked to another device.');
        }

        // 3. (Optional) Check if user already has a primary device
        const hasPrimaryDevice = await this.databaseService.device.findFirst({
        where: {
            userId,
            isPrimary: true,
        },
        });

        const isPrimary = hasPrimaryDevice ? false : true;

        // 4. Create the device
        const newDevice = await this.databaseService.device.create({
        data: {
            userId,
            type: deviceType,
            productId,
            isPrimary,
            assignedAt: now,
            lastUsedAt: null,
        },
        });

        return {
            success: true,
            message: 'Device created successfully',
            data: newDevice,
        };
    } catch (error) {
        // databaseService-specific error
        if (error.code === 'P2002') {
        throw new ConflictException('Duplicate value: This productId already exists.');
        }

        // If we threw a known Nest exception, bubble it up
        if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
        }

        console.error('Device creation error:', error);
        throw new InternalServerErrorException('Something went wrong during device creation.');
    }
    }


    async getDeviceById(id: string) {
    try {
      const device = await this.databaseService.device.findUnique({ where: { id } });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      return {
        success: true,
        message: 'Device fetched successfully',
        data: device,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve device: ' + error.message);
    }
  }

  async getAllDevices(page?: number, limit?: number) {
    try {
      const take = limit || 10;
      const skip = page ? (page - 1) * take : 0;

      const [data, total] = await Promise.all([
        this.databaseService.device.findMany({
          skip,
          take,
          orderBy: { assignedAt: 'desc' },
        }),
        this.databaseService.device.count(),
      ]);

        if (data.length === 0) {
            return {
            message: 'No devices found',
            data: [],
            meta: {
                total: 0,
                page: page || 1,
                pageSize: take,
                totalPages: 0,
            },
            };
        }

      return {
        success: true,
        message: 'Devices fetched successfully',
        data,
        meta: {
          total,
          page: page || 1,
          pageSize: take,
          totalPages: Math.ceil(total / take),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve devices: ' + error.message);
    }
  }

  async getDevicesByUserId(userId: string, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      this.databaseService.device.findMany({
        where: { userId },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.databaseService.device.count({
        where: { userId },
      }),
    ]);

    if (devices.length === 0) {
      return {
        message: 'No devices found for this user',
        data: [],
        meta: {
          total: 0,
          page,
          pageSize: limit,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: 'Devices fetched for user successfully',
      data: devices,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new InternalServerErrorException('Failed to retrieve user devices: ' + error.message);
  }
}


  async getDevicesByType(deviceType: DeviceType, page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit;

    const [devices, total] = await Promise.all([
      this.databaseService.device.findMany({
        where: { type: deviceType },
        orderBy: { assignedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.databaseService.device.count({
        where: { type: deviceType },
      }),
    ]);

    if (devices.length === 0) {
      return {
        message: `No devices found of type '${deviceType}'`,
        data: [],
        meta: {
          total: 0,
          page,
          pageSize: limit,
          totalPages: 0,
        },
      };
    }

    return {
      success: true,
      message: `Devices of type '${deviceType}' fetched successfully`,
      data: devices,
      meta: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new InternalServerErrorException('Failed to retrieve devices by type: ' + error.message);
  }
}


  async updateDevice(id: string, dto: UpdateDeviceDto) {
    try {
      const existing = await this.databaseService.device.findUnique({ where: { id } });

      if (!existing) {
        throw new NotFoundException('Device not found');
      }

      const updated = await this.databaseService.device.update({
        where: { id },
        data: {
          ...dto,
          lastUsedAt: dto.lastUsedAt ?? new Date(), // optional behavior
        },
      });

      return {
        success: true,
        message: 'Device updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Device with this productId already exists: ' + error.meta?.target?.join(', '));
      }
      throw new InternalServerErrorException('Failed to update device: ' + error.message);
    }
  }

}
