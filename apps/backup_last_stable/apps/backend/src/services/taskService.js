"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const taskQueries_1 = require("../db/queries/taskQueries");
class TaskService {
    constructor(pool) {
        this.pool = pool;
    }
    async createTask(userId, agentType, initialPrompt) {
        const result = await this.pool.query(taskQueries_1.INSERT_TASK, [userId, agentType, initialPrompt]);
        return result.rows[0];
    }
    async getTaskById(taskId) {
        const result = await this.pool.query(taskQueries_1.GET_TASK, [taskId]);
        return result.rows[0] || null;
    }
    async updateTaskStatus(taskId, status, step, progress) {
        const result = await this.pool.query(taskQueries_1.UPDATE_TASK_STATUS, [taskId, status, step, progress]);
        return result.rows[0];
    }
    async getTasksByUser(userId, limit = 20, offset = 0) {
        const result = await this.pool.query(taskQueries_1.GET_TASKS_BY_USER, [userId, limit, offset]);
        return result.rows;
    }
    async getPendingTasks(limit = 10) {
        const result = await this.pool.query(taskQueries_1.GET_PENDING_TASKS, [limit]);
        return result.rows;
    }
    async getRunningTasks() {
        const result = await this.pool.query(taskQueries_1.GET_RUNNING_TASKS, []);
        return result.rows;
    }
    async cancelTask(taskId) {
        const result = await this.pool.query(taskQueries_1.CANCEL_TASK, [taskId]);
        return result.rows[0] || null;
    }
    async insertTaskResult(taskId, stepNumber, output, executionTime, status, errorMsg) {
        const result = await this.pool.query(taskQueries_1.INSERT_TASK_RESULT, [taskId, stepNumber, output, executionTime, status, errorMsg || null]);
        return result.rows[0];
    }
    async getTaskResults(taskId) {
        const result = await this.pool.query(taskQueries_1.GET_TASK_RESULTS, [taskId]);
        return result.rows;
    }
    async getLatestTaskResult(taskId) {
        const result = await this.pool.query(taskQueries_1.GET_LATEST_TASK_RESULT, [taskId]);
        return result.rows[0] || null;
    }
}
exports.TaskService = TaskService;
