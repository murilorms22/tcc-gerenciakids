import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAlunoDto {
  @IsString({ message: 'O nome do aluno deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do aluno é obrigatório.' })
  nome: string;

  @IsString({ message: 'A data de nascimento deve ser informada (YYYY-MM-DD).' })
  @IsNotEmpty({ message: 'A data de nascimento é obrigatória.' })
  data_nascimento: string;

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
  @IsNumber({}, { message: 'O peso deve ser um número válido.' })
  @Min(0)
  peso?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'A altura deve ser um número válido.' })
  @Min(0)
  altura?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  faltas?: number;

  @Type(() => Number)
  @IsInt({ message: 'O ID da turma deve ser um número inteiro.' })
  @Min(1)
  turmaId: number;

  @Type(() => Number)
  @IsInt({ message: 'O ID do responsável deve ser um número inteiro.' })
  @Min(1)
  responsavelId: number;
}

