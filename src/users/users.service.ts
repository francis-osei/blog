import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { hash } from 'bcrypt';
import { IUser } from 'src/auth/types/auth.types';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<IUser> {
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

  async findByEmail(email: string): Promise<IUser> {
    return await this.databaseService.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        role: true,
      },
    });
  }

  async findAll(): Promise<IUser[]> {
    return await this.databaseService.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
      },
    });
  }

  async findOne(id: string): Promise<IUser> {
    return await this.databaseService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} ${updateUserDto}user`;
  }

  async remove(id: string): Promise<IUser> {
    const user = await this.databaseService.user.findUnique({ where: { id } });

    if (!user) throw new BadRequestException('User not found');

    const delectedUser = await this.databaseService.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        role: true,
      },
    });

    return delectedUser;
  }
}
