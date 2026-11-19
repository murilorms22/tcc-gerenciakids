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
import { CreateResponsavelDto } from './dto/create-responsavel.dto';
import { UpdateResponsavelDto } from './dto/update-responsavel.dto';
import { ResponsaveisService } from './responsaveis.service';

@Controller('responsaveis')
@UseGuards(AuthGuard, RolesGuard)
export class ResponsaveisController {
  constructor(private readonly responsaveisService: ResponsaveisService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  findAll() {
    return this.responsaveisService.findAll();
  }

  @Get('usuarios')
  @Roles(Role.ADMIN, Role.DIRECAO)
  findAvailableUsers() {
    return this.responsaveisService.findAvailableUsers();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.responsaveisService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO)
  create(@Body() dto: CreateResponsavelDto) {
    return this.responsaveisService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateResponsavelDto,
  ) {
    return this.responsaveisService.update(id, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateResponsavelDto,
  ) {
    return this.responsaveisService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.responsaveisService.remove(id);
  }
}

