import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, UsersModule, AuthModule, ProfilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
