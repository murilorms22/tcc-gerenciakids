import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';

@Injectable()
export class ResponsaveisService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.responsavel.findMany({
      include: {
        user: {
          select: { id: true, nome: true, email: true, role: true },
        },
        alunos: {
          select: { id: true, nome: true, turmaId: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findAvailableUsers() {
    return this.prisma.user.findMany({
      where: {
        role: Role.RESPONSAVEL,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        responsavel: {
          select: { id: true, nome: true },
        },
      },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: number) {
    const resp = await this.prisma.responsavel.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, nome: true, email: true, role: true },
        },
        alunos: true,
      },
    });

    if (!resp) {
      throw new NotFoundException(`Responsável #${id} não encontrado.`);
    }

    return resp;
  }

  async create(dto: CreateResponsavelDto) {
    return this.prisma.responsavel.create({
      data: {
        nome: dto.nome.trim(),
        cpf: dto.cpf.trim(),
        telefone: dto.telefone.trim(),
        userId: dto.userId ?? null,
      },
      include: {
        user: {
          select: { id: true, nome: true, email: true, role: true },
        },
        alunos: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async update(id: number, dto: UpdateResponsavelDto) {
    const existing = await this.prisma.responsavel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Responsável #${id} não encontrado.`);
    }

    return this.prisma.responsavel.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome.trim() } : {}),
        ...(dto.cpf !== undefined ? { cpf: dto.cpf.trim() } : {}),
        ...(dto.telefone !== undefined ? { telefone: dto.telefone.trim() } : {}),
        ...(dto.userId !== undefined ? { userId: dto.userId } : {}),
      },
      include: {
        user: {
          select: { id: true, nome: true, email: true, role: true },
        },
        alunos: {
          select: { id: true, nome: true },
        },
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.responsavel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Responsável #${id} não encontrado.`);
    }

    await this.prisma.responsavel.delete({ where: { id } });
    return { id, message: 'Responsável excluído com sucesso.' };
  }
}

