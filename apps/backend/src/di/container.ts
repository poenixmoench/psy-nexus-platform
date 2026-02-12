import ConsoleLogger from "../utils/ConsoleLogger";
import { registerAgents } from "./modules/agent-module";
import { container, Lifecycle } from "tsyringe";
import { EventEmitter2 } from "eventemitter2";
import { OrionOrchestrator } from "../orchestrator/OrionOrchestrator";
import { SocketService } from "../services/SocketService";
import { GeometryTool } from "../tools/GeometryTool";
import { ConcreteAgentExecutor } from "../executors/ConcreteAgentExecutor";

const SINGLETON = { lifecycle: Lifecycle.Singleton };

// Guard gegen Mehrfach-Initialisierung
let isInitialized = false;

export const setupDIContainer = () => {
  if (isInitialized) {
    return;
  }

  registerAgents();

  // Logger
  const consoleLogger = new ConsoleLogger();
  container.register("Logger", { useValue: consoleLogger });
  
  // Event System
  const eventEmitter = new EventEmitter2({ wildcard: true, delimiter: ".", maxListeners: 20 });
  container.register("EventEmitter", { useValue: eventEmitter });
  container.register(EventEmitter2, { useValue: eventEmitter });

  // Tools & Executors
  container.register(GeometryTool, { useClass: GeometryTool }, SINGLETON);

  container.register("AgentExecutor", {
    useClass: ConcreteAgentExecutor
  }, SINGLETON);

  // Core Services
  container.register(OrionOrchestrator, { useClass: OrionOrchestrator }, SINGLETON);
  container.register(SocketService, { useClass: SocketService }, SINGLETON);

  isInitialized = true;

  if (process.env.NODE_ENV !== 'production') {
    console.log("🏗️  DI-Container: Infrastruktur optimiert und scharfgeschaltet!");
  }
};
