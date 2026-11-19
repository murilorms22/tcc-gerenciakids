import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrioridadeAviso, Role, StatusAviso } from '@prisma/client';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser, turmaId?: number) {
    const where: any = {};

    if (user.role === Role.RESPONSAVEL) {
      where.status = StatusAviso.APROVADO;
    } else {
      where.status = { in: [StatusAviso.APROVADO, StatusAviso.PENDENTE] };
    }

    if (turmaId && !isNaN(turmaId)) {
      where.OR = [{ turmaId: Number(turmaId) }, { turmaId: null }];
    } else if (user.role === Role.RESPONSAVEL) {
      const filhos = await this.prisma.aluno.findMany({
        where: { responsavel: { userId: user.id } },
        select: { turmaId: true },
      });
      const turmasIds = Array.from(new Set(filhos.map((f) => f.turmaId)));
      if (turmasIds.length > 0) {
        where.OR = [{ turmaId: null }, { turmaId: { in: turmasIds } }];
      }
    }

    return this.prisma.aviso.findMany({
      where,
      include: {
        turma: true,
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async findOne(id: number) {
    const aviso = await this.prisma.aviso.findUnique({
      where: { id },
      include: { turma: true },
    });

    if (!aviso) {
      throw new NotFoundException(`Aviso #${id} não encontrado.`);
    }

    return aviso;
  }

  async create(dto: CreateAvisoDto, user: AuthenticatedUser) {
    const status =
      user.role === Role.PROFESSOR
        ? StatusAviso.PENDENTE
        : StatusAviso.APROVADO;

    return this.prisma.aviso.create({
      data: {
        titulo: dto.titulo.trim(),
        conteudo: dto.conteudo.trim(),
        prioridade: dto.prioridade || PrioridadeAviso.NORMAL,
        status,
        autorNome: dto.autorNome?.trim() || user.nome || 'Coordenação Escolar',
        turmaId: dto.turmaId ?? null,
      },
      include: { turma: true },
    });
  }

  async update(id: number, dto: UpdateAvisoDto, user?: AuthenticatedUser) {
    const existing = await this.prisma.aviso.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Aviso #${id} não encontrado.`);
    }

    if (
      dto.status !== undefined &&
      user &&
      user.role !== Role.DIRECAO &&
      user.role !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'Apenas a Direção pode aprovar ou negar a publicação de avisos.',
      );
    }

    return this.prisma.aviso.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo.trim() } : {}),
        ...(dto.conteudo !== undefined
          ? { conteudo: dto.conteudo.trim() }
          : {}),
        ...(dto.prioridade !== undefined ? { prioridade: dto.prioridade } : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
        ...(dto.autorNome !== undefined
          ? { autorNome: dto.autorNome.trim() }
          : {}),
        ...(dto.turmaId !== undefined ? { turmaId: dto.turmaId } : {}),
      },
      include: { turma: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.aviso.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Aviso #${id} não encontrado.`);
    }

    await this.prisma.aviso.delete({ where: { id } });
    return { id, message: 'Aviso excluído com sucesso.' };
  }
}

