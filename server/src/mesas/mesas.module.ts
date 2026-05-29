import { Module } from '@nestjs/common';
import { MesaService } from './mesas.service';
import { MesaController } from './mesas.controller';

@Module({
  controllers: [MesaController],
  providers: [MesaService],
  exports: [MesaService],
})
export class MesasModule {}