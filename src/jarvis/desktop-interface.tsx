/**
 * JARVIS Desktop Interface
 * Interface gráfica minimalista e futurista para o assistente IA pessoal
 */

import React, { useState, useEffect, useRef } from 'react';
import { SystemMetrics, SystemAlert } from './system-monitor';
import { ReflectionOutput } from './reflection-engine';
import { ParticleCore } from './particle-core';

export type JARVISState =
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SEARCHING'
  | 'CODING'
  | 'ANALYZING'
  | 'EXECUTING'
  | 'SPEAKING'
  | 'SUCCESS'
  | 'ERROR';

export interface JARVISSessionData {
  taskId: string;
  objective: string;
  startTime: number;
  currentState: JARVISState;
  transcript: string;
  response: string;
  toolsUsed: string[];
  currentActivity: string;
  systemMetrics?: SystemMetrics;
  alerts?: SystemAlert[];
  reflection?: ReflectionOutput;
  memoryContext: string[];
  history: HistoryEntry[];
}

export interface HistoryEntry {
  id: string;
  timestamp: number;
  state: JARVISState;
  objective: string;
  result: string;
  success: boolean;
}

export interface DesktopSettings {
  theme: 'dark' | 'light';
  audioVisualizerEnabled: boolean;
  particleDensity: number;
  refreshRate: number;
  autoSaveHistory: boolean;
}

const stateColors: Record<JARVISState, string> = {
  IDLE: '#64748b',
  LISTENING: '#3b82f6',
  THINKING: '#8b5cf6',
  SEARCHING: '#06b6d4',
  CODING: '#10b981',
  ANALYZING: '#f59e0b',
  EXECUTING: '#ef4444',
  SPEAKING: '#ec4899',
  SUCCESS: '#22c55e',
  ERROR: '#dc2626',
};

const stateLabels: Record<JARVISState, string> = {
  IDLE: 'Inativo',
  LISTENING: 'Ouvindo',
  THINKING: 'Pensando',
  SEARCHING: 'Pesquisando',
  CODING: 'Codificando',
  ANALYZING: 'Analisando',
  EXECUTING: 'Executando',
  SPEAKING: 'Falando',
  SUCCESS: 'Sucesso',
  ERROR: 'Erro',
};

interface DesktopInterfaceProps {
  onCommand?: (command: string) => void;
  onSettingsChange?: (settings: DesktopSettings) => void;
}

export const DesktopInterface: React.FC<DesktopInterfaceProps> = ({
  onCommand,
  onSettingsChange,
}) => {
  const [session, setSession] = useState<JARVISSessionData>({
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
  });

  const [settings, setSettings] = useState<DesktopSettings>({
    theme: 'dark',
    audioVisualizerEnabled: true,
    particleDensity: 0.7,
    refreshRate: 60,
    autoSaveHistory: true,
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const particleCoreRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const updateState = (newState: JARVISState, activity?: string) => {
    setSession(prev => ({
      ...prev,
      currentState: newState,
      currentActivity: activity || prev.currentActivity,
    }));
  };

  const updateResponse = (response: string) => {
    setSession(prev => ({
      ...prev,
      response,
    }));
  };

  const addToHistory = (entry: HistoryEntry) => {
    setSession(prev => ({
      ...prev,
      history: [...prev.history, entry],
    }));
  };

  const handleSettingsChange = (newSettings: DesktopSettings) => {
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const stateColor = stateColors[session.currentState];
  const stateLabel = stateLabels[session.currentState];

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
      color: settings.theme === 'dark' ? '#e2e8f0' : '#1e293b',
      fontFamily: '"JetBrains Mono", "Courier New", monospace',
      overflow: 'hidden',
    }}>
      {/* Central 3D Core */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        borderRight: `1px solid ${settings.theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
      }}>
        <div
          ref={particleCoreRef}
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Particle Core Placeholder */}
          <svg
            style={{
              width: '100%',
              height: '100%',
              opacity: 0.6,
            }}
            viewBox="0 0 400 400"
          >
            {/* Animated central orb */}
            <circle
              cx="200"
              cy="200"
              r="60"
              fill={stateColor}
              opacity="0.3"
              style={{
                filter: `drop-shadow(0 0 20px ${stateColor})`,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />

            {/* Orbital rings */}
            <circle
              cx="200"
              cy="200"
              r="100"
              fill="none"
              stroke={stateColor}
              strokeWidth="1"
              opacity="0.2"
              style={{
                animation: 'rotate 20s linear infinite',
              }}
            />
            <circle
              cx="200"
              cy="200"
              r="140"
              fill="none"
              stroke={stateColor}
              strokeWidth="1"
              opacity="0.15"
              style={{
                animation: 'rotate -30s linear infinite',
              }}
            />

            {/* Particle dots */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const radius = 120;
              const x = 200 + Math.cos(angle) * radius;
              const y = 200 + Math.sin(angle) * radius;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill={stateColor}
                  opacity="0.6"
                  style={{
                    animation: `orbit 30s linear infinite`,
                    transformOrigin: '200px 200px',
                    transformBox: 'fill-box',
                  }}
                />
              );
            })}
          </svg>

          {/* State indicator */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: stateColor,
                marginBottom: '8px',
                textShadow: `0 0 10px ${stateColor}`,
              }}
            >
              {stateLabel}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: settings.theme === 'dark' ? '#64748b' : '#94a3b8',
                maxWidth: '300px',
              }}
            >
              {session.currentActivity}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pulse {
            0%, 100% { r: 60; opacity: 0.3; }
            50% { r: 70; opacity: 0.5; }
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); transform-origin: 200px 200px; }
            100% { transform: rotate(360deg); transform-origin: 200px 200px; }
          }
          @keyframes orbit {
            0% { transform: rotate(0deg) translateX(0); transform-origin: 200px 200px; }
            100% { transform: rotate(360deg) translateX(0); transform-origin: 200px 200px; }
          }
        `}</style>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: `1px solid ${settings.theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
          backgroundColor: settings.theme === 'dark' ? '#020617' : '#f8fafc',
          overflowY: 'auto',
        }}
      >
        {/* Transcription Section */}
        <Section title="Transcrição">
          <div
            style={{
              fontSize: '12px',
              minHeight: '60px',
              padding: '8px',
              backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
              border: `1px solid ${settings.theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
              borderRadius: '4px',
              fontStyle: session.transcript ? 'normal' : 'italic',
              color: session.transcript ? 'inherit' : (settings.theme === 'dark' ? '#64748b' : '#94a3b8'),
            }}
          >
            {session.transcript || 'Nenhuma transcrição'}
          </div>
        </Section>

        {/* Response Section */}
        <Section title="Resposta">
          <div
            style={{
              fontSize: '12px',
              minHeight: '60px',
              padding: '8px',
              backgroundColor: settings.theme === 'dark' ? '#0f172a' : '#ffffff',
              border: `1px solid ${settings.theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
              borderRadius: '4px',
              fontStyle: session.response ? 'normal' : 'italic',
              color: session.response ? 'inherit' : (settings.theme === 'dark' ? '#64748b' : '#94a3b8'),
            }}
          >
            {session.response || 'Aguardando resposta'}
          </div>
        </Section>

        {/* Tools Used */}
        <Section title={`Ferramentas (${session.toolsUsed.length})`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {session.toolsUsed.length > 0 ? (
              session.toolsUsed.map((tool, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    backgroundColor: stateColor,
                    color: 'white',
                    borderRadius: '3px',
                    opacity: 0.7,
                  }}
                >
                  {tool}
                </div>
              ))
            ) : (
              <div style={{ fontSize: '11px', color: settings.theme === 'dark' ? '#64748b' : '#94a3b8' }}>
                Nenhuma ferramenta usada
              </div>
            )}
          </div>
        </Section>

        {/* System Indicators */}
        <Section title="Sistema">
          {session.systemMetrics ? (
            <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
              <div>CPU: {session.systemMetrics.cpu.usage.toFixed(1)}%</div>
              <div>RAM: {session.systemMetrics.memory.percentage.toFixed(1)}%</div>
              <div>Disco: {session.systemMetrics.storage.percentage.toFixed(1)}%</div>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: settings.theme === 'dark' ? '#64748b' : '#94a3b8' }}>
              Métricas indisponíveis
            </div>
          )}
        </Section>

        {/* Control Buttons */}
        <div style={{ padding: '8px', borderTop: `1px solid ${settings.theme === 'dark' ? '#1e293b' : '#e2e8f0'}`, marginTop: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button
              label="Histórico"
              onClick={() => setShowHistory(!showHistory)}
              color={stateColor}
              theme={settings.theme}
            />
            <Button
              label="Configurações"
              onClick={() => setShowSettings(!showSettings)}
              color={stateColor}
              theme={settings.theme}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onClose={() => setShowSettings(false)}
          onChange={handleSettingsChange}
          theme={settings.theme}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal
          history={session.history}
          onClose={() => setShowHistory(false)}
          theme={settings.theme}
        />
      )}
    </div>
  );
};

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ padding: '12px', borderBottom: '1px solid #1e293b' }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          marginBottom: '8px',
          opacity: 0.7,
        }}
      >
        {collapsed ? '▶' : '▼'} {title}
      </div>
      {!collapsed && <div>{children}</div>}
    </div>
  );
};

interface ButtonProps {
  label: string;
  onClick: () => void;
  color: string;
  theme: 'dark' | 'light';
}

const Button: React.FC<ButtonProps> = ({ label, onClick, color, theme }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '8px 12px',
        fontSize: '11px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        border: `1px solid ${color}`,
        backgroundColor: hover ? color : 'transparent',
        color: hover ? '#000000' : color,
        cursor: 'pointer',
        borderRadius: '3px',
        transition: 'all 0.2s ease',
        fontFamily: '"JetBrains Mono", monospace',
      }}
    >
      {label}
    </button>
  );
};

interface SettingsModalProps {
  settings: DesktopSettings;
  onClose: () => void;
  onChange: (settings: DesktopSettings) => void;
  theme: 'dark' | 'light';
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onClose, onChange, theme }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '400px',
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
          CONFIGURAÇÕES
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            <input
              type="checkbox"
              checked={settings.audioVisualizerEnabled}
              onChange={e =>
                onChange({ ...settings, audioVisualizerEnabled: e.target.checked })
              }
              style={{ marginRight: '8px' }}
            />
            Visualizador de Áudio
          </label>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px' }}>
            Densidade de Partículas: {settings.particleDensity.toFixed(1)}
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={settings.particleDensity}
              onChange={e =>
                onChange({ ...settings, particleDensity: parseFloat(e.target.value) })
              }
              style={{ display: 'block', width: '100%', marginTop: '4px' }}
            />
          </label>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          FECHAR
        </button>
      </div>
    </div>
  );
};

interface HistoryModalProps {
  history: HistoryEntry[];
  onClose: () => void;
  theme: 'dark' | 'light';
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose, theme }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
          border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          maxHeight: '600px',
          overflowY: 'auto',
          color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
          HISTÓRICO ({history.length})
        </h2>

        {history.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.slice(-10).reverse().map(entry => (
              <div
                key={entry.id}
                style={{
                  padding: '8px',
                  backgroundColor: theme === 'dark' ? '#020617' : '#f8fafc',
                  border: `1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'}`,
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                <div
                  style={{
                    color: entry.success ? '#22c55e' : '#dc2626',
                    fontWeight: 'bold',
                    marginBottom: '4px',
                  }}
                >
                  {entry.success ? '✓' : '✗'} {entry.objective}
                </div>
                <div style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: '10px' }}>
                  {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: theme === 'dark' ? '#64748b' : '#94a3b8' }}>
            Nenhum histórico disponível
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        >
          FECHAR
        </button>
      </div>
    </div>
  );
};

export default DesktopInterface;
