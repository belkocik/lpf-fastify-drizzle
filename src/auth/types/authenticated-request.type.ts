import type { FastifyRequest } from 'fastify';

export type JwtPayload = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};

type RefreshToken = {
  refreshToken: string;
};

export interface AuthenticatedRequest extends FastifyRequest {
  user: JwtPayload;
}

export interface AuthenticatedRequestRt extends FastifyRequest {
  user: JwtPayload & RefreshToken;
}
