// @ts-nocheck
/**
 * JARVIS Preload Script
 * Expõe IPC channels de forma segura para o processo renderer
 */

const { contextBridge, ipcRenderer } = require('electron');

interface JARVISBridge {
  // Session management
  createSession: () => Promise<unknown>;
  executeTask: (task: unknown) => Promise<void>;

  // Monitoring
  getSystemStatus: () => Promise<string>;

  // Memory management
  storeMemory: (key: string, value: unknown) => Promise<void>;
  getMemory: (key: string) => Promise<unknown>;
  getMemoryKeys: () => Promise<string[]>;

  // Knowledge base
  addKnowledge: (key: string, knowledge: string) => Promise<void>;
  getKnowledge: (key: string) => Promise<string | undefined>;
  searchKnowledge: (query: string) => Promise<[string, string][]>;

  // Thinking protocol
  recordObservation: (observation: string, confidence?: number) => Promise<void>;
  recordInference: (inference: string, confidence?: number) => Promise<void>;
  recordHypothesis: (hypothesis: string, confidence?: number) => Promise<void>;
  recordAction: (action: string) => Promise<void>;
  recordResult: (result: string, confidence?: number) => Promise<void>;
  getThinkingSummary: () => Promise<string>;
  clearThinking: () => Promise<void>;

  // Configuration
  updatePrinciples: (updates: unknown) => Promise<void>;
  updateBehavior: (updates: unknown) => Promise<void>;

  // Lifecycle
  shutdown: () => Promise<void>;

  // Events
  onReady: (callback: (data: unknown) => void) => void;
  onSystemStatus: (callback: (data: unknown) => void) => void;
  onError: (callback: (data: unknown) => void) => void;
}

const jarvisBridge: JARVISBridge = {
  // Session management
  createSession: () => ipcRenderer.invoke('jarvis:create-session'),
  executeTask: (task) => ipcRenderer.invoke('jarvis:execute-task', task),

  // Monitoring
  getSystemStatus: () => ipcRenderer.invoke('jarvis:system-status'),

  // Memory management
  storeMemory: (key, value) => ipcRenderer.invoke('jarvis:store-memory', key, value),
  getMemory: (key) => ipcRenderer.invoke('jarvis:get-memory', key),
  getMemoryKeys: () => ipcRenderer.invoke('jarvis:get-memory-keys'),

  // Knowledge base
  addKnowledge: (key, knowledge) => ipcRenderer.invoke('jarvis:add-knowledge', key, knowledge),
  getKnowledge: (key) => ipcRenderer.invoke('jarvis:get-knowledge', key),
  searchKnowledge: (query) => ipcRenderer.invoke('jarvis:search-knowledge', query),

  // Thinking protocol
  recordObservation: (observation, confidence) =>
    ipcRenderer.invoke('jarvis:record-observation', observation, confidence),
  recordInference: (inference, confidence) =>
    ipcRenderer.invoke('jarvis:record-inference', inference, confidence),
  recordHypothesis: (hypothesis, confidence) =>
    ipcRenderer.invoke('jarvis:record-hypothesis', hypothesis, confidence),
  recordAction: (action) => ipcRenderer.invoke('jarvis:record-action', action),
  recordResult: (result, confidence) =>
    ipcRenderer.invoke('jarvis:record-result', result, confidence),
  getThinkingSummary: () => ipcRenderer.invoke('jarvis:get-thinking-summary'),
  clearThinking: () => ipcRenderer.invoke('jarvis:clear-thinking'),

  // Configuration
  updatePrinciples: (updates) => ipcRenderer.invoke('jarvis:update-principles', updates),
  updateBehavior: (updates) => ipcRenderer.invoke('jarvis:update-behavior', updates),

  // Lifecycle
  shutdown: () => ipcRenderer.invoke('jarvis:shutdown'),

  // Events
  onReady: (callback) => {
    ipcRenderer.on('jarvis:ready', (event, data) => callback(data));
  },
  onSystemStatus: (callback) => {
    ipcRenderer.on('jarvis:system-status', (event, data) => callback(data));
  },
  onError: (callback) => {
    ipcRenderer.on('jarvis:error', (event, data) => callback(data));
  },
};

contextBridge.exposeInMainWorld('jarvis', jarvisBridge);

// Type definition for window.jarvis
declare global {
  interface Window {
    jarvis: JARVISBridge;
  }
}
