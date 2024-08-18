import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { hash } from 'bcrypt';
import { userReturn } from './types/uses.return';

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
      },
    });
  }

  async findAll(): Promise<userReturn[]> {
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

  async findOne(id: string): Promise<userReturn> {
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
      },
    });

    return delectedUser;
  }
}
