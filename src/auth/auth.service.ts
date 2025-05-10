import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthRequestDto } from './dto';
import * as bcrypt from 'bcrypt';
import { and, eq, isNotNull } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { user } from 'src/database/schema';
import { AllConfigType } from 'src/config';
import { TypedI18nService } from 'src/i18n/typed-i18n.service';
import { AuthErrorHandlerService } from './auth-error-handler.service';
import { TokensResponseDto } from './dto/tokens.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly i18n: TypedI18nService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly authErrorHandler: AuthErrorHandlerService,
  ) {}

  async signupLocal(dto: AuthRequestDto): Promise<TokensResponseDto> {
    try {
      const hashedPassword = await this.hashData(dto.password);
      const [newUser] = await this.databaseService.db
        .insert(user)
        .values({
          email: dto.email,
          password: hashedPassword,
        })
        .returning();

      const tokens = await this.getTokens(newUser.id, newUser.email);
      await this.updateRtHash(newUser.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      this.authErrorHandler.handleAuthError(error);
    }
  }

  async signinLocal(dto: AuthRequestDto): Promise<TokensResponseDto> {
    const userInDb = await this.databaseService.db.query.user.findFirst({
      where: eq(user.email, dto.email),
    });
    if (!userInDb)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const passwordMatches = await bcrypt.compare(
      dto.password,
      userInDb.password,
    );
    if (!passwordMatches)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const tokens = await this.getTokens(userInDb.id, userInDb.email);
    await this.updateRtHash(userInDb.id, tokens.refreshToken);

    return tokens;
  }
  async logout(userId: number) {
    await this.databaseService.db
      .update(user)
      .set({ hashedRefreshToken: null })
      .where(and(eq(user.id, userId), isNotNull(user.hashedRefreshToken)));
  }
  async refreshTokens(userId: number, refreshToken: string) {
    const userInDb = await this.databaseService.db.query.user.findFirst({
      where: eq(user.id, userId),
    });
    if (!userInDb || !userInDb.hashedRefreshToken)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      userInDb.hashedRefreshToken,
    );
    if (!refreshTokenMatches)
      throw new ForbiddenException(this.i18n.t('auth.accessDenied'));

    const tokens = await this.getTokens(userInDb.id, userInDb.email);
    await this.updateRtHash(userInDb.id, tokens.refreshToken);

    return tokens;
  }

  //? Utility functions
  hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string): Promise<TokensResponseDto> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('auth.jwtSecret', { infer: true }),
          expiresIn: 60 * 15, // 15 minutes
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.get('auth.jwtRefreshSecret', {
            infer: true,
          }),
          expiresIn: 60 * 60 * 24 * 7, // 7 days
        },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);
    await this.databaseService.db
      .update(user)
      .set({ hashedRefreshToken: hash })
      .where(eq(user.id, userId));
  }
}
