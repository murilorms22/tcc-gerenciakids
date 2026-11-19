import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAtividadeDto {
  @IsString({ message: 'O título da atividade deve ser um texto.' })
  @IsNotEmpty({ message: 'O título da atividade é obrigatório.' })
  titulo: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsString({ message: 'O horário deve ser informado.' })
  @IsNotEmpty({ message: 'O horário é obrigatório.' })
  horario: string;

  @IsString({ message: 'A sala/local deve ser informada.' })
  @IsNotEmpty({ message: 'A sala/local é obrigatória.' })
  sala: string;

  @IsOptional()
  @IsBoolean()
  concluida?: boolean;

  @Type(() => Number)
  @IsInt({ message: 'A turma deve ser informada.' })
  @Min(1)
  turmaId: number;
}

