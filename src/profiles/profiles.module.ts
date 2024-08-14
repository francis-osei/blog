import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [ProfilesController],
  providers: [ProfilesService, DatabaseService, JwtService],
})
export class ProfilesModule {}
