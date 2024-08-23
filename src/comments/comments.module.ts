import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, DatabaseService, JwtService],
})
export class CommentsModule {}
