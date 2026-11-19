import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Erro interno no servidor.';
    let errorName = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorName = (res as any).error || exception.name;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002': {
          status = HttpStatus.CONFLICT;
          errorName = 'Conflict';
          const target = Array.isArray(exception.meta?.target)
            ? (exception.meta?.target as string[]).join(', ')
            : String(exception.meta?.target || 'campo único');
          message = `Conflito de duplicidade: já existe um registro com este valor (${target}).`;
          break;
        }
        case 'P2003': {
          status = HttpStatus.BAD_REQUEST;
          errorName = 'Bad Request';
          message =
            'Violação de integridade referencial: o registro vinculado não existe ou possui dependências ativas.';
          break;
        }
        case 'P2025': {
          status = HttpStatus.NOT_FOUND;
          errorName = 'Not Found';
          message = 'Registro solicitado não foi encontrado no banco de dados.';
          break;
        }
        default: {
          status = HttpStatus.BAD_REQUEST;
          errorName = 'Database Error';
          message = `Erro de operação no banco de dados (${exception.code}).`;
          break;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      error: errorName,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

