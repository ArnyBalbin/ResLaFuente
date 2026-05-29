import { Module } from '@nestjs/common';
import { MenuService } from './menus.service';
import { MenuController } from './menus.controller';

@Module({
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenusModule {}