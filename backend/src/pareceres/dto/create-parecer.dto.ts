import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateParecerDto {
  @IsString({ message: 'O título do parecer deve ser um texto.' })
  @IsNotEmpty({ message: 'O título do parecer é obrigatório.' })
  titulo: string;

  @IsOptional()
  @IsString({ message: 'O período deve ser um texto.' })
  periodo?: string;

  @IsString({ message: 'O conteúdo do parecer deve ser um texto.' })
  @IsNotEmpty({ message: 'O conteúdo do parecer é obrigatório.' })
  conteudo: string;

  @IsOptional()
  @IsString()
  professorNome?: string;

  @Type(() => Number)
  @IsInt({ message: 'O aluno deve ser selecionado.' })
  @Min(1)
  alunoId: number;
}

