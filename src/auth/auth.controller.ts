import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthenticatedRequest, AuthenticatedRequestRt } from './types';
import { Public } from 'src/common/decorators';
import { RtGuard } from 'src/common/guards';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthRequestDto } from './dto';
import { ApiCreatedResponse } from '@nestjs/swagger';
import { TokensResponseDto } from './dto/tokens.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: TokensResponseDto,
  })
  @Post('local/signup')
  @HttpCode(HttpStatus.CREATED)
  signupLocal(@Body() dto: AuthRequestDto): Promise<TokensResponseDto> {
    return this.authService.signupLocal(dto);
  }

  @Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
  @Public()
  @Post('local/signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: AuthRequestDto): Promise<TokensResponseDto> {
    return this.authService.signinLocal(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return this.authService.logout(user.sub);
  }

  @Throttle({
    short: { limit: 1, ttl: 1000 },
    long: { limit: 2, ttl: 60000 },
  })
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@Req() req: AuthenticatedRequestRt) {
    const user = req.user;
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
