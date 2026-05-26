import { Module } from '@nestjs/common';
import { ConveniosService } from './convenios.service';
import { ConveniosController } from './convenios.controller';

@Module({
  controllers: [ConveniosController],
  providers: [ConveniosService],
})
export class ConveniosModule {}
