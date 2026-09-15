/**
 * JARVIS Reflection Engine
 * Auto-avaliação estruturada após tarefas importantes
 */

export interface ReflectionInput {
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
}

export interface ReflectionOutput {
  taskId: string;
  timestamp: string;
  task: string;
  result: string;
  whatWorked: string[];
  whatFailed: string[];
  why: string;
  lesson: string;
  nextTime: string;
  confidence: number;
  shouldStore: boolean;
}

export interface LearnableInsight {
  id: string;
  insight: string;
  context: string;
  confidence: number;
  applicability: string[];
  createdAt: string;
  usageCount: number;
  validated: boolean;
}

export class ReflectionEngine {
  private maxReflectionDepth = 3;
  private reflectionDepth = 0;
  private storedInsights: Map<string, LearnableInsight> = new Map();

  async reflect(input: ReflectionInput): Promise<ReflectionOutput> {
    if (this.reflectionDepth >= this.maxReflectionDepth) {
      return this.createMinimalReflection(input);
    }

    this.reflectionDepth++;

    try {
      const reflection = await this.analyzeTask(input);
      const shouldStore = await this.validateInsight(reflection);

      if (shouldStore) {
        this.storeInsight(reflection);
      }

      return { ...reflection, shouldStore };
    } finally {
      this.reflectionDepth--;
    }
  }

  private async analyzeTask(input: ReflectionInput): Promise<ReflectionOutput> {
    const whatWorked = this.identifySuccesses(input);
    const whatFailed = this.identifyFailures(input);
    const why = this.analyzeRootCauses(input);
    const lesson = this.extractLesson(input, whatFailed, whatWorked);
    const nextTime = this.suggestImprovement(input, whatFailed);

    return {
      taskId: input.taskId,
      timestamp: new Date().toISOString(),
      task: input.objective.substring(0, 100),
      result: input.result.substring(0, 200),
      whatWorked,
      whatFailed,
      why,
      lesson,
      nextTime,
      confidence: this.calculateConfidence(input),
      shouldStore: false,
    };
  }

  private identifySuccesses(input: ReflectionInput): string[] {
    const successes: string[] = [];

    if (input.success) {
      successes.push("Objetivo alcançado com sucesso");
    }

    const correctHypotheses = input.hypothesesTested
      .filter(h => h.wasCorrect)
      .map(h => `Hipótese verificada: ${h.hypothesis}`);
    successes.push(...correctHypotheses);

    if (input.duration < 5000) {
      successes.push("Execução rápida e eficiente");
    }

    if (input.errors.length === 0) {
      successes.push("Sem erros durante execução");
    }

    return successes.slice(0, 3);
  }

  private identifyFailures(input: ReflectionInput): string[] {
    const failures: string[] = [];

    if (!input.success) {
      failures.push("Objetivo não completamente alcançado");
    }

    const incorrectHypotheses = input.hypothesesTested
      .filter(h => !h.wasCorrect)
      .map(h => `Hipótese incorreta: ${h.hypothesis}`);
    failures.push(...incorrectHypotheses);

    failures.push(...input.errors);

    return failures.slice(0, 3);
  }

  private analyzeRootCauses(input: ReflectionInput): string {
    if (input.errors.length === 0 && input.success) {
      return "Execução conforme planejado. Não há erros significativos.";
    }

    const primaryError = input.errors[0];
    if (!primaryError) {
      return "Razões desconhecidas. Necessita investigação adicional.";
    }

    // Análise simples de causa raiz
    if (primaryError.includes("timeout")) {
      return "Timeout: operação excedeu tempo limite. Pode indicar processo lento ou recurso indisponível.";
    }
    if (primaryError.includes("not found")) {
      return "Recurso não encontrado. Planejamento inicial não considerou disponibilidade.";
    }
    if (primaryError.includes("permission")) {
      return "Permissão negada. Necessário ajustar privilégios ou abordagem.";
    }

    return "Erro durante execução. Requer análise mais profunda.";
  }

  private extractLesson(
    input: ReflectionInput,
    whatFailed: string[],
    whatWorked: string[]
  ): string {
    if (whatFailed.length === 0) {
      return "Processo executado corretamente. Padrão pode ser reutilizado.";
    }

    const primaryFailure = whatFailed[0];
    if (primaryFailure.includes("Hipótese")) {
      return "Validar hipóteses antes de assumir. Realidade frequentemente difere da expectativa.";
    }

    if (primaryFailure.includes("erro")) {
      return "Tratamento de erros foi insuficiente. Necessário planejar cenários adversos.";
    }

    return "Falhas ocorrem. Importância reside em identificá-las e aprender.";
  }

  private suggestImprovement(input: ReflectionInput, whatFailed: string[]): string {
    if (whatFailed.length === 0) {
      return "Repetir a mesma abordagem em contextos similares.";
    }

    const suggestions: string[] = [];

    if (input.errors.some(e => e.includes("timeout"))) {
      suggestions.push("Aumentar timeout ou dividir em sub-tarefas menores");
    }

    if (input.hypothesesTested.some(h => !h.wasCorrect)) {
      suggestions.push("Validar pressupostos antes de comprometer recursos");
    }

    if (input.duration > 10000) {
      suggestions.push("Otimizar processo ou usar cache de resultados anteriores");
    }

    return suggestions[0] || "Revisar plano inicial com informações coletadas.";
  }

  private calculateConfidence(input: ReflectionInput): number {
    let confidence = 0.5;

    if (input.success) confidence += 0.3;
    if (input.errors.length === 0) confidence += 0.1;
    if (input.hypothesesTested.filter(h => h.wasCorrect).length > 0) confidence += 0.1;

    return Math.min(confidence, 1);
  }

  private async validateInsight(reflection: ReflectionOutput): Promise<boolean> {
    // Política de memória: só armazenar insights de alta confiança
    if (reflection.confidence < 0.7) return false;

    // Não armazenar se houver contradição com insights existentes
    const contradiction = this.checkForContradiction(reflection.lesson);
    if (contradiction) return false;

    return true;
  }

  private checkForContradiction(newInsight: string): boolean {
    for (const stored of this.storedInsights.values()) {
      if (this.areContradictory(stored.insight, newInsight)) {
        return true;
      }
    }
    return false;
  }

  private areContradictory(insight1: string, insight2: string): boolean {
    // Simples heurística: palavras-chave opostas
    const opposites = [
      ["aumentar", "diminuir"],
      ["rápido", "lento"],
      ["sempre", "nunca"],
    ];

    for (const [word1, word2] of opposites) {
      if (
        insight1.toLowerCase().includes(word1) &&
        insight2.toLowerCase().includes(word2)
      ) {
        return true;
      }
    }

    return false;
  }

  private storeInsight(reflection: ReflectionOutput): void {
    const id = `insight-${Date.now()}`;
    const insight: LearnableInsight = {
      id,
      insight: reflection.lesson,
      context: reflection.task,
      confidence: reflection.confidence,
      applicability: this.inferApplicability(reflection),
      createdAt: reflection.timestamp,
      usageCount: 0,
      validated: false,
    };

    this.storedInsights.set(id, insight);
  }

  private inferApplicability(reflection: ReflectionOutput): string[] {
    const applicability: string[] = [];

    if (reflection.task.toLowerCase().includes("search")) {
      applicability.push("search", "information-retrieval");
    }
    if (reflection.task.toLowerCase().includes("code")) {
      applicability.push("coding", "debugging");
    }
    if (reflection.task.toLowerCase().includes("analysis")) {
      applicability.push("analysis", "reasoning");
    }

    return applicability;
  }

  private createMinimalReflection(input: ReflectionInput): ReflectionOutput {
    return {
      taskId: input.taskId,
      timestamp: new Date().toISOString(),
      task: input.objective.substring(0, 50),
      result: input.success ? "Concluído" : "Falhou",
      whatWorked: input.success ? ["Objetivo alcançado"] : [],
      whatFailed: input.errors,
      why: "Profundidade de reflexão máxima atingida",
      lesson: "Limite de reflexão alcançado",
      nextTime: "Executar novamente com ajustes",
      confidence: input.success ? 0.8 : 0.3,
      shouldStore: false,
    };
  }

  getInsights(context?: string): LearnableInsight[] {
    if (!context) {
      return Array.from(this.storedInsights.values());
    }

    return Array.from(this.storedInsights.values()).filter(insight =>
      insight.applicability.some(app =>
        app.toLowerCase().includes(context.toLowerCase())
      )
    );
  }

  recordInsightUsage(insightId: string): void {
    const insight = this.storedInsights.get(insightId);
    if (insight) {
      insight.usageCount++;
    }
  }
}
