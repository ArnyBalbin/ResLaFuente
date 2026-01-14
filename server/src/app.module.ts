import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { MesasModule } from './mesas/mesas.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { EmpresasModule } from './empresas/empresas.module';
import { ClientesModule } from './clientes/clientes.module';
import { CajaModule } from './caja/caja.module';
import { PagosModule } from './pagos/pagos.module';
import { FacturacionModule } from './facturacion/facturacion.module';
import { FilesModule } from './files/files.module';
import { InventarioModule } from './inventario/inventario.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule, ProductosModule, CategoriasModule, MesasModule, PedidosModule, UsuariosModule, EmpresasModule, ClientesModule, CajaModule, PagosModule, FacturacionModule, FilesModule, InventarioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
