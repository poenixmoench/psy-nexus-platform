"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAgent = void 0;
const uuid_1 = require("uuid");
class BaseAgent {
    emitTag(payload, ttlSeconds) {
        return {
            id: (0, uuid_1.v4)(),
            sourceAgent: this.name,
            timestamp: Date.now(),
            payload,
            ttl: ttlSeconds ? ttlSeconds * 1000 : undefined
        };
    }
    getHighestPriorityTask(tags) {
        const priorityMap = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        // NULL-SAFE: Prüfe zuerst, ob tags existiert und ein Array ist
        const validTags = Array.isArray(tags) ? tags : [];
        const tasks = validTags.filter(t => t?.payload?.type === 'TASK');
        if (tasks.length === 0)
            return null;
        return tasks.sort((a, b) => {
            // NULL-SAFE: Prüfe payload.data und priority
            const pA = priorityMap[a?.payload?.data?.priority] || 0;
            const pB = priorityMap[b?.payload?.data?.priority] || 0;
            return pB - pA;
        })[0];
    }
}
exports.BaseAgent = BaseAgent;
