import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('diario')
  obtenerDiario() {
    return this.reportesService.reporteDiario();
  }

  @Get('mensual')
  obtenerMensual(
    @Query('mes') mes: string, 
    @Query('anio') anio: string
  ) {
    // Si no envían params, usamos el mes actual
    const fechaActual = new Date();
    const m = mes ? parseInt(mes) : fechaActual.getMonth() + 1;
    const a = anio ? parseInt(anio) : fechaActual.getFullYear();
    return this.reportesService.reporteMensual(m, a);
  }

  // Endpoint flexible para rango personalizado (ej. Reporte Semanal)
  @Get('rango')
  obtenerRango(@Query('inicio') inicio: string, @Query('fin') fin: string) {
    return this.reportesService.generarBalance(new Date(inicio), new Date(fin));
  }
}