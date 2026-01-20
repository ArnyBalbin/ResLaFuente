import { 
  Injectable, 
  BadRequestException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGastoDto } from './dto/create-gasto.dto';

@Injectable()
export class GastosService {
  constructor(private prisma: PrismaService) {}

  async create(usuarioId: number, createGastoDto: CreateGastoDto) {
    const cajaAbierta = await this.prisma.cajaDiaria.findFirst({
      where: { 
        usuarioId: usuarioId, 
        estado: true
      }
    });

    if (!cajaAbierta) {
      throw new BadRequestException(
        'No tienes una caja abierta. Abre caja antes de registrar salidas de dinero.'
      );
    }

    try {
      const gasto = await this.prisma.gasto.create({
        data: {
          descripcion: createGastoDto.descripcion,
          monto: createGastoDto.monto,
          categoria: createGastoDto.categoria,
          esCosto: createGastoDto.esCosto,
          fecha: new Date(),
          usuarioId: usuarioId,
          cajaId: cajaAbierta.id
        },
      });

      return gasto;

    } catch (error) {
      throw new InternalServerErrorException('Error al registrar el gasto');
    }
  }

  async findAllHoy() {
    const inicioDia = new Date();
    inicioDia.setHours(0,0,0,0);
    
    return this.prisma.gasto.findMany({
      where: {
        fecha: {
          gte: inicioDia
        }
      },
      include: { usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' }
    });
  }
}