/**
 * JARVIS System Monitor
 * Monitoramento de recursos e saúde do sistema
 */

export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  gpu?: {
    usage: number;
    memory: number;
    temperature?: number;
  };
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  network?: {
    upload: number;
    download: number;
  };
  temperature?: {
    cpu?: number;
    gpu?: number;
    system?: number;
  };
  processes: {
    total: number;
    topCPU: ProcessInfo[];
    topMemory: ProcessInfo[];
  };
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}

export interface AlertRule {
  id: string;
  metric: string;
  condition: ">" | "<" | "=";
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  cooldownMs: number;
  lastTriggered?: number;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  metric: string;
  value: number;
  threshold: number;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
}

export class MetricsCollector {
  private lastMetrics: SystemMetrics | null = null;
  private sampleInterval = 1000;

  async collectMetrics(): Promise<SystemMetrics> {
    const metrics: SystemMetrics = {
      timestamp: new Date().toISOString(),
      cpu: await this.getCPUMetrics(),
      memory: await this.getMemoryMetrics(),
      storage: await this.getStorageMetrics(),
      processes: await this.getProcessMetrics(),
      gpu: await this.getGPUMetrics(),
      temperature: await this.getTemperatureMetrics(),
      network: await this.getNetworkMetrics(),
    };

    this.lastMetrics = metrics;
    return metrics;
  }

  private async getCPUMetrics(): Promise<SystemMetrics["cpu"]> {
    // Implementação simulada - em produção usar 'os' module
    return {
      usage: Math.random() * 100,
      cores: 8,
      frequency: 3600,
    };
  }

  private async getMemoryMetrics(): Promise<SystemMetrics["memory"]> {
    const total = 16 * 1024 * 1024 * 1024; // 16 GB
    const used = Math.random() * total;

    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  }

  private async getStorageMetrics(): Promise<SystemMetrics["storage"]> {
    const total = 500 * 1024 * 1024 * 1024; // 500 GB
    const used = Math.random() * total;

    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  }

  private async getProcessMetrics(): Promise<SystemMetrics["processes"]> {
    return {
      total: Math.floor(Math.random() * 200) + 50,
      topCPU: [
        {
          pid: 1234,
          name: "chrome",
          cpu: Math.random() * 30,
          memory: Math.random() * 50,
        },
        {
          pid: 5678,
          name: "vscode",
          cpu: Math.random() * 20,
          memory: Math.random() * 40,
        },
      ],
      topMemory: [
        {
          pid: 1234,
          name: "chrome",
          cpu: Math.random() * 10,
          memory: Math.random() * 80,
        },
        {
          pid: 9012,
          name: "node",
          cpu: Math.random() * 5,
          memory: Math.random() * 60,
        },
      ],
    };
  }

  private async getGPUMetrics(): Promise<SystemMetrics["gpu"] | undefined> {
    // GPU é opcional - retorna undefined se não disponível
    if (Math.random() > 0.7) return undefined;

    return {
      usage: Math.random() * 100,
      memory: Math.random() * 12000,
      temperature: 45 + Math.random() * 35,
    };
  }

  private async getTemperatureMetrics(): Promise<
    SystemMetrics["temperature"] | undefined
  > {
    if (Math.random() > 0.8) return undefined;

    return {
      cpu: 40 + Math.random() * 40,
      gpu: 50 + Math.random() * 30,
      system: 35 + Math.random() * 25,
    };
  }

  private async getNetworkMetrics(): Promise<SystemMetrics["network"] | undefined> {
    if (Math.random() > 0.6) return undefined;

    return {
      upload: Math.random() * 10,
      download: Math.random() * 100,
    };
  }
}

export class AlertManager {
  private rules: Map<string, AlertRule> = new Map();
  private alertHistory: SystemAlert[] = [];
  private maxAlertHistory = 1000;

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  evaluate(metrics: SystemMetrics): SystemAlert[] {
    const alerts: SystemAlert[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const value = this.extractMetricValue(metrics, rule.metric);
      if (value === null) continue;

      // Verificar cooldown
      if (rule.lastTriggered) {
        const timeSinceLastTrigger = Date.now() - rule.lastTriggered;
        if (timeSinceLastTrigger < rule.cooldownMs) {
          continue;
        }
      }

      // Verificar condição
      let triggered = false;
      if (rule.condition === ">" && value > rule.threshold) triggered = true;
      if (rule.condition === "<" && value < rule.threshold) triggered = true;
      if (rule.condition === "=" && value === rule.threshold) triggered = true;

      if (triggered) {
        rule.lastTriggered = Date.now();

        const alert: SystemAlert = {
          id: `alert-${Date.now()}`,
          timestamp: metrics.timestamp,
          metric: rule.metric,
          value,
          threshold: rule.threshold,
          severity: rule.severity,
          message: this.generateAlertMessage(rule, value),
        };

        alerts.push(alert);
        this.recordAlert(alert);
      }
    }

    return alerts;
  }

  private extractMetricValue(metrics: SystemMetrics, metric: string): number | null {
    const parts = metric.split(".");

    let current: any = metrics;
    for (const part of parts) {
      if (current === null || current === undefined) return null;
      current = current[part];
    }

    return typeof current === "number" ? current : null;
  }

  private generateAlertMessage(rule: AlertRule, value: number): string {
    const severityEmojis = {
      low: "🟡",
      medium: "🟠",
      high: "🔴",
      critical: "🔴🔴",
    };

    const emoji = severityEmojis[rule.severity];

    return `${emoji} ${rule.metric}: ${value.toFixed(1)} (limite: ${rule.threshold})`;
  }

  private recordAlert(alert: SystemAlert): void {
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.maxAlertHistory) {
      this.alertHistory.shift();
    }
  }

  getAlertHistory(limit = 50): SystemAlert[] {
    return this.alertHistory.slice(-limit);
  }

  getActiveAlerts(): SystemAlert[] {
    const oneHourAgo = Date.now() - 3600000;
    return this.alertHistory.filter(
      alert => new Date(alert.timestamp).getTime() > oneHourAgo
    );
  }
}

export class SystemMonitor {
  private collector: MetricsCollector;
  private alertManager: AlertManager;
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private isRunning = false;

  constructor() {
    this.collector = new MetricsCollector();
    this.alertManager = new AlertManager();
    this.setupDefaultRules();
  }

  private setupDefaultRules(): void {
    this.alertManager.addRule({
      id: "cpu-high",
      metric: "cpu.usage",
      condition: ">",
      threshold: 80,
      severity: "high",
      enabled: true,
      cooldownMs: 60000,
    });

    this.alertManager.addRule({
      id: "memory-high",
      metric: "memory.percentage",
      condition: ">",
      threshold: 85,
      severity: "high",
      enabled: true,
      cooldownMs: 60000,
    });

    this.alertManager.addRule({
      id: "storage-low",
      metric: "storage.percentage",
      condition: ">",
      threshold: 90,
      severity: "critical",
      enabled: true,
      cooldownMs: 3600000,
    });

    this.alertManager.addRule({
      id: "temperature-high",
      metric: "temperature.cpu",
      condition: ">",
      threshold: 80,
      severity: "high",
      enabled: true,
      cooldownMs: 120000,
    });
  }

  async start(intervalMs: number = 5000): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;
    this.monitoringInterval = setInterval(async () => {
      await this.tick();
    }, intervalMs);

    // Coleta inicial
    await this.tick();
  }

  stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isRunning = false;
  }

  private async tick(): Promise<void> {
    const metrics = await this.collector.collectMetrics();
    const alerts = this.alertManager.evaluate(metrics);

    // Emit events ou logging
    if (alerts.length > 0) {
      this.onAlertsDetected(alerts);
    }
  }

  private onAlertsDetected(alerts: SystemAlert[]): void {
    // Override em subclasses ou listeners
  }

  async getSystemStatus(): Promise<string> {
    const metrics = await this.collector.collectMetrics();
    const alerts = this.alertManager.getActiveAlerts();

    if (alerts.length === 0) {
      return `✓ Sistema saudável
CPU: ${metrics.cpu.usage.toFixed(1)}%
RAM: ${(metrics.memory.percentage).toFixed(1)}%
Disco: ${(metrics.storage.percentage).toFixed(1)}%`;
    }

    const criticalAlerts = alerts.filter(a => a.severity === "critical");
    if (criticalAlerts.length > 0) {
      return `⚠️ ALERTA CRÍTICO: ${criticalAlerts[0].message}`;
    }

    return `⚠️ Avisos ativos: ${alerts.length}
${alerts.slice(0, 2).map(a => a.message).join("\n")}`;
  }

  getMetricsCollector(): MetricsCollector {
    return this.collector;
  }

  getAlertManager(): AlertManager {
    return this.alertManager;
  }
}
