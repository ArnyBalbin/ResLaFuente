import { Module } from '@nestjs/common';
import { ClienteService } from './clientes.service';
import { ClienteController } from './clientes.controller';

@Module({
  controllers: [ClienteController],
  providers: [ClienteService],
  exports: [ClienteService], // Se exportará para futuras integraciones en Pedidos y Pagos
})
export class ClientesModule {}