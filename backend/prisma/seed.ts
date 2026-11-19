import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient, Role, PrioridadeAviso } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Carrega .env explicitamente para garantir que ENCRYPTION_KEY (64 hex = 32 bytes) esteja disponível
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const rawVal = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) {
      process.env[key] = rawVal;
    }
  }
}

const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 Iniciando seed do banco de dados GerenciaKids (MySQL + LGPD)...');

  // Limpeza ordenada respeitando chaves estrangeiras
  await prisma.auditLog.deleteMany();
  await prisma.aviso.deleteMany();
  await prisma.atividade.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.responsavel.deleteMany();
  await prisma.turma.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  const senhaHash = await bcrypt.hash('Senha123', 10);

  // 1. Criação dos 4 Usuários com IDs determinísticos (1 a 4)
  const adminUser = await prisma.user.create({
    data: {
      id: 1,
      nome: 'Administrador Geral',
      email: 'admin@escola.com',
      senha: senhaHash,
      role: Role.ADMIN,
    },
  });

  const direcaoUser = await prisma.user.create({
    data: {
      id: 2,
      nome: 'Diretora Márcia Oliveira',
      email: 'direcao@escola.com',
      senha: senhaHash,
      role: Role.DIRECAO,
    },
  });

  const professorUser = await prisma.user.create({
    data: {
      id: 3,
      nome: 'Professor João Silva',
      email: 'professor@escola.com',
      senha: senhaHash,
      role: Role.PROFESSOR,
    },
  });

  const responsavelUser = await prisma.user.create({
    data: {
      id: 4,
      nome: 'Fernanda Souza Martins',
      email: 'responsavel@escola.com',
      senha: senhaHash,
      role: Role.RESPONSAVEL,
    },
  });

  console.log(
    `✅ 4 usuários criados (senha padrão: Senha123) -> IDs: [${adminUser.id}, ${direcaoUser.id}, ${professorUser.id}, ${responsavelUser.id}]`,
  );

  // 2. Criação de 2 Turmas com IDs determinísticos (1 e 2)
  const turmaMaternal = await prisma.turma.create({
    data: {
      id: 1,
      nome: 'Maternal II - Estrelinhas',
      turno: 'Manhã',
      ano_letivo: 2026,
    },
  });

  const turmaPre = await prisma.turma.create({
    data: {
      id: 2,
      nome: 'Pré I - Pequenos Exploradores',
      turno: 'Tarde',
      ano_letivo: 2026,
    },
  });

  console.log(`✅ 2 turmas criadas: ${turmaMaternal.nome}, ${turmaPre.nome}`);

  // 3. Criação de 2 Responsáveis com IDs determinísticos (1 e 2)
  const respFernanda = await prisma.responsavel.create({
    data: {
      id: 1,
      nome: 'Fernanda Souza Martins',
      cpf: '123.456.789-01',
      telefone: '(11) 98765-4321',
      userId: responsavelUser.id,
    },
  });

  const respRodrigo = await prisma.responsavel.create({
    data: {
      id: 2,
      nome: 'Rodrigo Lima Costa',
      cpf: '987.654.321-09',
      telefone: '(11) 97654-3210',
      userId: null,
    },
  });

  console.log(`✅ 2 responsáveis criados: ${respFernanda.nome}, ${respRodrigo.nome}`);

  // 4. Criação de 5 Alunos com IDs determinísticos (1 a 5) e dados médicos criptografados via AES-256-GCM
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
      alergias: encryptField('Proteína do leite de vaca (APLV). Dieta restrita.'),
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
      alergias: encryptField('Glúten (doença celíaca) e corantes artificiais.'),
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
      alergias: encryptField('Picada de insetos (uso de repelente infantil autorizado).'),
      observacoes: encryptField('Adora desenhar e montar blocos lógicos. Bastante concentrado.'),
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
      observacoes: encryptField('Muito carinhosa com os colegas. Gosta de atividades musicais.'),
      peso: 15.4,
      altura: 99,
      faltas: 1,
      turmaId: turmaPre.id,
      responsavelId: respFernanda.id,
    },
  ];

  for (const aluno of alunosData) {
    await prisma.aluno.create({ data: aluno });
  }

  console.log('✅ 5 alunos criados com ficha médica criptografada (AES-256-GCM)');

  // 5. Criação de 4 Atividades
  await prisma.atividade.createMany({
    data: [
      {
        id: 1,
        titulo: 'Roda de Música e Acolhimento',
        descricao: 'Atividade de musicalização infantil e integração matinal.',
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

  console.log('✅ 4 atividades criadas');

  // 6. Criação de 3 Avisos
  await prisma.aviso.createMany({
    data: [
      {
        id: 1,
        titulo: 'Campanha de Atualização da Carteira de Vacinação',
        conteudo:
          'Solicitamos aos responsáveis que apresentem a carteira de vacinação atualizada na secretaria até o final do mês para conferência obrigatória.',
        prioridade: PrioridadeAviso.URGENTE,
        autorNome: 'Diretora Márcia Oliveira',
        turmaId: null,
      },
      {
        id: 2,
        titulo: 'Reunião Geral de Pais e Mestres — 1º Semestre',
        conteudo:
          'Convidamos todas as famílias para nossa reunião pedagógica semestral no próximo sábado, às 09h00, no pátio central da EMEI Sonho de Criança.',
        prioridade: PrioridadeAviso.NORMAL,
        autorNome: 'Diretora Márcia Oliveira',
        turmaId: null,
      },
      {
        id: 3,
        titulo: 'Dia do Brinquedo Favorito na Sexta-feira',
        conteudo:
          'Nesta sexta-feira as crianças do Maternal II poderão trazer um brinquedo identificado com nome para a roda de compartilhamento.',
        prioridade: PrioridadeAviso.NORMAL,
        autorNome: 'Professor João Silva',
        turmaId: turmaMaternal.id,
      },
    ],
  });

  console.log('✅ 3 avisos criados');

  // 7. Log inicial de auditoria LGPD
  await prisma.auditLog.create({
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

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
