import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: number;
  sub: number;
  email: string;
  nome: string;
  role: 'RESPONSAVEL' | 'PROFESSOR' | 'DIRECAO' | 'ADMIN';
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

