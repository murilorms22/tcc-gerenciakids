import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTurmaDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsString()
  turno?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  ano_letivo?: number;
}

