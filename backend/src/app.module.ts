import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AlunosModule } from './alunos/alunos.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { AtividadesModule } from './atividades/atividades.module';
import { AuthModule } from './auth/auth.module';
import { AvisosModule } from './avisos/avisos.module';
import { CryptoModule } from './common/crypto/crypto.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { PrismaModule } from './prisma/prisma.module';
import { ResponsaveisModule } from './responsaveis/responsaveis.module';
import { TurmasModule } from './turmas/turmas.module';

@Module({
  imports: [
    PrismaModule,
    CryptoModule,
    AuthModule,
    TurmasModule,
    ResponsaveisModule,
    AlunosModule,
    AtividadesModule,
    AvisosModule,
    AuditLogsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
  ],
})
export class AppModule {}

