import { Module } from '@nestjs/common';
import { UsuarioService } from './usuarios.service';
import { UsuarioController } from './usuarios.controller';

@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService], // Exportamos por si el AuthModule necesita inyectarlo directamente a futuro
})
export class UsuariosModule {}