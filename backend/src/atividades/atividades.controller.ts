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
import { AtividadesService } from './atividades.service';
import { CreateAtividadeDto } from './dto/create-atividade.dto';
import { UpdateAtividadeDto } from './dto/update-atividade.dto';

@Controller('atividades')
@UseGuards(AuthGuard, RolesGuard)
export class AtividadesController {
  constructor(private readonly atividadesService: AtividadesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('turmaId') turmaId?: string,
  ) {
    return this.atividadesService.findAll(
      user,
      turmaId ? Number(turmaId) : undefined,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.atividadesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  create(@Body() dto: CreateAtividadeDto) {
    return this.atividadesService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.atividadesService.update(id, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAtividadeDto,
  ) {
    return this.atividadesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.atividadesService.remove(id);
  }
}

