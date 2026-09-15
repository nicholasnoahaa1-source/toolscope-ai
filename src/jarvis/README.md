# JARVIS - Personal AI Assistant System

JARVIS é um sistema completo de assistente de IA pessoal com arquitetura modular, autoreflexão estruturada, monitoramento de sistema em tempo real e interface desktop futurista.

## 🏗 Arquitetura

```
JARVIS
├── Reflection Engine     (Autoreflexão estruturada)
├── System Monitor        (Monitoramento de recursos)
├── Desktop Interface     (Interface gráfica minimalista)
├── Particle Core         (Visualização 3D interativa)
├── JARVIS Orchestrator   (Coordenador central)
├── Configuration         (Princípios e comportamento)
└── Electron Main         (Processo principal da aplicação)
```

## 📦 Componentes

### 1. Reflection Engine (`reflection-engine.ts`)

Sistema de autoreflexão que avalia o desempenho de tarefas completadas.

**Características:**
- Análise estruturada em 9 dimensões (objetivo, plano, ações, resultados, etc.)
- Prevenção de reflexão infinita (máximo 3 níveis de profundidade)
- Validação de insights baseada em confiança (> 0.7)
- Detecção de contradições com insights existentes
- Armazenamento persistente de aprendizagens

**Uso:**
```typescript
import { ReflectionEngine } from './reflection-engine';

const engine = new ReflectionEngine();
const reflection = await engine.reflect({
  taskId: 'task-001',
  objective: 'Encontrar informações sobre...',
  plan: 'Pesquisar → Analisar → Resumir',
  actionsPerformed: ['search', 'analyze'],
  result: 'Informações encontradas',
  success: true,
  duration: 5000,
  errors: [],
  hypothesesTested: [{ hypothesis: 'A é verdadeiro', wasCorrect: true }],
  evidence: ['Evidência 1', 'Evidência 2'],
});
```

### 2. System Monitor (`system-monitor.ts`)

Monitoramento em tempo real dos recursos do sistema.

**Métricas coletadas:**
- CPU (uso, cores, frequência)
- Memória (usada, total, percentual)
- GPU (uso, memória, temperatura)
- Armazenamento (usado, total, percentual)
- Rede (upload, download)
- Temperatura (CPU, GPU, sistema)
- Processos (top CPU, top memória)

**Alertas:**
- Regras configuráveis por métrica
- Cooldowns para evitar spam
- Histórico de 1000 alertas máximo
- 4 níveis de severidade (low, medium, high, critical)

**Uso:**
```typescript
import { SystemMonitor, AlertRule } from './system-monitor';

const monitor = new SystemMonitor();
await monitor.start(5000);

// Adicionar regra de alerta
monitor.getAlertManager().addRule({
  id: 'cpu-high',
  metric: 'cpu.usage',
  condition: '>',
  threshold: 80,
  severity: 'high',
  enabled: true,
  cooldownMs: 60000,
});

// Obter status
const status = await monitor.getSystemStatus();
```

### 3. Desktop Interface (`desktop-interface.tsx`)

Interface gráfica minimalista e futurista em React.

**Características:**
- Core central com animações 3D
- Indicador de estado (IDLE, LISTENING, THINKING, etc.)
- Visualizador de áudio (reativo ao som)
- Exibição de transcrição em tempo real
- Histórico de tarefas
- Indicadores de sistema (CPU, RAM, Disco)
- Configurações em tempo real

**Estados disponíveis:**
- `IDLE` - Aguardando
- `LISTENING` - Ouvindo entrada
- `THINKING` - Processando
- `SEARCHING` - Pesquisando
- `CODING` - Codificando
- `ANALYZING` - Analisando
- `EXECUTING` - Executando
- `SPEAKING` - Falando
- `SUCCESS` - Sucesso
- `ERROR` - Erro

### 4. Particle Core (`particle-core.ts`)

Visualização 3D interativa com Three.js/WebGL.

**Características:**
- Simulação de partículas física-realista
- Reatividade a áudio (FFT analysis)
- Atração ao centro configurável
- Ciclo de vida de partículas
- Densidade de partículas ajustável

**Uso:**
```typescript
import { ParticleCore } from './particle-core';

const core = new ParticleCore({
  containerSelector: '#particle-core',
  width: 1200,
  height: 800,
  particleCount: 1000,
  particleDensity: 0.7,
  audioReactive: true,
  animationSpeed: 0.5,
});

await core.initialize();
core.start();
```

### 5. JARVIS Orchestrator (`jarvis-orchestrator.ts`)

Coordenador central que integra todos os subsistemas.

**Responsabilidades:**
- Gerenciar sessões de trabalho
- Executar tarefas com reflexão automática
- Gerenciar memória e base de conhecimento
- Coordenar monitoramento de sistema
- Armazenar histórico de tarefas

**Uso:**
```typescript
import { getJARVIS } from './jarvis-orchestrator';

const jarvis = getJARVIS({
  enableReflection: true,
  enableMonitoring: true,
  enableParticleCore: true,
  monitoringInterval: 5000,
  reflectionThreshold: 0.7,
});

await jarvis.initialize();
const session = jarvis.createSession();
```

### 6. Configuration (`jarvis-config.ts`)

Configuração centralizada com princípios de comportamento.

**Princípios:**
- Distinção clara entre conhecimento/observação/inferência/hipótese
- Admissão de incerteza
- Validação de ferramentas usadas
- Raciocínio estruturado
- Autoreflexão

**Protocolo de Pensamento:**
```typescript
import { ThinkingProtocol } from './jarvis-config';

const thinking = new ThinkingProtocol();
thinking.observe('Observação direta');
thinking.infer('Conclusão lógica', 0.8);
thinking.hypothesize('Hipótese testável', 0.5);
thinking.act('Ação tomada');
thinking.result('Resultado obtido', 1);

const summary = thinking.generateSummary();
```

### 7. Electron Main (`electron-main.ts`)

Processo principal da aplicação Electron.

**Funcionalidades:**
- Inicialização da janela principal
- Setup de IPC channels
- Gerenciamento de Menu
- Integração de todos os subsistemas
- Preload de segurança

## 🚀 Inicialização

### 1. Instalar dependências

```bash
npm install electron react react-dom typescript
npm install -D @types/react @types/react-dom
```

### 2. Configurar package.json

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development electron .",
    "build": "cross-env NODE_ENV=production tsc",
    "start": "npm run build && electron ."
  },
  "main": "dist/jarvis/electron-main.js"
}
```

### 3. Usar JARVIS

```typescript
import { getJARVIS, JARVISConfig } from './jarvis';

// Criar instância
const jarvis = getJARVIS({
  enableReflection: true,
  enableMonitoring: true,
  enableParticleCore: true,
});

// Inicializar
await jarvis.initialize();

// Criar sessão
const session = jarvis.createSession();

// Executar tarefa
await jarvis.executeTask({
  taskId: 'task-001',
  objective: 'Objetivo da tarefa',
  plan: 'Plano de execução',
  actionsPerformed: ['ação1', 'ação2'],
  result: 'Resultado',
  success: true,
  duration: 5000,
  errors: [],
  hypothesesTested: [],
  evidence: [],
  toolsUsed: ['tool1'],
});

// Obter insights
const insights = jarvis.getReflectionInsights();

// Shutdown
await jarvis.shutdown();
```

## 📊 Princípios de JARVIS

### Honestidade Intelectual
- Distinguir entre CONHECIMENTO (fato estabelecido) e OBSERVAÇÃO (visto diretamente)
- INFERÊNCIA (conclusão lógica) vs HIPÓTESE (suposição testável)
- AÇÃO (o que foi feito) vs RESULTADO (o que aconteceu)

### Uso Adequado de Ferramentas
- Preferir ferramentas internas ao invés de simulações
- Validar uso de ferramentas
- Documentar escolhas de ferramentas

### Raciocínio Estruturado
- Separar explicitamente passos de pensamento
- Evitar misturar níveis de abstração
- Validar suposições antes de agir

### Autoreflexão
- Refletir automaticamente após falhas críticas
- Armazenar aprendizagens (insights)
- Limitar profundidade de reflexão (máx 3 níveis)

## 🎨 Arquitetura da Interface

```
┌─────────────────────────────────────┐
│     JARVIS Desktop Interface        │
├────────────────┬────────────────────┤
│                │  Transcrição       │
│  Particle      │  Resposta          │
│  Core 3D       │  Ferramentas (4)   │
│  Central       │  Sistema           │
│  (Animado)     │  Histórico/Config  │
│                │                    │
└────────────────┴────────────────────┘
```

**Cores por Estado:**
- IDLE: #64748b (Cinza)
- LISTENING: #3b82f6 (Azul)
- THINKING: #8b5cf6 (Roxo)
- SEARCHING: #06b6d4 (Ciano)
- CODING: #10b981 (Verde)
- ANALYZING: #f59e0b (Âmbar)
- EXECUTING: #ef4444 (Vermelho)
- SPEAKING: #ec4899 (Rosa)
- SUCCESS: #22c55e (Verde claro)
- ERROR: #dc2626 (Vermelho escuro)

## 🔧 Configuração

### Princípios (padrão)
```typescript
{
  distinguishKnowledge: true,
  admitUncertainty: true,
  acknowledgeNoKnowledge: true,
  preferBuiltInTools: true,
  validateToolUsage: true,
  enableReflection: true,
  reflectionDepth: 3,
  enableSystemMonitoring: true,
  enableAudioReactivity: true,
  maxMemoryItems: 1000,
  maxHistoryEntries: 500,
}
```

### Comportamento (padrão)
```typescript
{
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
}
```

## 📈 Monitoramento

### Métricas disponíveis
- `cpu.usage` - Percentual de uso
- `cpu.cores` - Número de cores
- `cpu.frequency` - Frequência em MHz
- `memory.used` - Memória usada (bytes)
- `memory.total` - Memória total (bytes)
- `memory.percentage` - Percentual de uso
- `gpu.usage` - Uso de GPU
- `gpu.memory` - Memória GPU (MB)
- `gpu.temperature` - Temperatura (°C)
- `storage.used` - Disco usado (bytes)
- `storage.total` - Disco total (bytes)
- `storage.percentage` - Percentual de uso

### Alertas padrão
1. **CPU Alto**: > 80% por 1 min
2. **Memória Alta**: > 85% por 1 min
3. **Disco Cheio**: > 90% por 1 hora
4. **Temperatura Alta**: > 80°C por 2 min

## 🔐 Segurança

- Process isolation com Electron
- No node integration no renderer
- Preload script seguro
- Context Bridge para IPC
- Sandbox habilitado
- CSP configurado

## 📚 Referências

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Three.js Documentation](https://threejs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 🎯 Próximos Passos

- [ ] Integração com APIs de LLM reais (Gemini, Grok, Claude)
- [ ] Síntese de fala (text-to-speech)
- [ ] Reconhecimento de fala (speech-to-text)
- [ ] Persistência de dados (banco de dados local)
- [ ] Sincronização em nuvem
- [ ] Plugins customizados
- [ ] Temas customizáveis

## 📄 Licença

Parte do projeto ToolScope AI

---

**Versão:** 1.0.0  
**Status:** Desenvolvimento  
**Linguagem:** TypeScript/React  
**Data:** 2026-09
