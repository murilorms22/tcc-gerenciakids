import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ParsePositiveIntPipe } from '../common/pipes/parse-positive-int.pipe';
import { CreateTurmaDto } from './dto/create-turma.dto';
import { UpdateTurmaDto } from './dto/update-turma.dto';
import { TurmasService } from './turmas.service';

@Controller('turmas')
@UseGuards(AuthGuard, RolesGuard)
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findAll() {
    return this.turmasService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.turmasService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO)
  create(@Body() dto: CreateTurmaDto) {
    return this.turmasService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateTurmaDto,
  ) {
    return this.turmasService.update(id, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateTurmaDto,
  ) {
    return this.turmasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.turmasService.remove(id);
  }
}

