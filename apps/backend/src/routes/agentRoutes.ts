import express, { Router } from 'express'
import { Pool } from 'pg'
import { authenticateToken, requireDeveloper } from '../middleware/auth'
import { aiRateLimitMiddleware } from '../middleware/security'
import { TaskService } from '../services/taskService'
import { AgentRegistry } from '../agents/AgentRegistry'
import logger from '../services/logger'

const router = Router()
const pool = new Pool()
const taskService = new TaskService(pool)
const agentRegistry = new AgentRegistry()

router.post('/run', aiRateLimitMiddleware, authenticateToken, requireDeveloper, async (req, res) => {
  try {
    const { agentType, prompt } = req.body
    const userId = (req as any).user.id

    if (!agentType || !prompt) {
      return res.status(400).json({ error: 'agentType and prompt required' })
    }

    if (!['CodeAnalyzerAgent', 'RefactoringAgent', 'TestGeneratorAgent', 'DocumentationAgent', 'SecurityAuditAgent'].includes(agentType)) {
      return res.status(400).json({ error: 'Invalid agentType' })
    }

    const task = await taskService.createTask(userId, agentType, prompt)
    logger.info(`📝 Task created`, { taskId: task.id, agentType, userId })

    const agent = agentRegistry.getAgent(agentType, taskService, task.id)
    
    agent.runTask(task).catch((error: any) => {
      logger.error(`Agent execution failed`, { taskId: task.id, error: error.message })
    })

    res.json({ taskId: task.id, status: 'STARTED', message: `${agentType} started` })
  } catch (error: any) {
    logger.error('Agent run error', { error: error.message })
    res.status(500).json({ error: 'Failed to run agent' })
  }
})

router.get('/tasks/:taskId', authenticateToken, requireDeveloper, async (req, res) => {
  try {
    const { taskId } = req.params
    const task = await taskService.getTaskById(taskId)

    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }

    if (task.user_id !== (req as any).user.id) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    const results = await taskService.getTaskResults(taskId)
    res.json({ task, results })
  } catch (error: any) {
    logger.error('Get task error', { error: error.message })
    res.status(500).json({ error: 'Failed to get task' })
  }
})

router.get('/list', authenticateToken, requireDeveloper, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { limit = 20, offset = 0 } = req.query
    
    const tasks = await taskService.getTasksByUser(userId, parseInt(limit as string), parseInt(offset as string))
    res.json({ tasks, total: tasks.length })
  } catch (error: any) {
    logger.error('List tasks error', { error: error.message })
    res.status(500).json({ error: 'Failed to list tasks' })
  }
})

export default router
