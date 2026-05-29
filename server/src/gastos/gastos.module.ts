import { Module } from '@nestjs/common';
import { GastoService } from './services/gastos.service';
import { CategoriaGastoService } from './services/categoria-gasto.service';
import { GastoController } from './controllers/gastos.controller';
import { CategoriaGastoController } from './controllers/categoria-gasto.controller';

@Module({
  controllers: [CategoriaGastoController, GastoController],
  providers: [CategoriaGastoService, GastoService],
  exports: [GastoService],
})
export class GastosModule {}