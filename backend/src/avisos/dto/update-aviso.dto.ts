import { PrioridadeAviso } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAvisoDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  conteudo?: string;

  @IsOptional()
  @IsEnum(PrioridadeAviso)
  prioridade?: PrioridadeAviso;

  @IsOptional()
  @IsString()
  autorNome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turmaId?: number | null;
}

