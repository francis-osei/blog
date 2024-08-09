import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { hash } from 'bcrypt';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (user) throw new ConflictException('Cannot have duplicate emails');

    const newUser = await this.databaseService.user.create({
      data: {
        ...createUserDto,
        password: await hash(createUserDto.password, 10),
      },
    });

    const userDataWithoutPassword = { ...newUser };
    delete userDataWithoutPassword.password;

    return userDataWithoutPassword;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.databaseService.user.findUnique({ where: { email } });
  }

  async findAll() {
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} ${updateUserDto}user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
