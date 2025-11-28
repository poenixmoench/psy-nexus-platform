import axios from 'axios'
import type { TaskRow } from '../db/queries/taskQueries'
import { TaskService } from '../services/taskService'
import logger from '../services/logger'

export abstract class BaseAgent {
  protected taskService: TaskService
  protected taskId: string
  protected currentStep: number = 1
  protected maxSteps: number = 5

  constructor(taskService: TaskService, taskId: string) {
    this.taskService = taskService
    this.taskId = taskId
  }

  abstract execute(prompt: string): Promise<string>

  async runTask(task: TaskRow): Promise<void> {
    const startTime = Date.now()
    try {
      await this.taskService.updateTaskStatus(this.taskId, 'RUNNING', 1, 10)
      logger.info(`🤖 [${task.agent_type}] Starting execution`, { taskId: this.taskId })

      const result = await this.execute(task.initial_prompt)

      await this.taskService.insertTaskResult(
        this.taskId,
        this.currentStep,
        result,
        Date.now() - startTime,
        'SUCCESS'
      )

      await this.taskService.updateTaskStatus(this.taskId, 'COMPLETED', this.maxSteps, 100)
      logger.info(`✅ [${task.agent_type}] Completed`, { taskId: this.taskId, duration: Date.now() - startTime })
    } catch (error: any) {
      const duration = Date.now() - startTime
      await this.taskService.insertTaskResult(
        this.taskId,
        this.currentStep,
        '',
        duration,
        'ERROR',
        error.message
      )
      await this.taskService.updateTaskStatus(this.taskId, 'FAILED', this.currentStep, 0)
      logger.error(`❌ [${task.agent_type}] Failed`, { taskId: this.taskId, error: error.message, duration })
      throw error
    }
  }

  protected async updateProgress(step: number, percentage: number): Promise<void> {
    this.currentStep = step
    await this.taskService.updateTaskStatus(this.taskId, 'RUNNING', step, percentage)
  }

  protected async callOllama(prompt: string, temperature: number = 0.3): Promise<string> {
    const response = await axios.post(`${process.env.OLLAMA_URL}/api/generate`, {
      model: 'qwen2.5-coder:14b',
      prompt,
      stream: false,
      options: {
        num_predict: 2048,
        temperature,
        top_p: 0.5,
        repeat_penalty: 1.4
      }
    }, { timeout: 45000 })

    return response.data.response || ''
  }
}
