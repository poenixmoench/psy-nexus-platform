import { Pool } from 'pg'
import axios from 'axios'
import logger from '../services/logger'

export abstract class BaseAgent {
  protected taskId: string
  protected pool: Pool

  constructor(pool: Pool, taskId: string) {
    this.pool = pool
    this.taskId = taskId
  }

  async runTask(task: any): Promise<void> {
    try {
      logger.info(`Starting execution`, { taskId: this.taskId })
      const result = await this.execute(task.initial_prompt)
      await this.saveResult(result)
      logger.info(`Completed`, { taskId: this.taskId })
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      logger.error(`Failed`, { taskId: this.taskId, error: errorMsg })
    }
  }

  protected async updateProgress(step: number, progress: number): Promise<void> {
    await this.pool.query(
      'UPDATE tasks SET current_step = $1, progress_percentage = $2, updated_at = NOW() WHERE id = $3',
      [step, progress, this.taskId]
    )
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
    }, { timeout: 300000 })

    return response.data.response || ''
  }

  protected async saveResult(result: string): Promise<void> {
    await this.pool.query(
      'INSERT INTO task_results (task_id, step_number, status, result, execution_time_ms, agent_output) VALUES ($1, $2, $3, $4, $5, $6)',
      [this.taskId, 1, 'SUCCESS', result, 0, result]
    )
  }

  abstract execute(prompt: string): Promise<string>
}
