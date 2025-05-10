import { Module } from '@nestjs/common';
import { AtStrategy, RtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthErrorHandlerService } from './auth-error-handler.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule, UsersModule, JwtModule.register({})],
  providers: [AuthErrorHandlerService, AuthService, AtStrategy, RtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
