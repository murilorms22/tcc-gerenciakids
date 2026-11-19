import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';
import { UpdateChamadaDto } from './dto/update-chamada.dto';

@Controller('alunos')
@UseGuards(AuthGuard, RolesGuard)
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('turmaId') turmaId?: string,
  ) {
    return this.alunosService.findAll(
      user,
      turmaId ? Number(turmaId) : undefined,
    );
  }

  @Get(':id/criptografia')
  @Roles(Role.ADMIN, Role.DIRECAO)
  findOneEncryptedRaw(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.alunosService.findOneEncryptedRaw(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findOne(
    @Param('id', ParsePositiveIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.alunosService.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO)
  create(@Body() dto: CreateAlunoDto) {
    return this.alunosService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.alunosService.update(id, dto);
  }

  @Patch(':id/chamada')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  registrarChamada(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateChamadaDto,
  ) {
    return this.alunosService.registrarChamada(id, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAlunoDto,
  ) {
    return this.alunosService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.alunosService.remove(id);
  }
}

