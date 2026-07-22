import { container } from 'tsyringe';
import { PrismaService } from './PrismaService';
import { OnModuleInit, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class TsyringeBridgeProvider implements OnModuleInit {
  private readonly logger = new Logger('TsyringeBridge');

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Hier geschieht die Magie: Wir registrieren die NestJS-Instanz bei tsyringe
    container.register('PrismaService', { useValue: this.prisma });
    this.logger.log('✅ [BRIDGE] PrismaService erfolgreich in tsyringe-Container eingespeist.');
  }
}
