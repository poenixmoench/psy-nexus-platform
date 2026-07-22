import { Injectable } from '@nestjs/common';
import { PrismaService } from '../db/PrismaService';

@Injectable()
export class WorkflowStateService {
  private readonly USER_ID = '00000000-0000-0000-0000-000000000000';

  constructor(private prisma: PrismaService) {}

  // ✅ GEHÄRTET: Echte UUID-Validierung (36 Zeichen, Hex + Bindestriche)
  private validateUuid(id: string): boolean {
    return typeof id === 'string' && /^[0-9a-fA-F-]{36}$/.test(id);
  }

  async createWorkflow(id: string, agent: string, goal: string) {
    try {
      if (!this.validateUuid(id)) {
        console.warn(`[WorkflowStateService] Invalid UUID format: ${id}`);
        throw new Error(`Ungültiges UUID-Format: ${id}`);
      }

      const existing = await this.getWorkflow(id);
      if (existing) return existing;

      return await (this.prisma as any).workflows.create({
        data: {
          id,
          user_id: this.USER_ID,
          title: `Vortex-Opus: ${agent}`,
          description: goal.substring(0, 255),
          status: 'running',
          metadata: { agent, goal }
        }
      });
    } catch (error: any) {
      console.error(`[WorkflowStateService] createWorkflow failed: ${error.message}`);
      throw error;
    }
  }

  // ✅ DEFENSIV: Try/Catch um Prisma-Fehler abzufangen
  async getWorkflow(id: string) {
    if (!this.validateUuid(id)) {
      console.warn(`[WorkflowStateService] getWorkflow: Invalid UUID - ${id}`);
      return null;
    }
    
    try {
      return await (this.prisma as any).workflows.findUnique({ where: { id } });
    } catch (error: any) {
      console.error(`[WorkflowStateService] getWorkflow failed: ${error.message}`);
      return null;
    }
  }

  async updateStatus(id: string, status: string, output?: any) {
    try {
      if (!this.validateUuid(id)) {
        console.warn(`[WorkflowStateService] updateStatus: Invalid UUID - ${id}`);
        return null;
      }

      const workflow = await this.getWorkflow(id);
      const currentMeta = (workflow?.metadata as any) || {};
      
      const data: any = {
        status,
        updated_at: new Date(),
      };
      
      if (output) {
        data.metadata = {
          ...currentMeta,
          last_result: output,
        };
      }
      
      return await (this.prisma as any).workflows.update({ where: { id }, data });
    } catch (error: any) {
      console.error(`[WorkflowStateService] updateStatus failed: ${error.message}`);
      return null;
    }
  }

  async lockNiche(workflowId: string, niche: string) {
    try {
      if (!this.validateUuid(workflowId)) {
        console.warn(`[WorkflowStateService] lockNiche: Invalid UUID - ${workflowId}`);
        return null;
      }

      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) return null;
      
      const currentMetadata = workflow.metadata || {};
      if ((currentMetadata as any).nicheLocked) {
        console.log(`[WorkflowStateService] Niche already locked: ${(currentMetadata as any).niche}`);
        return workflow;
      }
      
      console.log(`[WorkflowStateService] Locking niche: ${niche}`);
      return await (this.prisma as any).workflows.update({
        where: { id: workflowId },
        data: {
          metadata: {
            ...currentMetadata,
            niche,
            nicheLocked: true,
            nicheLockedAt: new Date().toISOString()
          }
        }
      });
    } catch (error: any) {
      console.error(`[WorkflowStateService] lockNiche failed: ${error.message}`);
      return null;
    }
  }

  async getNiche(workflowId: string): Promise<string | null> {
    try {
      if (!this.validateUuid(workflowId)) return null;
      
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow?.metadata) return null;
      
      return (workflow.metadata as any).niche || null;
    } catch (error: any) {
      console.error(`[WorkflowStateService] getNiche failed: ${error.message}`);
      return null;
    }
  }
}
