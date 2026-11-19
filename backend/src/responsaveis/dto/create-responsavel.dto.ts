import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateResponsavelDto {
  @IsString({ message: 'O nome do responsável deve ser um texto.' })
  @IsNotEmpty({ message: 'O nome do responsável é obrigatório.' })
  nome: string;

  @IsString({ message: 'O CPF deve ser um texto.' })
  @IsNotEmpty({ message: 'O CPF é obrigatório.' })
  cpf: string;

  @IsString({ message: 'O telefone deve ser um texto.' })
  @IsNotEmpty({ message: 'O telefone é obrigatório.' })
  telefone: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number | null;
}

