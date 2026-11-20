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
import { CreateParecerDto } from './dto/create-parecer.dto';
import { UpdateParecerDto } from './dto/update-parecer.dto';
import { PareceresService } from './pareceres.service';

@Controller('pareceres')
@UseGuards(AuthGuard, RolesGuard)
export class PareceresController {
  constructor(private readonly pareceresService: PareceresService) {}

  @Get()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('alunoId') alunoId?: string,
  ) {
    return this.pareceresService.findAll(
      user,
      alunoId ? Number(alunoId) : undefined,
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR, Role.RESPONSAVEL)
  findOne(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.pareceresService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  create(
    @Body() dto: CreateParecerDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.pareceresService.create(dto, user);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePut(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateParecerDto,
  ) {
    return this.pareceresService.update(id, dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  updatePatch(
    @Param('id', ParsePositiveIntPipe) id: number,
    @Body() dto: UpdateParecerDto,
  ) {
    return this.pareceresService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.DIRECAO, Role.PROFESSOR)
  remove(@Param('id', ParsePositiveIntPipe) id: number) {
    return this.pareceresService.remove(id);
  }
}
