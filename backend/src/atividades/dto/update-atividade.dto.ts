import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAtividadeDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsString()
  horario?: string;

  @IsOptional()
  @IsString()
  sala?: string;

  @IsOptional()
  @IsBoolean()
  concluida?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  turmaId?: number;
}

