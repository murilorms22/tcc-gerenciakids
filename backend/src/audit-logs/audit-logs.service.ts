import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: {
    entidade?: string;
    acao?: string;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.entidade) {
      where.entidade = filters.entidade;
    }
    if (filters?.acao) {
      where.acao = filters.acao;
    }

    const take =
      filters?.limit && !isNaN(filters.limit)
        ? Math.min(Number(filters.limit), 500)
        : 200;

    return this.prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
    });
  }
}

