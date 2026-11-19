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
import { AvisosService } from './avisos.service';
import { CreateAvisoDto } from './dto/create-aviso.dto';
import { UpdateAvisoDto } from './dto/update-aviso.dto';

@Controller('avisos')
@UseGuards(AuthGuard, RolesGuard)
export class AvisosController {
  constructor(private readonly avisosService: AvisosService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('turmaId') turmaId?: string,
  ) {
    return this.avisosService.findAll(
      user,
      turmaId ? Number(turmaId) : undefined,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.avisosService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  create(
    @Body() dto: CreateAvisoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.avisosService.create(dto, user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAvisoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.avisosService.update(id, dto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateAvisoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.avisosService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.avisosService.remove(id);
  }
}

