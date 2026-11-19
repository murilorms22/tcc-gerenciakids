import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateTurmaDto {
  @IsString({ message: 'O nome da turma deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome da turma é obrigatório.' })
  nome: string;

  @IsString({ message: 'O turno deve ser informado.' })
  @IsNotEmpty({ message: 'O turno é obrigatório.' })
  turno: string;

  @Type(() => Number)
  @IsInt({ message: 'O ano letivo deve ser um número inteiro.' })
  @Min(2000, { message: 'Informe um ano letivo válido.' })
  ano_letivo: number;
}

