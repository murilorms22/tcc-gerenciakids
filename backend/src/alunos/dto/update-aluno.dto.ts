import { Type } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateAlunoDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  data_nascimento?: string;

  @IsOptional()
  @IsString()
  genero?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  foto_perfil_url?: string;

  @IsOptional()
  @IsString()
  tipo_sanguineo?: string;

  @IsOptional()
  @IsString()
  alergias?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  altura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  faltas?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  turmaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  responsavelId?: number;
}

