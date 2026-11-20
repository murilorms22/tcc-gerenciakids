import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { CryptoService } from '../common/crypto/crypto.service';
import { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';

@Injectable()
export class AlunosService {
  private readonly faltasRegistradasPorDia = new Map<string, Set<number>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  private obterDataHojeKey(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private decryptAluno<T extends Record<string, any>>(aluno: T): T {
    if (!aluno) return aluno;
    return {
      ...aluno,
      tipo_sanguineo: this.cryptoService.decrypt(aluno.tipo_sanguineo),
      alergias: this.cryptoService.decrypt(aluno.alergias) || 'Nenhuma',
      observacoes: this.cryptoService.decrypt(aluno.observacoes) || '',
    };
  }

  async findAll(user: AuthenticatedUser, turmaId?: number) {
    const where: any = {};

    if (turmaId && !isNaN(turmaId)) {
      where.turmaId = Number(turmaId);
    }

    // Regra LGPD de Ownership: RESPONSAVEL visualiza apenas os próprios filhos vinculados ao seu userId
    if (user.role === Role.RESPONSAVEL) {
      where.responsavel = {
        userId: user.id,
      };
    }

    const alunos = await this.prisma.aluno.findMany({
      where,
      include: {
        turma: true,
        responsavel: true,
      },
      orderBy: { nome: 'asc' },
    });

    return alunos.map((aluno) => this.decryptAluno(aluno));
  }

  async findOne(id: number, user: AuthenticatedUser) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id },
      include: {
        turma: true,
        responsavel: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException(`Aluno #${id} não encontrado.`);
    }

    // Regra LGPD de Ownership: RESPONSAVEL não pode acessar ficha médica de filhos de terceiros
    if (
      user.role === Role.RESPONSAVEL &&
      aluno.responsavel?.userId !== user.id
    ) {
      throw new ForbiddenException(
        'Acesso negado (LGPD): você só tem permissão para visualizar dados dos seus próprios filhos.',
      );
    }

    return this.decryptAluno(aluno);
  }

  /**
   * Retorna o registro como está armazenado no MySQL (com os textos cifrados AES-256-GCM)
   * exclusivamente para comprovação de criptografia em auditorias/testes LGPD por DIRECAO/ADMIN.
   */
  async findOneEncryptedRaw(id: number) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        tipo_sanguineo: true,
        alergias: true,
        observacoes: true,
      },
    });

    if (!aluno) {
      throw new NotFoundException(`Aluno #${id} não encontrado.`);
    }

    return {
      ...aluno,
      algoritmo: 'AES-256-GCM (iv:authTag:ciphertext)',
    };
  }

  async create(dto: CreateAlunoDto) {
    const created = await this.prisma.aluno.create({
      data: {
        nome: dto.nome.trim(),
        data_nascimento: dto.data_nascimento,
        genero: dto.genero ?? null,
        endereco: dto.endereco ?? null,
        foto_perfil_url: dto.foto_perfil_url ?? null,
        tipo_sanguineo: this.cryptoService.encrypt(
          dto.tipo_sanguineo?.trim() || 'Não informado',
        ),
        alergias: this.cryptoService.encrypt(dto.alergias?.trim() || 'Nenhuma'),
        observacoes: this.cryptoService.encrypt(
          dto.observacoes?.trim() || 'Sem observações adicionais.',
        ),
        peso: dto.peso ?? null,
        altura: dto.altura ?? null,
        faltas: dto.faltas ?? 0,
        turmaId: dto.turmaId,
        responsavelId: dto.responsavelId,
      },
      include: {
        turma: true,
        responsavel: true,
      },
    });

    return this.decryptAluno(created);
  }

  async update(id: number, dto: UpdateAlunoDto) {
    const existing = await this.prisma.aluno.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Aluno #${id} não encontrado.`);
    }

    const dataToUpdate: any = { ...dto };

    if (dto.nome !== undefined) {
      dataToUpdate.nome = dto.nome.trim();
    }
    if (dto.tipo_sanguineo !== undefined) {
      dataToUpdate.tipo_sanguineo = this.cryptoService.encrypt(
        dto.tipo_sanguineo?.trim() || 'Não informado',
      );
    }
    if (dto.alergias !== undefined) {
      dataToUpdate.alergias = this.cryptoService.encrypt(
        dto.alergias?.trim() || 'Nenhuma',
      );
    }
    if (dto.observacoes !== undefined) {
      dataToUpdate.observacoes = this.cryptoService.encrypt(
        dto.observacoes?.trim() || 'Sem observações adicionais.',
      );
    }

    const updated = await this.prisma.aluno.update({
      where: { id },
      data: dataToUpdate,
      include: {
        turma: true,
        responsavel: true,
      },
    });

    return this.decryptAluno(updated);
  }

  async registrarChamada(id: number, dto: UpdateChamadaDto) {
    const existing = await this.prisma.aluno.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Aluno #${id} não encontrado.`);
    }

    const hoje = this.obterDataHojeKey();
    if (!this.faltasRegistradasPorDia.has(hoje)) {
      this.faltasRegistradasPorDia.set(hoje, new Set<number>());
    }
    const ausentesHoje = this.faltasRegistradasPorDia.get(hoje)!;

    let novasFaltas = existing.faltas;

    if (dto.faltas !== undefined) {
      novasFaltas = Math.max(0, dto.faltas);
      if (dto.ausenteHoje === true) {
        ausentesHoje.add(id);
      } else if (dto.ausenteHoje === false) {
        ausentesHoje.delete(id);
      }
    } else if (dto.ausenteHoje !== undefined) {
      if (dto.ausenteHoje) {
        if (!ausentesHoje.has(id)) {
          novasFaltas = existing.faltas + 1;
          ausentesHoje.add(id);
        }
      } else {
        if (ausentesHoje.has(id)) {
          novasFaltas = Math.max(0, existing.faltas - 1);
          ausentesHoje.delete(id);
        }
      }
    } else {
      // Regra: um aluno não pode receber 2 faltas no mesmo dia
      if (!ausentesHoje.has(id)) {
        novasFaltas = existing.faltas + 1;
        ausentesHoje.add(id);
      }
    }

    const updated = await this.prisma.aluno.update({
      where: { id },
      data: { faltas: novasFaltas },
      include: {
        turma: true,
        responsavel: true,
      },
    });

    return this.decryptAluno(updated);
  }

  async remove(id: number) {
    const existing = await this.prisma.aluno.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Aluno #${id} não encontrado.`);
    }

    await this.prisma.aluno.delete({ where: { id } });
    return { id, message: 'Aluno excluído com sucesso.' };
  }
}
