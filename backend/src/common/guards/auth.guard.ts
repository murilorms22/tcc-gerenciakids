import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação não fornecido.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          process.env.JWT_SECRET ||
          'gerenciakids-super-secret-jwt-key-2026-lgpd',
      });

      // Validação stateful na tabela Token para suportar revogação/logout imediato
      const storedToken = await this.prisma.token.findUnique({
        where: { token },
        include: { user: true },
      });

      let authUser = storedToken?.user || null;

      // Fallback para instâncias serverless (cold start na Vercel) quando o JWT é válido
      if (!authUser && this.prisma.isUsingInMemoryFallback && payload?.sub) {
        authUser = await this.prisma.user.findUnique({
          where: { id: Number(payload.sub) },
        });
      }

      if (!authUser) {
        throw new UnauthorizedException('Sessão expirada ou token revogado.');
      }

      request['user'] = {
        id: authUser.id,
        sub: payload.sub || authUser.id,
        email: authUser.email,
        nome: authUser.nome,
        role: authUser.role,
      };
      request['rawToken'] = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token JWT inválido ou expirado.');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

