import { Module } from '@nestjs/common';
import { ProductoService } from './productos.service';
import { ProductoController } from './productos.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module'; 

@Module({
  imports: [CloudinaryModule], 
  controllers: [ProductoController],
  providers: [ProductoService],
  exports: [ProductoService],
})
export class ProductosModule {}