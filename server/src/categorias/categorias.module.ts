import { Module } from '@nestjs/common';
import { CategoriaService } from './categorias.service';
import { CategoriaController } from './categorias.controller';

@Module({
  controllers: [CategoriaController],
  providers: [CategoriaService],
  exports: [CategoriaService],
})
export class CategoriasModule {}