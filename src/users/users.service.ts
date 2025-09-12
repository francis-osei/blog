import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../database/database.service';
import { hash } from 'bcrypt';
import { userReturn } from './types/uses.return';
import { UpdateUserRole } from './dto/updateUserRole';
import { UpateUserRole } from './types/updateUserRole';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<userReturn> {
    const user = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (user) throw new ConflictException('Cannot have duplicate emails');

    const newUser = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
      },
    });

    return newUser;
  }

  async findByEmail(email: string): Promise<userReturn | null> {
    return await this.getuser(email);
  }
  async findById(id: string): Promise<userReturn | null> {
    return await this.getuser(id);
  }

  async authenticateUser(userId: string): Promise<userReturn> {
    return this.databaseService.user.update({
      where: { id: userId },
      data: { isAuthenticated: true },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
        isAuthenticated: true,
      },
    });
  }

  async deauthenticateUser(userId: string): Promise<void> {
    await this.databaseService.user.update({
      where: { id: userId },
      data: {
        isAuthenticated: false,
      },
    });
  }

  private async getuser(identifier: string): Promise<userReturn | null> {
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);

    const where = isEmail ? { email: identifier } : { id: identifier };

    return await this.databaseService.user.findUnique({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
        isAuthenticated: true,
      },
    });
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ data: userReturn[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.databaseService.user.findMany({
        where: { role: 'USER' },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          isAuthenticated: true,
        },
      }),
      this.databaseService.user.count({
        where: { role: 'USER' },
      }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<userReturn> {
    return await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
        isAuthenticated: true,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto): string {
    return `This action updates a #${id} ${updateUserDto}user`;
  }

  async updateRole(
    userId: string,
    dto: UpdateUserRole,
  ): Promise<UpateUserRole> {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('User not found');

    return await this.databaseService.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: { id: true, email: true, role: true },
    });
  }

  async remove(id: string): Promise<userReturn> {
    const user = await this.databaseService.user.findUnique({ where: { id } });

    if (!user) throw new BadRequestException('User not found');

    const delectedUser = await this.databaseService.user.delete({
      where: { id },
      select: {
        id: true,
        email: false,
        username: false,
        password: false,
        role: false,
        isAuthenticated: true,
      },
    });

    return delectedUser;
  }
}
