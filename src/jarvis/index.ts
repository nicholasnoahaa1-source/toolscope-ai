/**
 * JARVIS - Personal AI Assistant System
 * Índice central de exportações
 */

// System Monitor
export type { SystemMetrics, ProcessInfo, AlertRule, SystemAlert } from './system-monitor';
export { MetricsCollector, AlertManager, SystemMonitor } from './system-monitor';

// Reflection Engine
export type { ReflectionInput, ReflectionOutput, LearnableInsight } from './reflection-engine';
export { ReflectionEngine } from './reflection-engine';

// Desktop Interface
export type {
  JARVISState,
  JARVISSessionData,
  HistoryEntry,
  DesktopSettings,
} from './desktop-interface';
export { DesktopInterface } from './desktop-interface';

// Particle Core
export { ParticleCore, Particle } from './particle-core';
export type { ParticleCoreConfig } from './particle-core';

// Orchestrator
export { JARVISOrchestrator, getJARVIS, resetJARVIS } from './jarvis-orchestrator';
export type { JARVISConfig as OrchestratorConfig, TaskExecution, JARVISContext } from './jarvis-orchestrator';

// Configuration
export {
  JARVISConfig,
  JARVISKnowledgeBase,
  ThinkingProtocol,
  KnowledgeType,
} from './jarvis-config';
export type {
  JARVISPrinciples,
  JARVISBehavior,
  KnowledgeItem,
  ThinkingStep,
} from './jarvis-config';
export { DEFAULT_PRINCIPLES, DEFAULT_BEHAVIOR } from './jarvis-config';

// Electron
// Note: electron-main.ts and preload.ts are excluded from Next.js build
// They are compiled separately for the Electron main and preload processes

/**
 * JARVIS - Quick Start Guide
 *
 * 1. Initialize JARVIS:
 *    ```typescript
 *    import { getJARVIS } from './jarvis';
 *    const jarvis = getJARVIS();
 *    await jarvis.initialize();
 *    ```
 *
 * 2. Create a session:
 *    ```typescript
 *    const session = jarvis.createSession();
 *    ```
 *
 * 3. Execute a task:
 *    ```typescript
 *    await jarvis.executeTask({
 *      taskId: 'task-001',
 *      objective: 'Find information about...',
 *      plan: 'Step-by-step plan',
 *      actionsPerformed: [...],
 *      result: 'What was found',
 *      success: true,
 *      duration: 1000,
 *      errors: [],
 *      hypothesesTested: [],
 *      evidence: [],
 *      toolsUsed: ['search', 'summarization'],
 *    });
 *    ```
 *
 * 4. Access reflection insights:
 *    ```typescript
 *    const insights = jarvis.getReflectionInsights();
 *    ```
 *
 * 5. Get system status:
 *    ```typescript
 *    const status = await jarvis.getSystemStatus();
 *    ```
 */
