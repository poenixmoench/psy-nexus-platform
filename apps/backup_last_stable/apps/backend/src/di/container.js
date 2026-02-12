"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDIContainer = void 0;
const ConsoleLogger_1 = __importDefault(require("../utils/ConsoleLogger"));
const agent_module_1 = require("./modules/agent-module");
const tsyringe_1 = require("tsyringe");
const eventemitter2_1 = require("eventemitter2");
const OrionOrchestrator_1 = require("../orchestrator/OrionOrchestrator");
const SocketService_1 = require("../services/SocketService");
const GeometryTool_1 = require("../tools/GeometryTool");
const ConcreteAgentExecutor_1 = require("../executors/ConcreteAgentExecutor");
const SINGLETON = { lifecycle: tsyringe_1.Lifecycle.Singleton };
const setupDIContainer = () => {
    (0, agent_module_1.registerAgents)();
    // Logger - Erstelle Instanz und registriere sie
    const consoleLogger = new ConsoleLogger_1.default();
    tsyringe_1.container.register("Logger", { useValue: consoleLogger });
    const eventEmitter = new eventemitter2_1.EventEmitter2({ wildcard: true, delimiter: ".", maxListeners: 20 });
    tsyringe_1.container.register("EventEmitter", { useValue: eventEmitter });
    tsyringe_1.container.register(eventemitter2_1.EventEmitter2, { useValue: eventEmitter });
    // Tools & Executors
    tsyringe_1.container.register(GeometryTool_1.GeometryTool, { useClass: GeometryTool_1.GeometryTool }, SINGLETON);
    // Mapping des String-Tokens auf die konkrete Klasse
    tsyringe_1.container.register("AgentExecutor", {
        useClass: ConcreteAgentExecutor_1.ConcreteAgentExecutor
    }, SINGLETON);
    // Core Services
    tsyringe_1.container.register(OrionOrchestrator_1.OrionOrchestrator, { useClass: OrionOrchestrator_1.OrionOrchestrator }, SINGLETON);
    tsyringe_1.container.register(SocketService_1.SocketService, { useClass: SocketService_1.SocketService }, SINGLETON);
    if (process.env.NODE_ENV !== 'production') {
        console.log("🏗️  DI-Container: Infrastruktur optimiert und scharfgeschaltet!");
    }
};
exports.setupDIContainer = setupDIContainer;
