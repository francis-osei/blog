import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../guards/auth.guard';
import { Roles } from '../decorators/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from '../guards/roles.guard';
import { ApiResponse } from '../types/api.response';
import { userReturn } from './types/uses.return';
import { UpdateUserRole } from './dto/updateUserRole';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<ApiResponse<userReturn[]>> {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const { data, total } = await this.usersService.findAll(
      pageNumber,
      limitNumber,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      page: pageNumber,
      limit: limitNumber,
      total,
      results: data.length,
      data,
    };
  }

  /**
   * ✅ Endpoint: Admin updates another user's role
   */
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  async updateUserRole(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserRole,
  ): Promise<ApiResponse<UpdateUserRole>> {
    const { userId } = req.session.user;

    if (userId === id) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const updated = await this.usersService.updateRole(id, dto);

    return {
      statusCode: HttpStatus.OK,
      message: 'successful',
      data: updated,
    };
  }

  /**
   * ✅ Endpoint: User updates their own role
   * Restriction: USER cannot set themselves to ADMIN
   */
  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.USER, Role.AUTHOR)
  @Patch('me/role')
  async updateOwnerRole(
    @Body() dto: UpdateUserRole,
    @Req() req: Request,
  ): Promise<ApiResponse<UpdateUserRole>> {
    const { userId } = req.session.user;

    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('You cannot assign yourself as ADMIN');
    }

    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.usersService.updateRole(userId, dto),
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<userReturn>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.usersService.findOne(id),
    };
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): string {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<userReturn>> {
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'Successful',
      data: await this.usersService.remove(id),
    };
  }
}
