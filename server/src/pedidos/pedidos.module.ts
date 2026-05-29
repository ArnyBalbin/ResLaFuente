import { Module } from '@nestjs/common';
import { PedidoService } from './pedidos.service';
import { PedidoController } from './pedidos.controller';

@Module({
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService], // Será necesario exportarlo para cuando construyamos el módulo de Pagos
})
export class PedidosModule {}