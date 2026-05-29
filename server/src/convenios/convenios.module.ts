import { Module } from '@nestjs/common';
import { ConvenioTrabajadorService } from './convenios.service';
import { ConvenioTrabajadorController } from './convenios.controller';

@Module({
  controllers: [ConvenioTrabajadorController],
  providers: [ConvenioTrabajadorService],
  exports: [ConvenioTrabajadorService],
})
export class ConveniosModule {}