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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'src/decorators/roles.docorator';
import { Role } from '@prisma/client';
import { RoleGuard } from 'src/guards/roles.guard';
import { ApiResponse } from 'src/types/api.response';
import { userReturn } from './types/uses.return';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard, RoleGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<ApiResponse<userReturn[]>> {
    const users = await this.usersService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      results: users.length,
      data: users,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponse<userReturn>> {
    return {
      statusCode: HttpStatus.OK,
      message: 'Successful',
      data: await this.usersService.findOne(id),
    };
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
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
