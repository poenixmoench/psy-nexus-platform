import { Pool } from 'pg'
import type { TaskRow } from '../db/queries/taskQueries'
import { INSERT_TASK, GET_TASK, UPDATE_TASK_STATUS, GET_TASKS_BY_USER, GET_PENDING_TASKS, GET_RUNNING_TASKS, CANCEL_TASK, INSERT_TASK_RESULT, GET_TASK_RESULTS, GET_LATEST_TASK_RESULT } from '../db/queries/taskQueries'

export class TaskService {
  constructor(private pool: Pool) {}

  async createTask(userId: string, agentType: string, initialPrompt: string): Promise<TaskRow> {
    const result = await this.pool.query(INSERT_TASK, [userId, agentType, initialPrompt])
    return result.rows[0] as TaskRow
  }

  async getTaskById(taskId: string): Promise<TaskRow | null> {
    const result = await this.pool.query(GET_TASK, [taskId])
    return result.rows[0] || null
  }

  async updateTaskStatus(taskId: string, status: string, step: number, progress: number): Promise<TaskRow> {
    const result = await this.pool.query(UPDATE_TASK_STATUS, [taskId, status, step, progress])
    return result.rows[0] as TaskRow
  }

  async getTasksByUser(userId: string, limit: number = 20, offset: number = 0): Promise<TaskRow[]> {
    const result = await this.pool.query(GET_TASKS_BY_USER, [userId, limit, offset])
    return result.rows as TaskRow[]
  }

  async getPendingTasks(limit: number = 10): Promise<TaskRow[]> {
    const result = await this.pool.query(GET_PENDING_TASKS, [limit])
    return result.rows as TaskRow[]
  }

  async getRunningTasks(): Promise<TaskRow[]> {
    const result = await this.pool.query(GET_RUNNING_TASKS, [])
    return result.rows as TaskRow[]
  }

  async cancelTask(taskId: string): Promise<TaskRow | null> {
    const result = await this.pool.query(CANCEL_TASK, [taskId])
    return result.rows[0] || null
  }

  async insertTaskResult(taskId: string, stepNumber: number, output: string, executionTime: number, status: string, errorMsg?: string): Promise<any> {
    const result = await this.pool.query(INSERT_TASK_RESULT, [taskId, stepNumber, output, executionTime, status, errorMsg || null])
    return result.rows[0]
  }

  async getTaskResults(taskId: string): Promise<any[]> {
    const result = await this.pool.query(GET_TASK_RESULTS, [taskId])
    return result.rows
  }

  async getLatestTaskResult(taskId: string): Promise<any | null> {
    const result = await this.pool.query(GET_LATEST_TASK_RESULT, [taskId])
    return result.rows[0] || null
  }
}
