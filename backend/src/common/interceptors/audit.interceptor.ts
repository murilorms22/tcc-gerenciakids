import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method;
    const url: string = (request.originalUrl || request.url || '').split('?')[0];

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const auditEntry = this.resolveAuditMetadata(
            method,
            url,
            request,
            responseBody,
          );
          if (!auditEntry) return;

          const user = request.user;
          await this.prisma.auditLog.create({
            data: {
              userId: user?.id ?? auditEntry.fallbackUserId ?? null,
              userEmail: user?.email ?? auditEntry.fallbackEmail ?? null,
              userRole: user?.role ?? auditEntry.fallbackRole ?? null,
              acao: auditEntry.acao,
              entidade: auditEntry.entidade,
              entidadeId: auditEntry.entidadeId,
              detalhes: auditEntry.detalhes,
            },
          });
        } catch {
          // Falha silenciosa para nunca interromper o fluxo de resposta principal
        }
      }),
    );
  }

  private resolveAuditMetadata(
    method: string,
    url: string,
    request: any,
    responseBody: any,
  ): {
    acao: string;
    entidade: string;
    entidadeId: string | null;
    detalhes: string;
    fallbackUserId?: number;
    fallbackEmail?: string;
    fallbackRole?: string;
  } | null {
    const unwrapped =
      responseBody && typeof responseBody === 'object' && 'data' in responseBody
        ? responseBody.data
        : responseBody;

    // 1. Leitura individual de ficha médica / dados do aluno (GET /alunos/:id)
    const alunoGetMatch = url.match(/^\/alunos\/(\d+)$/);
    if (method === 'GET' && alunoGetMatch) {
      const alunoId = alunoGetMatch[1];
      const nomeAluno = unwrapped?.nome ? ` (${unwrapped.nome})` : '';
      return {
        acao: 'READ_FICHA_MEDICA',
        entidade: 'Aluno',
        entidadeId: alunoId,
        detalhes: `Consulta individual à ficha cadastral e médica descriptografada do aluno #${alunoId}${nomeAluno}.`,
      };
    }

    // Ignorar outros GETs ou rotas de leitura de auditoria
    if (method === 'GET' || url.startsWith('/audit-logs')) {
      return null;
    }

    // Ignorar login/logout/me para focar em mutações de dados e registro
    if (url === '/auth/login' || url === '/auth/logout') {
      return null;
    }

    if (method === 'POST' && url === '/auth/register') {
      return {
        acao: 'REGISTER_USER',
        entidade: 'User',
        entidadeId: unwrapped?.user?.id ? String(unwrapped.user.id) : null,
        detalhes: `Auto-cadastro de usuário com perfil forçado RESPONSAVEL (${unwrapped?.user?.email || request.body?.email || ''}).`,
        fallbackUserId: unwrapped?.user?.id,
        fallbackEmail: unwrapped?.user?.email,
        fallbackRole: unwrapped?.user?.role,
      };
    }

    // 2. Registro de chamada (PATCH /alunos/:id/chamada)
    const chamadaMatch = url.match(/^\/alunos\/(\d+)\/chamada$/);
    if (method === 'PATCH' && chamadaMatch) {
      const alunoId = chamadaMatch[1];
      return {
        acao: 'UPDATE_CHAMADA',
        entidade: 'Aluno',
        entidadeId: alunoId,
        detalhes: `Registro de chamada/frequência para o aluno #${alunoId} (total de faltas: ${unwrapped?.faltas ?? 'atualizado'}).`,
      };
    }

    // 3. Mapeamento genérico de mutações (POST, PUT, PATCH, DELETE)
    const segments = url.split('/').filter(Boolean);
    const resourceSegment = segments[0];
    const paramId = segments[1] || (unwrapped?.id ? String(unwrapped.id) : null);

    const entityMap: Record<string, string> = {
      alunos: 'Aluno',
      turmas: 'Turma',
      responsaveis: 'Responsavel',
      atividades: 'Atividade',
      avisos: 'Aviso',
      pareceres: 'Parecer',
      users: 'User',
    };

    const entidade = entityMap[resourceSegment];
    if (!entidade) return null;

    let acao = method;
    if (method === 'POST') acao = 'CREATE';
    else if (method === 'PUT' || method === 'PATCH') acao = 'UPDATE';
    else if (method === 'DELETE') acao = 'DELETE';

    const label =
      unwrapped?.nome ||
      unwrapped?.titulo ||
      request.body?.nome ||
      request.body?.titulo ||
      '';

    const cryptoNote =
      entidade === 'Aluno' && (acao === 'CREATE' || acao === 'UPDATE')
        ? ' [Campos médicos criptografados com AES-256-GCM]'
        : '';

    return {
      acao,
      entidade,
      entidadeId: paramId ? String(paramId) : null,
      detalhes: `${acao} em ${entidade}${paramId ? ` #${paramId}` : ''}${label ? ` (${label})` : ''}.${cryptoNote}`,
    };
  }
}

