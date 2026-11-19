import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
      include: { responsavel: true },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(dto.senha, user.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
      jti: randomUUID(),
    };

    const access_token = await this.jwtService.signAsync(payload);

    await this.prisma.token.create({
      data: {
        token: access_token,
        userId: user.id,
      },
    });

    return {
      access_token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        responsavelId: user.responsavel?.id ?? null,
      },
    };
  }

  async register(dto: RegisterDto) {
    const emailNormalized = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: emailNormalized },
    });

    if (existing) {
      throw new ConflictException('Este endereço de e-mail já está cadastrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    // Prevenção contra Mass Assignment: role é sempre forçado como RESPONSAVEL
    const newUser = await this.prisma.user.create({
      data: {
        nome: dto.nome.trim(),
        email: emailNormalized,
        senha: senhaHash,
        role: Role.RESPONSAVEL,
      },
    });

    // Se CPF for informado (ou vinculável a responsável existente), vincula ou cria ficha de Responsavel
    let responsavelRecord = null;
    if (dto.cpf && dto.cpf.trim()) {
      const cpfTrimmed = dto.cpf.trim();
      const existingResp = await this.prisma.responsavel.findUnique({
        where: { cpf: cpfTrimmed },
      });

      if (existingResp && !existingResp.userId) {
        responsavelRecord = await this.prisma.responsavel.update({
          where: { id: existingResp.id },
          data: { userId: newUser.id },
        });
      } else if (!existingResp) {
        responsavelRecord = await this.prisma.responsavel.create({
          data: {
            nome: newUser.nome,
            cpf: cpfTrimmed,
            telefone: dto.telefone?.trim() || 'Não informado',
            userId: newUser.id,
          },
        });
      }
    }

    return {
      user: {
        id: newUser.id,
        nome: newUser.nome,
        email: newUser.email,
        role: newUser.role,
        responsavelId: responsavelRecord?.id ?? null,
      },
    };
  }

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        responsavel: {
          include: {
            alunos: {
              select: { id: true, nome: true, turmaId: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      responsavelId: user.responsavel?.id ?? null,
      responsavel: user.responsavel ?? null,
    };
  }

  async logout(rawToken: string) {
    if (rawToken) {
      await this.prisma.token.deleteMany({
        where: { token: rawToken },
      });
    }
    return { message: 'Logout realizado com sucesso.' };
  }
}

