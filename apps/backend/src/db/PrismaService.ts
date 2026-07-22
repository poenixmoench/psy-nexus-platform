import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { container, injectable } from 'tsyringe';

@Injectable()
@injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
    // Manuelle TSyringe-Registrierung der Singleton-Instanz
    if (!container.isRegistered(PrismaService)) {
      container.registerInstance(PrismaService, this);
    }
  }
  async onModuleInit() {
    await this.$connect();
  }
}
