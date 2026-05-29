import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { softDeleteExtension } from './prisma.extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private _extendedClient: ReturnType<typeof softDeleteExtension>;

  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    this._extendedClient = softDeleteExtension(this);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conexión a PostgreSQL establecida exitosamente.');
    } catch (error) {
      this.logger.error('Error crítico conectando a la base de datos', error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Conexión a PostgreSQL cerrada.');
  }

  get extended() {
    return this._extendedClient;
  }
}