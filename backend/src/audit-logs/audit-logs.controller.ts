import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLogsService } from './audit-logs.service';

@Controller('audit-logs')
@UseGuards(AuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO)
  findAll(
    @Query('entidade') entidade?: string,
    @Query('acao') acao?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.findAll({
      entidade,
      acao,
      limit: limit ? Number(limit) : undefined,
    });
  }
}

