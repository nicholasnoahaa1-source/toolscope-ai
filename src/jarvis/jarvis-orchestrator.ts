/**
 * JARVIS Orchestrator
 * Coordenador central que integra todos os subsistemas
 * Reflection Engine, System Monitor, Desktop Interface
 */

import { MetricsCollector, AlertManager, SystemMonitor, SystemMetrics, SystemAlert } from './system-monitor';
import { ReflectionEngine, ReflectionInput, ReflectionOutput } from './reflection-engine';
import { JARVISState, JARVISSessionData, HistoryEntry } from './desktop-interface';
import { ParticleCore } from './particle-core';

export interface JARVISConfig {
  enableReflection: boolean;
  enableMonitoring: boolean;
  enableParticleCore: boolean;
  monitoringInterval: number;
  reflectionThreshold: number;
}

export interface TaskExecution {
  taskId: string;
  objective: string;
  plan: string;
  actionsPerformed: string[];
  result: string;
  success: boolean;
  duration: number;
  errors: string[];
  hypothesesTested: { hypothesis: string; wasCorrect: boolean }[];
  evidence: string[];
  toolsUsed: string[];
}

export interface JARVISContext {
  memory: Map<string, unknown>;
  knowledgeBase: Map<string, string>;
  previousReflections: ReflectionOutput[];
  taskHistory: TaskExecution[];
}

export class JARVISOrchestrator {
  private config: JARVISConfig;
  private reflectionEngine: ReflectionEngine;
  private systemMonitor: SystemMonitor;
  private particleCore: ParticleCore | null = null;

  private context: JARVISContext = {
    memory: new Map(),
    knowledgeBase: new Map(),
    previousReflections: [],
    taskHistory: [],
  };

  private currentSessionData: JARVISSessionData | null = null;
  private isInitialized = false;

  constructor(config: Partial<JARVISConfig> = {}) {
    this.config = {
      enableReflection: config.enableReflection ?? true,
      enableMonitoring: config.enableMonitoring ?? true,
      enableParticleCore: config.enableParticleCore ?? true,
      monitoringInterval: config.monitoringInterval ?? 5000,
      reflectionThreshold: config.reflectionThreshold ?? 0.7,
    };

    this.reflectionEngine = new ReflectionEngine();
    this.systemMonitor = new SystemMonitor();

    if (this.config.enableParticleCore) {
      this.particleCore = new ParticleCore({
        containerSelector: '#particle-core',
        width: 1200,
        height: 800,
        particleCount: 1000,
        particleDensity: 0.7,
        audioReactive: true,
        animationSpeed: 0.5,
      });
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize monitoring
      if (this.config.enableMonitoring) {
        await this.systemMonitor.start(this.config.monitoringInterval);
      }

      // Initialize particle core
      if (this.particleCore) {
        await this.particleCore.initialize();
        this.particleCore.start();
      }

      this.isInitialized = true;
      console.log('JARVIS Orchestrator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize JARVIS Orchestrator:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      if (this.config.enableMonitoring) {
        this.systemMonitor.stop();
      }

      if (this.particleCore) {
        this.particleCore.stop();
      }

      this.isInitialized = false;
      console.log('JARVIS Orchestrator shut down');
    } catch (error) {
      console.error('Error during JARVIS shutdown:', error);
    }
  }

  async executeTask(task: TaskExecution): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('JARVIS Orchestrator not initialized');
    }

    try {
      // Update session state
      this.updateSessionState('THINKING', 'Executando tarefa...');

      // Execute task (placeholder - actual execution would happen here)
      const startTime = Date.now();

      // Collect system metrics
      const metrics = await this.systemMonitor.getMetricsCollector().collectMetrics();
      this.updateSessionMetrics(metrics);

      // Simulate task execution
      await this.executeTaskLogic(task);

      const duration = Date.now() - startTime;
      task.duration = duration;

      // Perform reflection if enabled
      if (this.config.enableReflection) {
        await this.performReflection(task);
      }

      // Add to history
      this.addToHistory(task);

      // Update session state to success
      this.updateSessionState('SUCCESS', 'Tarefa concluída');
    } catch (error) {
      console.error('Task execution failed:', error);
      this.updateSessionState('ERROR', `Erro: ${String(error)}`);

      if (error instanceof Error) {
        if (!this.currentSessionData) {
          throw error;
        }
        this.currentSessionData.currentState = 'ERROR';
        this.currentSessionData.response = error.message;
      }
    }
  }

  private async executeTaskLogic(task: TaskExecution): Promise<void> {
    // Placeholder for actual task execution logic
    // In a real implementation, this would:
    // 1. Parse the objective
    // 2. Execute the plan
    // 3. Handle errors
    // 4. Collect evidence

    return new Promise(resolve => {
      setTimeout(resolve, Math.random() * 3000 + 1000);
    });
  }

  private async performReflection(task: TaskExecution): Promise<void> {
    if (!this.config.enableReflection) return;

    const reflectionInput: ReflectionInput = {
      taskId: task.taskId,
      objective: task.objective,
      plan: task.plan,
      actionsPerformed: task.actionsPerformed,
      result: task.result,
      success: task.success,
      duration: task.duration,
      errors: task.errors,
      hypothesesTested: task.hypothesesTested,
      evidence: task.evidence,
    };

    const reflection = await this.reflectionEngine.reflect(reflectionInput);

    // Store reflection in context
    this.context.previousReflections.push(reflection);
    if (this.context.previousReflections.length > 100) {
      this.context.previousReflections.shift();
    }

    // Update session with reflection
    if (this.currentSessionData) {
      this.currentSessionData.reflection = reflection;
    }
  }

  private addToHistory(task: TaskExecution): void {
    this.context.taskHistory.push(task);

    if (this.currentSessionData) {
      const entry: HistoryEntry = {
        id: task.taskId,
        timestamp: Date.now(),
        state: task.success ? 'SUCCESS' : 'ERROR',
        objective: task.objective,
        result: task.result,
        success: task.success,
      };

      this.currentSessionData.history.push(entry);
    }
  }

  private updateSessionState(state: JARVISState, activity: string): void {
    if (this.currentSessionData) {
      this.currentSessionData.currentState = state;
      this.currentSessionData.currentActivity = activity;
    }
  }

  private updateSessionMetrics(metrics: SystemMetrics): void {
    if (this.currentSessionData) {
      this.currentSessionData.systemMetrics = metrics;
    }

    // Update particle core audio reactivity
    if (this.particleCore && this.config.enableParticleCore) {
      const cpuLoad = metrics.cpu.usage / 100;
      const audioLevel = Math.min(1, cpuLoad + 0.2);
      // The particle core will pick this up via getAudioLevel()
    }
  }

  // Session Management
  createSession(): JARVISSessionData {
    this.currentSessionData = {
      taskId: `task-${Date.now()}`,
      objective: '',
      startTime: Date.now(),
      currentState: 'IDLE',
      transcript: '',
      response: '',
      toolsUsed: [],
      currentActivity: 'Aguardando comando',
      memoryContext: [],
      history: [],
    };

    return this.currentSessionData;
  }

  getCurrentSession(): JARVISSessionData | null {
    return this.currentSessionData;
  }

  updateTranscript(transcript: string): void {
    if (this.currentSessionData) {
      this.currentSessionData.transcript = transcript;
    }
  }

  updateResponse(response: string): void {
    if (this.currentSessionData) {
      this.currentSessionData.response = response;
    }
  }

  addToolUsed(tool: string): void {
    if (this.currentSessionData && !this.currentSessionData.toolsUsed.includes(tool)) {
      this.currentSessionData.toolsUsed.push(tool);
    }
  }

  // Memory Management
  storeMemory(key: string, value: unknown): void {
    this.context.memory.set(key, value);
  }

  retrieveMemory(key: string): unknown {
    return this.context.memory.get(key);
  }

  getMemoryKeys(): string[] {
    return Array.from(this.context.memory.keys());
  }

  // Knowledge Base
  addKnowledge(key: string, knowledge: string): void {
    this.context.knowledgeBase.set(key, knowledge);
  }

  getKnowledge(key: string): string | undefined {
    return this.context.knowledgeBase.get(key);
  }

  searchKnowledge(query: string): Map<string, string> {
    const results = new Map<string, string>();
    for (const [key, value] of this.context.knowledgeBase.entries()) {
      if (key.toLowerCase().includes(query.toLowerCase()) ||
          value.toLowerCase().includes(query.toLowerCase())) {
        results.set(key, value);
      }
    }
    return results;
  }

  // System Status
  async getSystemStatus(): Promise<string> {
    return this.systemMonitor.getSystemStatus();
  }

  getReflectionInsights(context?: string) {
    return this.reflectionEngine.getInsights(context);
  }

  // Getters
  getContext(): JARVISContext {
    return this.context;
  }

  getReflectionEngine(): ReflectionEngine {
    return this.reflectionEngine;
  }

  getSystemMonitor(): SystemMonitor {
    return this.systemMonitor;
  }

  getParticleCore(): ParticleCore | null {
    return this.particleCore;
  }

  isRunning(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
let jarvisInstance: JARVISOrchestrator | null = null;

export function getJARVIS(config?: Partial<JARVISConfig>): JARVISOrchestrator {
  if (!jarvisInstance) {
    jarvisInstance = new JARVISOrchestrator(config);
  }
  return jarvisInstance;
}

export function resetJARVIS(): void {
  jarvisInstance = null;
}
