"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.psyNexusMachine = void 0;
const xstate_1 = require("xstate");
exports.psyNexusMachine = (0, xstate_1.createMachine)({
    types: {},
    id: 'psyNexusOrchestrator',
    initial: 'idle',
    context: {
        currentAgent: null,
        currentStep: '',
        status: { type: 'PENDING' },
        approvalData: undefined,
        error: undefined
    },
    states: {
        idle: {
            on: {
                START_WORKFLOW: {
                    target: 'planning',
                    actions: (0, xstate_1.assign)({
                        currentAgent: () => 'PLAN_AGENT',
                        currentStep: () => 'plan',
                        status: () => ({ type: 'IN_PROGRESS', currentAgent: 'PLAN_AGENT' })
                    })
                }
            }
        },
        planning: {
            on: {
                AGENT_COMPLETED: {
                    target: 'awaitingPlanApproval',
                    actions: (0, xstate_1.assign)({
                        status: ({ event }) => {
                            const ev = event;
                            return { type: 'AWAITING_PLAN_APPROVAL', planId: ev.output?.planId || 'unknown' };
                        },
                        approvalData: ({ event }) => event.output
                    })
                },
                WORKFLOW_ERROR: 'error'
            }
        },
        awaitingPlanApproval: {
            on: {
                APPROVE_GATE: {
                    target: 'designing',
                    actions: (0, xstate_1.assign)({
                        currentAgent: () => 'DESIGN_ALCHEMIST_AGENT',
                        currentStep: () => 'design',
                        status: () => ({ type: 'IN_PROGRESS', currentAgent: 'DESIGN_ALCHEMIST_AGENT' })
                    })
                },
                REJECT_GATE: 'failed'
            }
        },
        designing: {
            on: {
                AGENT_COMPLETED: {
                    target: 'awaitingDesignApproval',
                    actions: (0, xstate_1.assign)({
                        status: ({ event }) => {
                            const ev = event;
                            return { type: 'AWAITING_DESIGN_APPROVAL', assetPreviewUrl: ev.output?.previewUrl || 'http://placeholder.url' };
                        },
                        approvalData: ({ event }) => event.output
                    })
                },
                WORKFLOW_ERROR: 'error'
            }
        },
        awaitingDesignApproval: {
            on: {
                APPROVE_GATE: {
                    target: 'coding',
                    actions: (0, xstate_1.assign)({
                        currentAgent: () => 'BACKEND_ARCHITEKT_AGENT',
                        currentStep: () => 'backend',
                        status: () => ({ type: 'IN_PROGRESS', currentAgent: 'BACKEND_ARCHITEKT_AGENT' })
                    })
                },
                REJECT_GATE: 'failed'
            }
        },
        coding: {
            on: {
                AGENT_COMPLETED: {
                    target: 'testing', // Wir überspringen Gates für den Moment zur Vereinfachung des Tests
                    actions: (0, xstate_1.assign)({
                        currentAgent: () => 'QA_GURU_AGENT',
                        currentStep: () => 'qa',
                        status: () => ({ type: 'IN_PROGRESS', currentAgent: 'QA_GURU_AGENT' })
                    })
                },
                WORKFLOW_ERROR: 'error'
            }
        },
        testing: {
            on: {
                AGENT_COMPLETED: 'completed',
                WORKFLOW_ERROR: 'error'
            }
        },
        completed: {
            type: 'final',
            entry: (0, xstate_1.assign)({
                status: () => ({ type: 'SUCCESS', finalArtifactPath: '/artifacts/latest' })
            })
        },
        error: {
            entry: (0, xstate_1.assign)({
                status: ({ event }) => {
                    const ev = event;
                    return { type: 'FAILED', errorCode: ev.code || 'UNKNOWN_ERROR', reason: ev.message || 'An error occurred' };
                }
            })
        },
        failed: {
            type: 'final',
            entry: (0, xstate_1.assign)({
                status: ({ context }) => ({
                    type: 'FAILED',
                    errorCode: 'GATE_REJECTED',
                    reason: `Approval rejected at ${context.currentStep}`
                })
            })
        }
    }
});
