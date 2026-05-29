import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { LoginPosDto } from './dtos/login-pos.dto';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión para administradores (Web)' })
  @ApiResponse({ status: 200, description: 'Token JWT generado exitosamente' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async loginAdmin(@Body() dto: LoginAdminDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('pos/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicio de sesión rápido para mozos/cajeros mediante PIN (Tablets POS)' })
  @ApiResponse({ status: 200, description: 'Token JWT generado exitosamente' })
  @ApiResponse({ status: 401, description: 'PIN incorrecto' })
  async loginPos(@Body() dto: LoginPosDto) {
    return this.authService.loginPos(dto);
  }
}