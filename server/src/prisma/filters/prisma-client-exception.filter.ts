import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');

    switch (exception.code) {
      // Violación de restricción única (Unique constraint failed)
      case 'P2002': {
        const target = exception.meta?.target as string[];
        const status = HttpStatus.CONFLICT;
        response.status(status).json({
          statusCode: status,
          message: `El registro ya existe. Restricción única fallida en los campos: ${target?.join(', ')}`,
          error: 'Conflict',
        });
        break;
      }
      
      // Registro no encontrado (Record not found)
      case 'P2025': {
        const status = HttpStatus.NOT_FOUND;
        response.status(status).json({
          statusCode: status,
          message: 'El registro solicitado no fue encontrado o ya ha sido eliminado.',
          error: 'Not Found',
        });
        break;
      }

      // Violación de llave foránea (Foreign key constraint failed)
      case 'P2003': {
        const status = HttpStatus.UNPROCESSABLE_ENTITY;
        response.status(status).json({
          statusCode: status,
          message: 'Operación inválida. Hace referencia a un registro que no existe.',
          error: 'Unprocessable Entity',
        });
        break;
      }

      default:
        this.logger.error(`Error no manejado de Prisma: ${exception.code}`, message);
        super.catch(exception, host);
        break;
    }
  }
}