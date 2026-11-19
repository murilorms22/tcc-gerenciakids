import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';

@Injectable()
export class TurmasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.turma.findMany({
      include: {
        _count: {
          select: {
            alunos: true,
            atividades: true,
            avisos: true,
          },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const turma = await this.prisma.turma.findUnique({
      where: { id },
      include: {
        alunos: true,
        atividades: true,
        avisos: true,
        _count: {
          select: {
            alunos: true,
            atividades: true,
            avisos: true,
          },
        },
      },
    });

    if (!turma) {
      throw new NotFoundException(`Turma #${id} não encontrada.`);
    }

    return turma;
  }

  async create(dto: CreateTurmaDto) {
    return this.prisma.turma.create({
      data: {
        nome: dto.nome.trim(),
        turno: dto.turno.trim(),
        ano_letivo: dto.ano_letivo,
      },
    });
  }

  async update(id: number, dto: UpdateTurmaDto) {
    const existing = await this.prisma.turma.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Turma #${id} não encontrada.`);
    }

    return this.prisma.turma.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
        ...(dto.turno !== undefined ? { turno: dto.turno.trim() } : {}),
        ...(dto.ano_letivo !== undefined ? { ano_letivo: dto.ano_letivo } : {}),
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.turma.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Turma #${id} não encontrada.`);
    }

    await this.prisma.turma.delete({ where: { id } });
    return { id, message: 'Turma excluída com sucesso.' };
  }
}

