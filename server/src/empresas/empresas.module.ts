import { Module } from '@nestjs/common';
import { EmpresaService } from './empresas.service';
import { EmpresaController } from './empresas.controller';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService],
})
export class EmpresasModule {}