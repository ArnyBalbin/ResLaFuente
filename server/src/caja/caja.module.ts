import { Module } from '@nestjs/common';
import { CajaService } from './caja.service';
import { CajaController } from './caja.controller';

@Module({
  controllers: [CajaController],
  providers: [CajaService],
  exports: [CajaService], // Se exportará obligatoriamente para el módulo de Pagos y Gastos
})
export class CajaModule {}