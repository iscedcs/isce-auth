import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { AdminRegisterDto, UpdateUserDto } from './dto/user.dto';
import { UserType } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';


@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Post('createAdmin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token') 
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    createAdminUser(@Body(ValidationPipe) createAdminUserDto: AdminRegisterDto, @Headers('secret-key') secretKey: string) {
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        return this.userService.createAdminUser(createAdminUserDto);
    }

    @Get('allUsers')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 201, description: 'User fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiQuery({
        name: 'userType',
        required: false,  // Making the query parameter optional
        description: 'Filter by role',
        type: String,
      })
      @ApiQuery({
        name: 'limit',
        required: false,  // Making the query parameter optional
        description: 'Filter by limit',
        type: Number,
      })
      @ApiQuery({
        name: 'offset',
        required: false,  // Making the query parameter optional
        description: 'Offset',
        type: Number,
      })
    getAllUsers(
        @Query('userType') userType?: UserType,
        @Query('limit') limit?: string,
        @Query('offset') offset?: string,
    ) {

      const parsedLimit = limit ? parseInt(limit, 10) : 10;
      const parsedOffset = offset ? parseInt(offset, 10) : 0;
        return this.userService.getAllUsers({ userType, limit: parsedLimit, offset: parsedOffset });
    }

    @Get('one/:id')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get a single user' })
    @ApiResponse({ status: 201, description: 'User fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    getUserById(@Param('id') id: string) {
        return this.userService.getUserById(id);
    }

    @Patch('update/:id')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({ status: 201, description: 'User updated successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    updateUser(
        @Param('id') id: string,
        @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, updateUserDto);
    }

    @Patch('delete/:id')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Soft delete a user' })
    @ApiResponse({ status: 201, description: 'User deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    softDeleteUser(
        @Param('id') id: string) {
        return this.userService.softDeleteUser(id);
    }

    @Patch('delete/users')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Soft delete batch of users' })
    @ApiResponse({ status: 201, description: 'Users deleted successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    batchSoftDeleteUsers(
        @Body('userIds') userIds: string[]) {
    return this.userService.batchSoftDeleteUsers(userIds);
    }

    @Get('/users/search')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Search users' })
    @ApiResponse({ status: 201, description: 'User fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    @ApiQuery({
        name: 'fullname',
        required: false,  // Making the query parameter optional
        description: 'Filter by name',
        type: String,
      })
    @ApiQuery({
        name: 'email',
        required: false,  // Making the query parameter optional
        description: 'Filter by email',
        type: String,
      })
    @ApiQuery({
        name: 'role',
        required: false,  // Making the query parameter optional
        description: 'Filter by role',
        type: String,
      })
      @ApiQuery({
        name: 'limit',
        required: false,  // Making the query parameter optional
        description: 'Filter by limit',
        type: String,
      })
      @ApiQuery({
        name: 'offset',
        required: false,  // Making the query parameter optional
        description: 'Offset',
        type: String,
      })
    async searchUsers(
    @Query('email') email?: string,
    @Query('fullname') fullname?: string,
    @Query('userType') userType?: UserType,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
    ) {
    return await this.userService.searchUsers(email, fullname, userType, limit, offset);
    }

    @Get('/users/count')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get total count of users' })
    @ApiResponse({ status: 201, description: 'Users counted successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    getTotalUserCount() {
    return this.userService.getTotalUserCount();
    }

    @Get('/users/active')
    @UseGuards(JwtAuthGuard)
    // @Roles(UserType.ADMIN)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Get total active users' })
    @ApiResponse({ status: 201, description: 'Users fetched successfully.' })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    getActiveUsers() {
    return this.userService.getActiveUsers();
    }
}
