import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PareceresController } from './pareceres.controller';
import { PareceresService } from './pareceres.service';

@Module({
  imports: [AuthModule],
  controllers: [PareceresController],
  providers: [PareceresService],
})
export class PareceresModule {}
