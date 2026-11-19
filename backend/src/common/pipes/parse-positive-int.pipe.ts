import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0 || String(parsed) !== String(value).trim()) {
      throw new BadRequestException(
        `O parâmetro "${metadata.data || 'id'}" deve ser um número inteiro positivo válido.`,
      );
    }
    return parsed;
  }
}

