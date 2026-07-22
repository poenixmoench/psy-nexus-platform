import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../db/PrismaService';

@Injectable()
export class AgentDiagnosticsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const agents = await (this.prisma as any).agents.findMany({
        select: { name: true, type: true, capabilities: true },
      });

      console.log('[AGENTS] Registry snapshot:', agents);
    } catch (err: any) {
      console.warn(
        '[AGENTS] Failed to read agent capabilities:',
        err?.message ?? err,
      );
    }
  }
}
