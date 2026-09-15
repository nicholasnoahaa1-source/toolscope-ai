/**
 * JARVIS Configuration and Principles
 * Configuração centralizada com diretrizes de comportamento
 */

export interface JARVISPrinciples {
  // Honestidade intelectual
  distinguishKnowledge: boolean; // Distinguir entre conhecimento/observação/inferência/hipótese/ação/resultado
  admitUncertainty: boolean;
  acknowledgeNoKnowledge: boolean;

  // Uso adequado de ferramentas
  preferBuiltInTools: boolean; // Preferir ferramentas internas ao invés de simulações
  validateToolUsage: boolean;
  documentToolChoices: boolean;

  // Raciocínio estruturado
  explicitlySeparateSteps: boolean;
  avoidMixingLevels: boolean; // Evitar misturar observação com inferência
  validateAssumptions: boolean;

  // Autoreflexão
  enableReflection: boolean;
  reflectionDepth: number; // 0-3
  storeInsights: boolean;

  // Performance e monitoramento
  enableSystemMonitoring: boolean;
  enableAudioReactivity: boolean;
  maxMemoryItems: number;
  maxHistoryEntries: number;
}

export const DEFAULT_PRINCIPLES: JARVISPrinciples = {
  distinguishKnowledge: true,
  admitUncertainty: true,
  acknowledgeNoKnowledge: true,
  preferBuiltInTools: true,
  validateToolUsage: true,
  documentToolChoices: true,
  explicitlySeparateSteps: true,
  avoidMixingLevels: true,
  validateAssumptions: true,
  enableReflection: true,
  reflectionDepth: 3,
  storeInsights: true,
  enableSystemMonitoring: true,
  enableAudioReactivity: true,
  maxMemoryItems: 1000,
  maxHistoryEntries: 500,
};

export interface JARVISBehavior {
  // Resposta padrão
  responseStyle: 'direct' | 'structured' | 'detailed';
  languagePreference: 'pt-BR' | 'en-US';

  // Reflexão automática
  autoReflectOnFail: boolean;
  autoReflectOnSuccess: boolean;

  // Limites
  maxExecutionTime: number; // ms
  maxMemoryUsage: number; // MB
  maxApiCalls: number;

  // Comportamento
  verbosity: 'minimal' | 'normal' | 'verbose';
  showMetrics: boolean;
  showThinkingProcess: boolean;
}

export const DEFAULT_BEHAVIOR: JARVISBehavior = {
  responseStyle: 'structured',
  languagePreference: 'pt-BR',
  autoReflectOnFail: true,
  autoReflectOnSuccess: false,
  maxExecutionTime: 30000,
  maxMemoryUsage: 500,
  maxApiCalls: 10,
  verbosity: 'normal',
  showMetrics: true,
  showThinkingProcess: true,
};

export enum KnowledgeType {
  OBSERVATION = 'observation', // O que foi observado diretamente
  INFERENCE = 'inference', // Conclusão lógica baseada em observações
  HYPOTHESIS = 'hypothesis', // Suposição testável
  KNOWLEDGE = 'knowledge', // Fato estabelecido
  ACTION = 'action', // O que foi feito
  RESULT = 'result', // Resultado da ação
}

export interface KnowledgeItem {
  type: KnowledgeType;
  content: string;
  timestamp: number;
  confidence: number; // 0-1
  source: string;
  context?: string;
}

export class JARVISKnowledgeBase {
  private items: KnowledgeItem[] = [];
  private maxItems: number;

  constructor(maxItems: number = 1000) {
    this.maxItems = maxItems;
  }

  record(
    type: KnowledgeType,
    content: string,
    confidence: number = 1,
    source: string = 'system',
    context?: string
  ): void {
    this.items.push({
      type,
      content,
      timestamp: Date.now(),
      confidence,
      source,
      context,
    });

    if (this.items.length > this.maxItems) {
      this.items.shift();
    }
  }

  getObservations(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.OBSERVATION);
  }

  getInferences(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.INFERENCE);
  }

  getHypotheses(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.HYPOTHESIS);
  }

  getKnowledge(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.KNOWLEDGE);
  }

  getActions(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.ACTION);
  }

  getResults(): KnowledgeItem[] {
    return this.items.filter(i => i.type === KnowledgeType.RESULT);
  }

  getRecent(count: number = 10): KnowledgeItem[] {
    return this.items.slice(-count);
  }

  search(query: string): KnowledgeItem[] {
    return this.items.filter(
      i => i.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  clear(): void {
    this.items = [];
  }

  getAllItems(): KnowledgeItem[] {
    return [...this.items];
  }
}

export class JARVISConfig {
  private principles: JARVISPrinciples;
  private behavior: JARVISBehavior;
  private knowledgeBase: JARVISKnowledgeBase;

  constructor(
    principles: Partial<JARVISPrinciples> = {},
    behavior: Partial<JARVISBehavior> = {}
  ) {
    this.principles = { ...DEFAULT_PRINCIPLES, ...principles };
    this.behavior = { ...DEFAULT_BEHAVIOR, ...behavior };
    this.knowledgeBase = new JARVISKnowledgeBase(this.principles.maxMemoryItems);
  }

  getPrinciples(): JARVISPrinciples {
    return this.principles;
  }

  getBehavior(): JARVISBehavior {
    return this.behavior;
  }

  getKnowledgeBase(): JARVISKnowledgeBase {
    return this.knowledgeBase;
  }

  updatePrinciples(updates: Partial<JARVISPrinciples>): void {
    this.principles = { ...this.principles, ...updates };
  }

  updateBehavior(updates: Partial<JARVISBehavior>): void {
    this.behavior = { ...this.behavior, ...updates };
  }

  // Validation
  validatePrinciples(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.principles.reflectionDepth < 0 || this.principles.reflectionDepth > 3) {
      errors.push('Reflection depth must be between 0 and 3');
    }

    if (this.principles.maxMemoryItems < 100) {
      errors.push('Max memory items should be at least 100');
    }

    if (this.principles.maxHistoryEntries < 10) {
      errors.push('Max history entries should be at least 10');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateBehavior(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.behavior.maxExecutionTime < 1000) {
      errors.push('Max execution time should be at least 1 second');
    }

    if (this.behavior.maxMemoryUsage < 50) {
      errors.push('Max memory usage should be at least 50 MB');
    }

    if (this.behavior.maxApiCalls < 1) {
      errors.push('Max API calls should be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  toJSON(): string {
    return JSON.stringify({
      principles: this.principles,
      behavior: this.behavior,
    }, null, 2);
  }

  static fromJSON(json: string): JARVISConfig {
    const { principles, behavior } = JSON.parse(json);
    return new JARVISConfig(principles, behavior);
  }
}

// JARVIS Thinking Protocol
export interface ThinkingStep {
  type: 'observation' | 'inference' | 'hypothesis' | 'action' | 'result';
  description: string;
  timestamp: number;
  confidence?: number;
  dependencies?: string[]; // IDs de steps anteriores
}

export class ThinkingProtocol {
  private steps: ThinkingStep[] = [];

  observe(observation: string, confidence: number = 1): void {
    this.addStep('observation', observation, confidence);
  }

  infer(inference: string, confidence: number = 0.8): void {
    this.addStep('inference', inference, confidence);
  }

  hypothesize(hypothesis: string, confidence: number = 0.5): void {
    this.addStep('hypothesis', hypothesis, confidence);
  }

  act(action: string): void {
    this.addStep('action', action);
  }

  result(result: string, confidence: number = 1): void {
    this.addStep('result', result, confidence);
  }

  private addStep(
    type: ThinkingStep['type'],
    description: string,
    confidence?: number
  ): void {
    this.steps.push({
      type,
      description,
      timestamp: Date.now(),
      confidence,
    });
  }

  getSteps(): ThinkingStep[] {
    return [...this.steps];
  }

  getByType(type: ThinkingStep['type']): ThinkingStep[] {
    return this.steps.filter(s => s.type === type);
  }

  generateSummary(): string {
    const observations = this.getByType('observation').length;
    const inferences = this.getByType('inference').length;
    const hypotheses = this.getByType('hypothesis').length;
    const actions = this.getByType('action').length;
    const results = this.getByType('result').length;

    return [
      `Observações: ${observations}`,
      `Inferências: ${inferences}`,
      `Hipóteses: ${hypotheses}`,
      `Ações: ${actions}`,
      `Resultados: ${results}`,
    ].join(' | ');
  }

  clear(): void {
    this.steps = [];
  }
}
