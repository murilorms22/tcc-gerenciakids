import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateParecerDto } from './dto/create-parecer.dto';
import { UpdateParecerDto } from './dto/update-parecer.dto';

@Injectable()
export class PareceresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(user: AuthenticatedUser, alunoId?: number) {
    let allowedAlunosIds: number[] | undefined;

    if (user.role === Role.RESPONSAVEL) {
      const filhos = await this.prisma.aluno.findMany({
        where: { responsavel: { userId: user.id } },
      });
      allowedAlunosIds = filhos.map((f: any) => Number(f.id));
    }

    return this.prisma.listarPareceres({
      alunoId: alunoId && !isNaN(alunoId) ? Number(alunoId) : undefined,
      allowedAlunosIds,
    });
  }

  async findOne(id: number) {
    const parecer = await this.prisma.buscarParecerPorId(id);
    if (!parecer) {
      throw new NotFoundException(`Parecer #${id} não encontrado.`);
    }
    return parecer;
  }

  async create(dto: CreateParecerDto, user: AuthenticatedUser) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: Number(dto.alunoId) },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno #${dto.alunoId} não encontrado.`);
    }

    return this.prisma.criarParecer({
      titulo: dto.titulo.trim(),
      periodo: dto.periodo?.trim() || '1º Semestre / 2026',
      conteudo: dto.conteudo.trim(),
      professorNome:
        dto.professorNome?.trim() || user.nome || 'Professor(a) Responsável',
      alunoId: Number(dto.alunoId),
    });
  }

  async update(id: number, dto: UpdateParecerDto) {
    const existing = await this.prisma.buscarParecerPorId(id);
    if (!existing) {
      throw new NotFoundException(`Parecer #${id} não encontrado.`);
    }

    return this.prisma.atualizarParecer(id, {
      ...(dto.titulo !== undefined ? { titulo: dto.titulo.trim() } : {}),
      ...(dto.periodo !== undefined ? { periodo: dto.periodo.trim() } : {}),
      ...(dto.conteudo !== undefined ? { conteudo: dto.conteudo.trim() } : {}),
      ...(dto.professorNome !== undefined
        ? { professorNome: dto.professorNome.trim() }
        : {}),
      ...(dto.alunoId !== undefined ? { alunoId: Number(dto.alunoId) } : {}),
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.buscarParecerPorId(id);
    if (!existing) {
      throw new NotFoundException(`Parecer #${id} não encontrado.`);
    }

    await this.prisma.deletarParecer(id);
    return { id, message: 'Parecer pedagógico excluído com sucesso.' };
  }
}

