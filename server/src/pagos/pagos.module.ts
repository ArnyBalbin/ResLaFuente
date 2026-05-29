import { Module } from '@nestjs/common';
import { PagoService } from './pagos.service';
import { PagoController } from './pagos.controller';

@Module({
  controllers: [PagoController],
  providers: [PagoService],
  exports: [PagoService],
})
export class PagosModule {}