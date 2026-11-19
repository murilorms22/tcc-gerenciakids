import { PrioridadeAviso } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAvisoDto {
  @IsString({ message: 'O título do aviso deve ser um texto.' })
  @IsNotEmpty({ message: 'O título do aviso é obrigatório.' })
  titulo: string;

  @IsString({ message: 'O conteúdo do aviso deve ser um texto.' })
  @IsNotEmpty({ message: 'O conteúdo do aviso é obrigatório.' })
  conteudo: string;

  @IsOptional()
  @IsEnum(PrioridadeAviso, {
    message: 'A prioridade deve ser NORMAL ou URGENTE.',
  })
  prioridade?: PrioridadeAviso;

  @IsOptional()
  @IsString()
  autorNome?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  turmaId?: number | null;
}

