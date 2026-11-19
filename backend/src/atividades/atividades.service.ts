import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

@Injectable()
export class AtividadesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser, turmaId?: number) {
    const where: any = {};

    if (turmaId && !isNaN(turmaId)) {
      where.turmaId = Number(turmaId);
    } else if (user.role === Role.RESPONSAVEL) {
      // Filtra atividades das turmas dos filhos do responsável logado (se houver)
      const filhos = await this.prisma.aluno.findMany({
        where: { responsavel: { userId: user.id } },
        select: { turmaId: true },
      });
      const turmasIds = Array.from(new Set(filhos.map((f) => f.turmaId)));
      if (turmasIds.length > 0) {
        where.turmaId = { in: turmasIds };
      }
    }

    return this.prisma.atividade.findMany({
      where,
      include: {
        turma: true,
      },
      orderBy: [{ horario: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: number) {
    const atividade = await this.prisma.atividade.findUnique({
      where: { id },
      include: { turma: true },
    });

    if (!atividade) {
      throw new NotFoundException(`Atividade #${id} não encontrada.`);
    }

    return atividade;
  }

  async create(dto: CreateAtividadeDto) {
    return this.prisma.atividade.create({
      data: {
        titulo: dto.titulo.trim(),
        descricao: dto.descricao?.trim() || null,
        horario: dto.horario.trim(),
        sala: dto.sala.trim(),
        concluida: dto.concluida ?? false,
        turmaId: dto.turmaId,
      },
      include: { turma: true },
    });
  }

  async update(id: number, dto: UpdateAtividadeDto) {
    const existing = await this.prisma.atividade.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Atividade #${id} não encontrada.`);
    }

    return this.prisma.atividade.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined ? { titulo: dto.titulo.trim() } : {}),
        ...(dto.descricao !== undefined
          ? { descricao: dto.descricao?.trim() || null }
          : {}),
        ...(dto.horario !== undefined ? { horario: dto.horario.trim() } : {}),
        ...(dto.sala !== undefined ? { sala: dto.sala.trim() } : {}),
        ...(dto.concluida !== undefined ? { concluida: dto.concluida } : {}),
        ...(dto.turmaId !== undefined ? { turmaId: dto.turmaId } : {}),
      },
      include: { turma: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.atividade.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Atividade #${id} não encontrada.`);
    }

    await this.prisma.atividade.delete({ where: { id } });
    return { id, message: 'Atividade excluída com sucesso.' };
  }
}

