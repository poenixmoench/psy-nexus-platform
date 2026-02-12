"use strict";
/**
 * @file ConversationService.ts
 * @description Service class to manage conversations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class ConversationService {
    constructor() {
        this.conversations = new Map();
        this.initializeMockConversations();
    }
    initializeMockConversations() {
        const mockMessages1 = Array.from({ length: 6 }, (_, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant'),
            content: `Code Review Message ${i + 1}`,
            timestamp: new Date(),
            agentName: 'CodeReviewAgent'
        }));
        const mockMessages2 = Array.from({ length: 6 }, (_, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant'),
            content: `Security Audit Message ${i + 1}`,
            timestamp: new Date(),
            agentName: 'SecurityAuditAgent'
        }));
        const mockMessages3 = Array.from({ length: 6 }, (_, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant'),
            content: `Performance Optimization Message ${i + 1}`,
            timestamp: new Date(),
            agentName: 'PerformanceOptimizer'
        }));
        const mockMessages4 = Array.from({ length: 6 }, (_, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant'),
            content: `Architecture Analysis Message ${i + 1}`,
            timestamp: new Date(),
            agentName: 'ArchitectureAnalyzer'
        }));
        const mockMessages5 = Array.from({ length: 6 }, (_, i) => ({
            role: (i % 2 === 0 ? 'user' : 'assistant'),
            content: `Bug Detection Message ${i + 1}`,
            timestamp: new Date(),
            agentName: 'BugDetectorAgent'
        }));
        this.conversations.set('run_test_123', {
            runId: 'run_test_123',
            agentName: 'CodeReviewAgent',
            messages: mockMessages1,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.conversations.set('run_security_456', {
            runId: 'run_security_456',
            agentName: 'SecurityAuditAgent',
            messages: mockMessages2,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.conversations.set('run_performance_789', {
            runId: 'run_performance_789',
            agentName: 'PerformanceOptimizer',
            messages: mockMessages3,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.conversations.set('run_arch_101', {
            runId: 'run_arch_101',
            agentName: 'ArchitectureAnalyzer',
            messages: mockMessages4,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        this.conversations.set('run_bug_202', {
            runId: 'run_bug_202',
            agentName: 'BugDetectorAgent',
            messages: mockMessages5,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    async getConversationByRunId(runId) {
        const conversation = this.conversations.get(runId);
        if (!conversation) {
            throw new Error(`Conversation not found for runId ${runId}`);
        }
        console.log(`[ConversationService] getConversationByRunId: Conversation retrieved for runId ${runId}`);
        return conversation;
    }
    async getAllConversations() {
        const conversations = Array.from(this.conversations.values());
        console.log('[ConversationService] getAllConversations: All conversations retrieved');
        return conversations;
    }
    async addMessageToConversation(runId, message) {
        const conversation = this.conversations.get(runId);
        if (!conversation) {
            throw new Error(`Conversation not found for runId ${runId}`);
        }
        conversation.messages.push(message);
        conversation.updatedAt = new Date();
        console.log(`[ConversationService] addMessageToConversation: Message added to conversation for runId ${runId}`);
    }
    async getConversationHistory(runId, limit) {
        const conversation = this.conversations.get(runId);
        if (!conversation) {
            throw new Error(`Conversation not found for runId ${runId}`);
        }
        let history = conversation.messages;
        if (limit) {
            history = history.slice(-limit);
        }
        console.log(`[ConversationService] getConversationHistory: Conversation history retrieved for runId ${runId}`);
        return history;
    }
    async deleteConversation(runId) {
        const success = this.conversations.delete(runId);
        console.log(`[ConversationService] deleteConversation: Conversation deleted for runId ${runId}`);
        return success;
    }
    async createConversation(runId, agentName) {
        const newConversation = {
            runId,
            agentName,
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.conversations.set(runId, newConversation);
        console.log(`[ConversationService] createConversation: Conversation created for runId ${runId}`);
        return newConversation;
    }
}
exports.default = new ConversationService();
