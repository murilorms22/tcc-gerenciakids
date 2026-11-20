import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  PrismaClient,
  PrioridadeAviso,
  Role,
  StatusAviso,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

function getKeyBuffer(): Buffer {
  const rawKey =
    process.env.ENCRYPTION_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }
  if (Buffer.byteLength(rawKey, 'utf8') === 32) {
    return Buffer.from(rawKey, 'utf8');
  }
  return crypto.createHash('sha256').update(rawKey).digest();
}

function encryptField(plainText: string | null | undefined): string | null {
  if (!plainText) return null;
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  public isUsingInMemoryFallback = false;
  private inMemoryPareceres: any[] = [];
  private inMemoryStateRef: any = null;

  async onModuleInit() {
    const dbUrl = process.env.DATABASE_URL || '';
    const isVercelWithoutRemoteDb =
      Boolean(process.env.VERCEL) &&
      (!dbUrl || dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1'));

    if (isVercelWithoutRemoteDb) {
      await this.enableInMemoryFallback();
      return;
    }

    try {
      await this.$connect();
      try {
        const columns = await this.$queryRawUnsafe<any[]>(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'avisos' AND COLUMN_NAME = 'status'`,
        );
        if (Array.isArray(columns) && columns.length === 0) {
          await this.$executeRawUnsafe(
            `ALTER TABLE \`avisos\` ADD COLUMN \`status\` ENUM('PENDENTE', 'APROVADO', 'REJEITADO') NOT NULL DEFAULT 'APROVADO'`,
          );
        }
      } catch {
        // Ignora caso a tabela ainda não exista
      }

      try {
        await this.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS \`pareceres\` (
            \`id\` INTEGER NOT NULL AUTO_INCREMENT,
            \`titulo\` VARCHAR(191) NOT NULL,
            \`periodo\` VARCHAR(191) NOT NULL DEFAULT '1º Semestre / 2026',
            \`conteudo\` TEXT NOT NULL,
            \`professorNome\` VARCHAR(191) NOT NULL,
            \`alunoId\` INTEGER NOT NULL,
            \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
            \`updatedAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
            INDEX \`pareceres_alunoId_idx\`(\`alunoId\`),
            PRIMARY KEY (\`id\`)
          ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
      } catch {
        // Ignora caso falhe
      }

      try {
        const userCount = await this.user.count();
        if (userCount === 0) {
          await this.seedInitialData();
        }
      } catch (err) {
        console.warn('Aviso ao verificar seed inicial:', err);
      }

      try {
        const parecerRows = await this.$queryRawUnsafe<any[]>(
          `SELECT COUNT(*) as total FROM \`pareceres\``,
        );
        const totalPareceres = Number(parecerRows?.[0]?.total ?? 0);
        if (totalPareceres === 0) {
          await this.$executeRawUnsafe(
            `INSERT INTO \`pareceres\` (\`titulo\`, \`periodo\`, \`conteudo\`, \`professorNome\`, \`alunoId\`) VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)`,
            'Desenvolvimento Socioemocional, Linguagem e Autonomia',
            '1º Semestre / 2026',
            'A aluna Helena adaptou-se muito bem à rotina do Maternal II. Participa com entusiasmo das rodas de música e demonstra excelente interação e empatia com os colegas.',
            'Professor João Silva',
            1,
            'Coordenação Motora e Expressão Criativa',
            '1º Semestre / 2026',
            'O aluno Bernardo apresenta ótima concentração nas atividades de montagem com blocos lógicos e pintura, evoluindo continuamente na coordenação motora fina.',
            'Professor João Silva',
            4,
          );
        }
      } catch {
        // Ignora caso alunos 1 e 4 não existam ainda
      }
    } catch (err) {
      console.warn(
        'MySQL indisponível no ambiente atual; ativando store em memória com criptografia AES-256-GCM:',
        (err as Error)?.message,
      );
      await this.enableInMemoryFallback();
    }
  }

  private async seedInitialData() {
    console.log(
      '🌱 Banco vazio detectado — populando carga inicial GerenciaKids...',
    );
    const senhaHash = await bcrypt.hash('Senha123', 10);

    const adminUser = await this.user.create({
      data: {
        id: 1,
        nome: 'Administrador Geral',
        email: 'admin@escola.com',
        senha: senhaHash,
        role: Role.ADMIN,
      },
    });

    await this.user.create({
      data: {
        id: 2,
        nome: 'Diretora Márcia Oliveira',
        email: 'direcao@escola.com',
        senha: senhaHash,
        role: Role.DIRECAO,
      },
    });

    await this.user.create({
      data: {
        id: 3,
        nome: 'Professor João Silva',
        email: 'professor@escola.com',
        senha: senhaHash,
        role: Role.PROFESSOR,
      },
    });

    const responsavelUser = await this.user.create({
      data: {
        id: 4,
        nome: 'Fernanda Souza Martins',
        email: 'responsavel@escola.com',
        senha: senhaHash,
        role: Role.RESPONSAVEL,
      },
    });

    const turmaMaternal = await this.turma.create({
      data: {
        id: 1,
        nome: 'Maternal II - Estrelinhas',
        turno: 'Manhã',
        ano_letivo: 2026,
      },
    });

    const turmaPre = await this.turma.create({
      data: {
        id: 2,
        nome: 'Pré I - Pequenos Exploradores',
        turno: 'Tarde',
        ano_letivo: 2026,
      },
    });

    const respFernanda = await this.responsavel.create({
      data: {
        id: 1,
        nome: 'Fernanda Souza Martins',
        cpf: '123.456.789-01',
        telefone: '(11) 98765-4321',
        userId: responsavelUser.id,
      },
    });

    const respRodrigo = await this.responsavel.create({
      data: {
        id: 2,
        nome: 'Rodrigo Lima Costa',
        cpf: '987.654.321-09',
        telefone: '(11) 97654-3210',
        userId: null,
      },
    });

    const alunosData = [
      {
        id: 1,
        nome: 'Helena Souza Martins',
        data_nascimento: '2022-02-20',
        genero: 'Feminino',
        endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
        foto_perfil_url:
          'https://ui-avatars.com/api/?name=Helena+Souza+Martins&background=FF6B9D&color=fff&size=150',
        tipo_sanguineo: encryptField('A+'),
        alergias: encryptField(
          'Proteína do leite de vaca (APLV). Dieta restrita.',
        ),
        observacoes: encryptField(
          'Precisa de ajuda para dormir, gosta de música de ninar. Levar mamadeira especial.',
        ),
        peso: 13.5,
        altura: 89,
        faltas: 1,
        turmaId: turmaMaternal.id,
        responsavelId: respFernanda.id,
      },
      {
        id: 2,
        nome: 'Miguel Souza Martins',
        data_nascimento: '2022-07-01',
        genero: 'Masculino',
        endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
        foto_perfil_url:
          'https://ui-avatars.com/api/?name=Miguel+Souza+Martins&background=4ECDC4&color=fff&size=150',
        tipo_sanguineo: encryptField('O+'),
        alergias: encryptField('Nenhuma'),
        observacoes: encryptField(
          'Comunicativo, gosta de conversar com os colegas e professores nas rodas de leitura.',
        ),
        peso: 14.8,
        altura: 94,
        faltas: 0,
        turmaId: turmaMaternal.id,
        responsavelId: respFernanda.id,
      },
      {
        id: 3,
        nome: 'Alice Lima Costa',
        data_nascimento: '2022-04-18',
        genero: 'Feminino',
        endereco: 'Alameda Santos, 321 - Jardins, São Paulo/SP',
        foto_perfil_url:
          'https://ui-avatars.com/api/?name=Alice+Lima+Costa&background=FFE66D&color=333&size=150',
        tipo_sanguineo: encryptField('AB+'),
        alergias: encryptField(
          'Glúten (doença celíaca) e corantes artificiais.',
        ),
        observacoes: encryptField(
          'Lanche enviado exclusivamente pela família. Atenção redobrada em festas escolares.',
        ),
        peso: 13.2,
        altura: 90,
        faltas: 3,
        turmaId: turmaMaternal.id,
        responsavelId: respRodrigo.id,
      },
      {
        id: 4,
        nome: 'Bernardo Lima Costa',
        data_nascimento: '2021-09-30',
        genero: 'Masculino',
        endereco: 'Alameda Santos, 321 - Jardins, São Paulo/SP',
        foto_perfil_url:
          'https://ui-avatars.com/api/?name=Bernardo+Lima+Costa&background=95E1D3&color=fff&size=150',
        tipo_sanguineo: encryptField('B+'),
        alergias: encryptField(
          'Picada de insetos (uso de repelente infantil autorizado).',
        ),
        observacoes: encryptField(
          'Adora desenhar e montar blocos lógicos. Bastante concentrado.',
        ),
        peso: 16.0,
        altura: 102,
        faltas: 2,
        turmaId: turmaPre.id,
        responsavelId: respRodrigo.id,
      },
      {
        id: 5,
        nome: 'Laura Souza Martins',
        data_nascimento: '2021-05-15',
        genero: 'Feminino',
        endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
        foto_perfil_url:
          'https://ui-avatars.com/api/?name=Laura+Souza+Martins&background=C7CEEA&color=333&size=150',
        tipo_sanguineo: encryptField('A-'),
        alergias: encryptField('Amendoim e castanhas.'),
        observacoes: encryptField(
          'Muito carinhosa com os colegas. Gosta de atividades musicais.',
        ),
        peso: 15.4,
        altura: 99,
        faltas: 1,
        turmaId: turmaPre.id,
        responsavelId: respFernanda.id,
      },
    ];

    for (const aluno of alunosData) {
      await this.aluno.create({ data: aluno });
    }

    await this.atividade.createMany({
      data: [
        {
          id: 1,
          titulo: 'Roda de Música e Acolhimento',
          descricao:
            'Atividade de musicalização infantil e integração matinal.',
          horario: '08:30',
          sala: 'Sala 01 - Musicalização',
          concluida: true,
          turmaId: turmaMaternal.id,
        },
        {
          id: 2,
          titulo: 'Oficina de Pintura a Dedo',
          descricao: 'Exploração sensorial com tintas atóxicas.',
          horario: '10:00',
          sala: 'Ateliê de Artes',
          concluida: false,
          turmaId: turmaMaternal.id,
        },
        {
          id: 3,
          titulo: 'Contação de Histórias no Tapete',
          descricao: 'Leitura interativa e estímulo à linguagem oral.',
          horario: '14:00',
          sala: 'Sala 02 - Leitura',
          concluida: false,
          turmaId: turmaPre.id,
        },
        {
          id: 4,
          titulo: 'Brincadeira Dirigida no Parque',
          descricao: 'Circuitos motores e recreação ao ar livre.',
          horario: '15:30',
          sala: 'Pátio Externo',
          concluida: false,
          turmaId: turmaPre.id,
        },
      ],
    });

    await this.aviso.createMany({
      data: [
        {
          id: 1,
          titulo: 'Campanha de Atualização da Carteira de Vacinação',
          conteudo:
            'Solicitamos aos responsáveis que apresentem a carteira de vacinação atualizada na secretaria até o final do mês para conferência obrigatória.',
          prioridade: PrioridadeAviso.URGENTE,
          status: StatusAviso.APROVADO,
          autorNome: 'Diretora Márcia Oliveira',
          turmaId: null,
        },
        {
          id: 2,
          titulo: 'Reunião Geral de Pais e Mestres — 1º Semestre',
          conteudo:
            'Convidamos todas as famílias para nossa reunião pedagógica semestral no próximo sábado, às 09h00, no pátio central da EMEI Sonho de Criança.',
          prioridade: PrioridadeAviso.NORMAL,
          status: StatusAviso.APROVADO,
          autorNome: 'Diretora Márcia Oliveira',
          turmaId: null,
        },
        {
          id: 3,
          titulo: 'Dia do Brinquedo Favorito na Sexta-feira',
          conteudo:
            'Nesta sexta-feira as crianças do Maternal II poderão trazer um brinquedo identificado com nome para a roda de compartilhamento.',
          prioridade: PrioridadeAviso.NORMAL,
          status: StatusAviso.APROVADO,
          autorNome: 'Professor João Silva',
          turmaId: turmaMaternal.id,
        },
      ],
    });

    await this.auditLog.create({
      data: {
        userId: adminUser.id,
        userEmail: adminUser.email,
        userRole: adminUser.role,
        acao: 'SEED_INIT',
        entidade: 'Sistema',
        entidadeId: '1',
        detalhes:
          'Carga inicial executada com criptografia AES-256-GCM aplicada aos dados médicos de 5 alunos.',
      },
    });

    console.log('✅ Seed inicial concluído com sucesso!');
  }

  private async enableInMemoryFallback() {
    this.isUsingInMemoryFallback = true;
    const senhaHash = await bcrypt.hash('Senha123', 10);
    const now = new Date();

    const state = {
      users: [
        {
          id: 1,
          nome: 'Administrador Geral',
          email: 'admin@escola.com',
          senha: senhaHash,
          role: Role.ADMIN,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 2,
          nome: 'Diretora Márcia Oliveira',
          email: 'direcao@escola.com',
          senha: senhaHash,
          role: Role.DIRECAO,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 3,
          nome: 'Professor João Silva',
          email: 'professor@escola.com',
          senha: senhaHash,
          role: Role.PROFESSOR,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 4,
          nome: 'Fernanda Souza Martins',
          email: 'responsavel@escola.com',
          senha: senhaHash,
          role: Role.RESPONSAVEL,
          createdAt: now,
          updatedAt: now,
        },
      ] as any[],
      tokens: [] as any[],
      turmas: [
        {
          id: 1,
          nome: 'Maternal II - Estrelinhas',
          turno: 'Manhã',
          ano_letivo: 2026,
        },
        {
          id: 2,
          nome: 'Pré I - Pequenos Exploradores',
          turno: 'Tarde',
          ano_letivo: 2026,
        },
      ] as any[],
      responsaveis: [
        {
          id: 1,
          nome: 'Fernanda Souza Martins',
          cpf: '123.456.789-01',
          telefone: '(11) 98765-4321',
          userId: 4,
        },
        {
          id: 2,
          nome: 'Rodrigo Lima Costa',
          cpf: '987.654.321-09',
          telefone: '(11) 97654-3210',
          userId: null,
        },
      ] as any[],
      alunos: [
        {
          id: 1,
          nome: 'Helena Souza Martins',
          data_nascimento: '2022-02-20',
          genero: 'Feminino',
          endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
          foto_perfil_url:
            'https://ui-avatars.com/api/?name=Helena+Souza+Martins&background=FF6B9D&color=fff&size=150',
          tipo_sanguineo: encryptField('A+'),
          alergias: encryptField(
            'Proteína do leite de vaca (APLV). Dieta restrita.',
          ),
          observacoes: encryptField(
            'Precisa de ajuda para dormir, gosta de música de ninar. Levar mamadeira especial.',
          ),
          peso: 13.5,
          altura: 89,
          faltas: 1,
          turmaId: 1,
          responsavelId: 1,
        },
        {
          id: 2,
          nome: 'Miguel Souza Martins',
          data_nascimento: '2022-07-01',
          genero: 'Masculino',
          endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
          foto_perfil_url:
            'https://ui-avatars.com/api/?name=Miguel+Souza+Martins&background=4ECDC4&color=fff&size=150',
          tipo_sanguineo: encryptField('O+'),
          alergias: encryptField('Nenhuma'),
          observacoes: encryptField(
            'Comunicativo, gosta de conversar com os colegas e professores nas rodas de leitura.',
          ),
          peso: 14.8,
          altura: 94,
          faltas: 0,
          turmaId: 1,
          responsavelId: 1,
        },
        {
          id: 3,
          nome: 'Alice Lima Costa',
          data_nascimento: '2022-04-18',
          genero: 'Feminino',
          endereco: 'Alameda Santos, 321 - Jardins, São Paulo/SP',
          foto_perfil_url:
            'https://ui-avatars.com/api/?name=Alice+Lima+Costa&background=FFE66D&color=333&size=150',
          tipo_sanguineo: encryptField('AB+'),
          alergias: encryptField(
            'Glúten (doença celíaca) e corantes artificiais.',
          ),
          observacoes: encryptField(
            'Lanche enviado exclusivamente pela família. Atenção redobrada em festas escolares.',
          ),
          peso: 13.2,
          altura: 90,
          faltas: 3,
          turmaId: 1,
          responsavelId: 2,
        },
        {
          id: 4,
          nome: 'Bernardo Lima Costa',
          data_nascimento: '2021-09-30',
          genero: 'Masculino',
          endereco: 'Alameda Santos, 321 - Jardins, São Paulo/SP',
          foto_perfil_url:
            'https://ui-avatars.com/api/?name=Bernardo+Lima+Costa&background=95E1D3&color=fff&size=150',
          tipo_sanguineo: encryptField('B+'),
          alergias: encryptField(
            'Picada de insetos (uso de repelente infantil autorizado).',
          ),
          observacoes: encryptField(
            'Adora desenhar e montar blocos lógicos. Bastante concentrado.',
          ),
          peso: 16.0,
          altura: 102,
          faltas: 2,
          turmaId: 2,
          responsavelId: 2,
        },
        {
          id: 5,
          nome: 'Laura Souza Martins',
          data_nascimento: '2021-05-15',
          genero: 'Feminino',
          endereco: 'Avenida Paulista, 456 - Bela Vista, São Paulo/SP',
          foto_perfil_url:
            'https://ui-avatars.com/api/?name=Laura+Souza+Martins&background=C7CEEA&color=333&size=150',
          tipo_sanguineo: encryptField('A-'),
          alergias: encryptField('Amendoim e castanhas.'),
          observacoes: encryptField(
            'Muito carinhosa com os colegas. Gosta de atividades musicais.',
          ),
          peso: 15.4,
          altura: 99,
          faltas: 1,
          turmaId: 2,
          responsavelId: 1,
        },
      ] as any[],
      atividades: [
        {
          id: 1,
          titulo: 'Roda de Música e Acolhimento',
          descricao:
            'Atividade de musicalização infantil e integração matinal.',
          horario: '08:30',
          sala: 'Sala 01 - Musicalização',
          concluida: true,
          turmaId: 1,
        },
        {
          id: 2,
          titulo: 'Oficina de Pintura a Dedo',
          descricao: 'Exploração sensorial com tintas atóxicas.',
          horario: '10:00',
          sala: 'Ateliê de Artes',
          concluida: false,
          turmaId: 1,
        },
        {
          id: 3,
          titulo: 'Contação de Histórias no Tapete',
          descricao: 'Leitura interativa e estímulo à linguagem oral.',
          horario: '14:00',
          sala: 'Sala 02 - Leitura',
          concluida: false,
          turmaId: 2,
        },
        {
          id: 4,
          titulo: 'Brincadeira Dirigida no Parque',
          descricao: 'Circuitos motores e recreação ao ar livre.',
          horario: '15:30',
          sala: 'Pátio Externo',
          concluida: false,
          turmaId: 2,
        },
      ] as any[],
      avisos: [
        {
          id: 1,
          titulo: 'Campanha de Atualização da Carteira de Vacinação',
          conteudo:
            'Solicitamos aos responsáveis que apresentem a carteira de vacinação atualizada na secretaria até o final do mês para conferência obrigatória.',
          prioridade: PrioridadeAviso.URGENTE,
          status: StatusAviso.APROVADO,
          autorNome: 'Diretora Márcia Oliveira',
          turmaId: null,
          createdAt: now,
        },
        {
          id: 2,
          titulo: 'Reunião Geral de Pais e Mestres — 1º Semestre',
          conteudo:
            'Convidamos todas as famílias para nossa reunião pedagógica semestral no próximo sábado, às 09h00, no pátio central da EMEI Sonho de Criança.',
          prioridade: PrioridadeAviso.NORMAL,
          status: StatusAviso.APROVADO,
          autorNome: 'Diretora Márcia Oliveira',
          turmaId: null,
          createdAt: now,
        },
        {
          id: 3,
          titulo: 'Dia do Brinquedo Favorito na Sexta-feira',
          conteudo:
            'Nesta sexta-feira as crianças do Maternal II poderão trazer um brinquedo identificado com nome para a roda de compartilhamento.',
          prioridade: PrioridadeAviso.NORMAL,
          status: StatusAviso.APROVADO,
          autorNome: 'Professor João Silva',
          turmaId: 1,
          createdAt: now,
        },
      ] as any[],
      auditLogs: [
        {
          id: 1,
          userId: 1,
          userEmail: 'admin@escola.com',
          userRole: Role.ADMIN,
          acao: 'SEED_INIT',
          entidade: 'Sistema',
          entidadeId: '1',
          detalhes:
            'Carga inicial executada com criptografia AES-256-GCM aplicada aos dados médicos de 5 alunos.',
          createdAt: now,
        },
      ] as any[],
    };

    const nextId = (arr: any[]) =>
      arr.length > 0 ? Math.max(...arr.map((i) => Number(i.id) || 0)) + 1 : 1;

    const enrichAluno = (a: any) => ({
      ...a,
      turma: state.turmas.find((t) => t.id === a.turmaId) || null,
      responsavel:
        state.responsaveis.find((r) => r.id === a.responsavelId) || null,
    });

    const enrichResponsavel = (r: any) => ({
      ...r,
      user: state.users.find((u) => u.id === r.userId) || null,
      alunos: state.alunos.filter((a) => a.responsavelId === r.id),
    });

    const enrichTurma = (t: any) => ({
      ...t,
      alunos: state.alunos.filter((a) => a.turmaId === t.id),
      atividades: state.atividades.filter((at) => at.turmaId === t.id),
      avisos: state.avisos.filter((av) => av.turmaId === t.id),
      _count: {
        alunos: state.alunos.filter((a) => a.turmaId === t.id).length,
        atividades: state.atividades.filter((at) => at.turmaId === t.id).length,
        avisos: state.avisos.filter((av) => av.turmaId === t.id).length,
      },
    });

    Object.defineProperty(this, 'user', {
      value: {
        count: async () => state.users.length,
        findUnique: async ({ where }: any) => {
          const u = state.users.find(
            (item) =>
              (where.id !== undefined && item.id === Number(where.id)) ||
              (where.email !== undefined &&
                item.email.toLowerCase() === String(where.email).toLowerCase()),
          );
          if (!u) return null;
          const resp = state.responsaveis.find((r) => r.userId === u.id);
          return {
            ...u,
            responsavel: resp ? enrichResponsavel(resp) : null,
          };
        },
        findMany: async ({ where }: any = {}) => {
          let list = [...state.users];
          if (where?.role) {
            list = list.filter((u) => u.role === where.role);
          }
          return list
            .map((u) => ({
              ...u,
              responsavel:
                state.responsaveis.find((r) => r.userId === u.id) || null,
            }))
            .sort((a, b) => a.nome.localeCompare(b.nome));
        },
        create: async ({ data }: any) => {
          const created = {
            id: data.id || nextId(state.users),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          state.users.push(created);
          return created;
        },
      },
    });

    Object.defineProperty(this, 'token', {
      value: {
        findUnique: async ({ where }: any) => {
          const t = state.tokens.find((item) => item.token === where.token);
          if (!t) return null;
          return {
            ...t,
            user: state.users.find((u) => u.id === t.userId) || null,
          };
        },
        create: async ({ data }: any) => {
          const created = {
            id: nextId(state.tokens),
            ...data,
            createdAt: new Date(),
          };
          state.tokens.push(created);
          return created;
        },
        deleteMany: async ({ where }: any) => {
          state.tokens = state.tokens.filter((t) => t.token !== where?.token);
          return { count: 1 };
        },
      },
    });

    Object.defineProperty(this, 'aluno', {
      value: {
        findMany: async ({ where }: any = {}) => {
          let list = [...state.alunos];
          if (where?.turmaId !== undefined) {
            if (typeof where.turmaId === 'object' && where.turmaId.in) {
              list = list.filter((a) => where.turmaId.in.includes(a.turmaId));
            } else {
              list = list.filter((a) => a.turmaId === Number(where.turmaId));
            }
          }
          if (where?.responsavel?.userId !== undefined) {
            const respIds = state.responsaveis
              .filter((r) => r.userId === Number(where.responsavel.userId))
              .map((r) => r.id);
            list = list.filter((a) => respIds.includes(a.responsavelId));
          }
          return list
            .map(enrichAluno)
            .sort((a, b) => a.nome.localeCompare(b.nome));
        },
        findUnique: async ({ where }: any) => {
          const a = state.alunos.find((item) => item.id === Number(where.id));
          return a ? enrichAluno(a) : null;
        },
        create: async ({ data }: any) => {
          const created = {
            id: data.id || nextId(state.alunos),
            faltas: 0,
            ...data,
          };
          state.alunos.push(created);
          return enrichAluno(created);
        },
        update: async ({ where, data }: any) => {
          const idx = state.alunos.findIndex((a) => a.id === Number(where.id));
          if (idx === -1) return null;
          state.alunos[idx] = { ...state.alunos[idx], ...data };
          return enrichAluno(state.alunos[idx]);
        },
        delete: async ({ where }: any) => {
          const idx = state.alunos.findIndex((a) => a.id === Number(where.id));
          if (idx === -1) return null;
          const [removed] = state.alunos.splice(idx, 1);
          return removed;
        },
      },
    });

    Object.defineProperty(this, 'turma', {
      value: {
        findMany: async () =>
          state.turmas
            .map(enrichTurma)
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        findUnique: async ({ where }: any) => {
          const t = state.turmas.find((item) => item.id === Number(where.id));
          return t ? enrichTurma(t) : null;
        },
        create: async ({ data }: any) => {
          const created = { id: data.id || nextId(state.turmas), ...data };
          state.turmas.push(created);
          return enrichTurma(created);
        },
        update: async ({ where, data }: any) => {
          const idx = state.turmas.findIndex((t) => t.id === Number(where.id));
          if (idx === -1) return null;
          state.turmas[idx] = { ...state.turmas[idx], ...data };
          return enrichTurma(state.turmas[idx]);
        },
        delete: async ({ where }: any) => {
          const idx = state.turmas.findIndex((t) => t.id === Number(where.id));
          if (idx === -1) return null;
          const [removed] = state.turmas.splice(idx, 1);
          return removed;
        },
      },
    });

    Object.defineProperty(this, 'responsavel', {
      value: {
        findMany: async () =>
          state.responsaveis
            .map(enrichResponsavel)
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        findUnique: async ({ where }: any) => {
          const r = state.responsaveis.find(
            (item) =>
              (where.id !== undefined && item.id === Number(where.id)) ||
              (where.cpf !== undefined && item.cpf === where.cpf),
          );
          return r ? enrichResponsavel(r) : null;
        },
        create: async ({ data }: any) => {
          const created = {
            id: data.id || nextId(state.responsaveis),
            ...data,
          };
          state.responsaveis.push(created);
          return enrichResponsavel(created);
        },
        update: async ({ where, data }: any) => {
          const idx = state.responsaveis.findIndex(
            (r) => r.id === Number(where.id),
          );
          if (idx === -1) return null;
          state.responsaveis[idx] = { ...state.responsaveis[idx], ...data };
          return enrichResponsavel(state.responsaveis[idx]);
        },
        delete: async ({ where }: any) => {
          const idx = state.responsaveis.findIndex(
            (r) => r.id === Number(where.id),
          );
          if (idx === -1) return null;
          const [removed] = state.responsaveis.splice(idx, 1);
          return removed;
        },
      },
    });

    Object.defineProperty(this, 'atividade', {
      value: {
        findMany: async ({ where }: any = {}) => {
          let list = [...state.atividades];
          if (where?.turmaId !== undefined) {
            if (typeof where.turmaId === 'object' && where.turmaId.in) {
              list = list.filter((a) => where.turmaId.in.includes(a.turmaId));
            } else {
              list = list.filter((a) => a.turmaId === Number(where.turmaId));
            }
          }
          return list
            .map((a) => ({
              ...a,
              turma: state.turmas.find((t) => t.id === a.turmaId) || null,
            }))
            .sort((a, b) => a.horario.localeCompare(b.horario));
        },
        findUnique: async ({ where }: any) => {
          const a = state.atividades.find(
            (item) => item.id === Number(where.id),
          );
          return a
            ? {
                ...a,
                turma: state.turmas.find((t) => t.id === a.turmaId) || null,
              }
            : null;
        },
        create: async ({ data }: any) => {
          const created = {
            id: data.id || nextId(state.atividades),
            concluida: false,
            ...data,
          };
          state.atividades.push(created);
          return {
            ...created,
            turma: state.turmas.find((t) => t.id === created.turmaId) || null,
          };
        },
        update: async ({ where, data }: any) => {
          const idx = state.atividades.findIndex(
            (a) => a.id === Number(where.id),
          );
          if (idx === -1) return null;
          state.atividades[idx] = { ...state.atividades[idx], ...data };
          return {
            ...state.atividades[idx],
            turma:
              state.turmas.find(
                (t) => t.id === state.atividades[idx].turmaId,
              ) || null,
          };
        },
        delete: async ({ where }: any) => {
          const idx = state.atividades.findIndex(
            (a) => a.id === Number(where.id),
          );
          if (idx === -1) return null;
          const [removed] = state.atividades.splice(idx, 1);
          return removed;
        },
      },
    });

    Object.defineProperty(this, 'aviso', {
      value: {
        findMany: async ({ where }: any = {}) => {
          let list = [...state.avisos];
          if (where?.status) {
            if (typeof where.status === 'object' && where.status.in) {
              list = list.filter((a) =>
                where.status.in.includes(a.status || StatusAviso.APROVADO),
              );
            } else {
              list = list.filter(
                (a) => (a.status || StatusAviso.APROVADO) === where.status,
              );
            }
          }
          if (Array.isArray(where?.OR)) {
            list = list.filter((a) =>
              where.OR.some((cond: any) => {
                if (cond.turmaId === null) return a.turmaId === null;
                if (typeof cond.turmaId === 'object' && cond.turmaId?.in) {
                  return cond.turmaId.in.includes(a.turmaId);
                }
                return a.turmaId === Number(cond.turmaId);
              }),
            );
          }
          return list
            .map((a) => ({
              ...a,
              turma: state.turmas.find((t) => t.id === a.turmaId) || null,
            }))
            .sort((a, b) => b.id - a.id);
        },
        findUnique: async ({ where }: any) => {
          const a = state.avisos.find((item) => item.id === Number(where.id));
          return a
            ? {
                ...a,
                turma: state.turmas.find((t) => t.id === a.turmaId) || null,
              }
            : null;
        },
        create: async ({ data }: any) => {
          const created = {
            id: data.id || nextId(state.avisos),
            status: StatusAviso.APROVADO,
            createdAt: new Date(),
            ...data,
          };
          state.avisos.push(created);
          return {
            ...created,
            turma: state.turmas.find((t) => t.id === created.turmaId) || null,
          };
        },
        update: async ({ where, data }: any) => {
          const idx = state.avisos.findIndex((a) => a.id === Number(where.id));
          if (idx === -1) return null;
          state.avisos[idx] = { ...state.avisos[idx], ...data };
          return {
            ...state.avisos[idx],
            turma:
              state.turmas.find((t) => t.id === state.avisos[idx].turmaId) ||
              null,
          };
        },
        delete: async ({ where }: any) => {
          const idx = state.avisos.findIndex((a) => a.id === Number(where.id));
          if (idx === -1) return null;
          const [removed] = state.avisos.splice(idx, 1);
          return removed;
        },
      },
    });

    Object.defineProperty(this, 'auditLog', {
      value: {
        findMany: async ({ where, take }: any = {}) => {
          let list = [...state.auditLogs];
          if (where?.entidade) {
            list = list.filter((l) => l.entidade === where.entidade);
          }
          if (where?.acao) {
            list = list.filter((l) => l.acao === where.acao);
          }
          return list
            .sort((a, b) => b.id - a.id)
            .slice(0, take || 200);
        },
        create: async ({ data }: any) => {
          const created = {
            id: nextId(state.auditLogs),
            ...data,
            createdAt: new Date(),
          };
          state.auditLogs.push(created);
          return created;
        },
      },
    });

    this.inMemoryStateRef = state;
    this.inMemoryPareceres = [
      {
        id: 1,
        titulo: 'Desenvolvimento Socioemocional, Linguagem e Autonomia',
        periodo: '1º Semestre / 2026',
        conteudo:
          'A aluna Helena adaptou-se muito bem à rotina do Maternal II. Participa com entusiasmo das rodas de música e demonstra excelente interação e empatia com os colegas.',
        professorNome: 'Professor João Silva',
        alunoId: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        titulo: 'Coordenação Motora e Expressão Criativa',
        periodo: '1º Semestre / 2026',
        conteudo:
          'O aluno Bernardo apresenta ótima concentração nas atividades de montagem com blocos lógicos e pintura, evoluindo continuamente na coordenação motora fina.',
        professorNome: 'Professor João Silva',
        alunoId: 4,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  private enrichParecerInMemory(p: any) {
    const aluno =
      this.inMemoryStateRef?.alunos.find((a: any) => a.id === p.alunoId) ||
      null;
    const turma = aluno
      ? this.inMemoryStateRef?.turmas.find(
          (t: any) => t.id === aluno.turmaId,
        ) || null
      : null;
    return {
      ...p,
      aluno: aluno
        ? {
            id: aluno.id,
            nome: aluno.nome,
            foto_perfil_url: aluno.foto_perfil_url,
            turmaId: aluno.turmaId,
            turma,
          }
        : null,
    };
  }

  async listarPareceres(filters?: {
    alunoId?: number;
    allowedAlunosIds?: number[];
  }) {
    if (this.isUsingInMemoryFallback) {
      let list = [...this.inMemoryPareceres];
      if (filters?.alunoId !== undefined) {
        list = list.filter((p) => p.alunoId === Number(filters.alunoId));
      }
      if (Array.isArray(filters?.allowedAlunosIds)) {
        list = list.filter((p) =>
          filters.allowedAlunosIds!.includes(Number(p.alunoId)),
        );
      }
      return list
        .map((p) => this.enrichParecerInMemory(p))
        .sort((a, b) => Number(b.id) - Number(a.id));
    }

    if (
      Array.isArray(filters?.allowedAlunosIds) &&
      filters.allowedAlunosIds.length === 0
    ) {
      return [];
    }

    const rows = await this.$queryRawUnsafe<any[]>(`
      SELECT
        p.id, p.titulo, p.periodo, p.conteudo, p.professorNome, p.alunoId, p.createdAt, p.updatedAt,
        a.nome as alunoNome, a.foto_perfil_url as alunoFoto, a.turmaId as alunoTurmaId,
        t.id as turmaId, t.nome as turmaNome, t.turno as turmaTurno
      FROM \`pareceres\` p
      LEFT JOIN \`alunos\` a ON a.id = p.alunoId
      LEFT JOIN \`turmas\` t ON t.id = a.turmaId
      ORDER BY p.createdAt DESC, p.id DESC
    `);

    return rows
      .filter((row) => {
        if (
          filters?.alunoId !== undefined &&
          Number(row.alunoId) !== Number(filters.alunoId)
        ) {
          return false;
        }
        if (
          Array.isArray(filters?.allowedAlunosIds) &&
          !filters.allowedAlunosIds.includes(Number(row.alunoId))
        ) {
          return false;
        }
        return true;
      })
      .map((row) => ({
        id: Number(row.id),
        titulo: row.titulo,
        periodo: row.periodo,
        conteudo: row.conteudo,
        professorNome: row.professorNome,
        alunoId: Number(row.alunoId),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        aluno: row.alunoNome
          ? {
              id: Number(row.alunoId),
              nome: row.alunoNome,
              foto_perfil_url: row.alunoFoto,
              turmaId: Number(row.alunoTurmaId),
              turma: row.turmaNome
                ? {
                    id: Number(row.turmaId),
                    nome: row.turmaNome,
                    turno: row.turmaTurno,
                  }
                : null,
            }
          : null,
      }));
  }

  async buscarParecerPorId(id: number) {
    const all = await this.listarPareceres();
    return all.find((p) => Number(p.id) === Number(id)) || null;
  }

  async criarParecer(data: {
    titulo: string;
    periodo: string;
    conteudo: string;
    professorNome: string;
    alunoId: number;
  }) {
    if (this.isUsingInMemoryFallback) {
      const nextId =
        this.inMemoryPareceres.length > 0
          ? Math.max(...this.inMemoryPareceres.map((p) => Number(p.id) || 0)) +
            1
          : 1;
      const novo = {
        id: nextId,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryPareceres.push(novo);
      return this.enrichParecerInMemory(novo);
    }

    await this.$executeRawUnsafe(
      `INSERT INTO \`pareceres\` (\`titulo\`, \`periodo\`, \`conteudo\`, \`professorNome\`, \`alunoId\`) VALUES (?, ?, ?, ?, ?)`,
      data.titulo,
      data.periodo,
      data.conteudo,
      data.professorNome,
      Number(data.alunoId),
    );
    const all = await this.listarPareceres({ alunoId: Number(data.alunoId) });
    return all[0];
  }

  async atualizarParecer(
    id: number,
    data: Partial<{
      titulo: string;
      periodo: string;
      conteudo: string;
      professorNome: string;
      alunoId: number;
    }>,
  ) {
    if (this.isUsingInMemoryFallback) {
      const idx = this.inMemoryPareceres.findIndex(
        (p) => Number(p.id) === Number(id),
      );
      if (idx === -1) return null;
      this.inMemoryPareceres[idx] = {
        ...this.inMemoryPareceres[idx],
        ...data,
        updatedAt: new Date(),
      };
      return this.enrichParecerInMemory(this.inMemoryPareceres[idx]);
    }

    const current = await this.buscarParecerPorId(id);
    if (!current) return null;

    await this.$executeRawUnsafe(
      `UPDATE \`pareceres\` SET \`titulo\` = ?, \`periodo\` = ?, \`conteudo\` = ?, \`professorNome\` = ?, \`alunoId\` = ? WHERE \`id\` = ?`,
      data.titulo ?? current.titulo,
      data.periodo ?? current.periodo,
      data.conteudo ?? current.conteudo,
      data.professorNome ?? current.professorNome,
      Number(data.alunoId ?? current.alunoId),
      Number(id),
    );

    return this.buscarParecerPorId(id);
  }

  async deletarParecer(id: number) {
    if (this.isUsingInMemoryFallback) {
      this.inMemoryPareceres = this.inMemoryPareceres.filter(
        (p) => Number(p.id) !== Number(id),
      );
      return;
    }
    await this.$executeRawUnsafe(
      `DELETE FROM \`pareceres\` WHERE \`id\` = ?`,
      Number(id),
    );
  }

  async onModuleDestroy() {
    if (!this.isUsingInMemoryFallback) {
      await this.$disconnect();
    }
  }
}
