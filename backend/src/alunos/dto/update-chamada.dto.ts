import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateChamadaDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O número de faltas deve ser um inteiro.' })
  @Min(0, { message: 'O número de faltas não pode ser negativo.' })
  faltas?: number;

  @IsOptional()
  @IsBoolean()
  incrementar?: boolean;
}

