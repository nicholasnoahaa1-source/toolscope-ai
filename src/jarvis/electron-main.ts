// @ts-nocheck
/**
 * JARVIS Electron Main Process
 * Inicializa a aplicação desktop com integração de todos os subsistemas
 */

const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { getJARVIS, JARVISOrchestrator } = require('./jarvis-orchestrator');
const { JARVISConfig, ThinkingProtocol, KnowledgeType } = require('./jarvis-config');

interface DesktopConfig {
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  preload: string;
  nodeIntegration: boolean;
  enableRemoteModule: boolean;
}

class JARVISDesktopApp {
  private mainWindow: Electron.BrowserWindow | null = null;
  private jarvis: JARVISOrchestrator | null = null;
  private config: JARVISConfig | null = null;
  private thinking: ThinkingProtocol | null = null;

  constructor() {
    this.setupApp();
    this.setupIPC();
  }

  private setupApp(): void {
    app.on('ready', () => this.createWindow());
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });
    app.on('activate', () => {
      if (this.mainWindow === null) {
        this.createWindow();
      }
    });
  }

  private async createWindow(): Promise<void> {
    const desktopConfig: DesktopConfig = {
      width: 1600,
      height: 900,
      minWidth: 1200,
      minHeight: 700,
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
    };

    this.mainWindow = new BrowserWindow({
      width: desktopConfig.width,
      height: desktopConfig.height,
      minWidth: desktopConfig.minWidth,
      minHeight: desktopConfig.minHeight,
      webPreferences: {
        preload: desktopConfig.preload,
        nodeIntegration: desktopConfig.nodeIntegration,
        enableRemoteModule: desktopConfig.enableRemoteModule,
        sandbox: true,
      },
      icon: path.join(__dirname, '../assets/icon.png'),
    });

    // Load index.html
    const isDev = process.env.NODE_ENV === 'development';
    const startUrl = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../public/index.html')}`;

    this.mainWindow.loadURL(startUrl);

    if (isDev) {
      this.mainWindow.webContents.openDevTools();
    }

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.setupMenu();
    await this.initializeJARVIS();
  }

  private setupMenu(): void {
    const template = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Exit',
            accelerator: 'CmdOrCtrl+Q',
            click: () => {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
          { label: 'Redo', accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { label: 'Reload', accelerator: 'F5', role: 'reload' },
          { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
          { label: 'Toggle Dev Tools', accelerator: 'F12', role: 'toggleDevTools' },
        ],
      },
      {
        label: 'JARVIS',
        submenu: [
          {
            label: 'System Status',
            accelerator: 'CmdOrCtrl+Shift+S',
            click: () => this.sendToRenderer('jarvis:system-status'),
          },
          {
            label: 'Show Memory',
            click: () => this.sendToRenderer('jarvis:show-memory'),
          },
          {
            label: 'Clear Cache',
            click: () => this.handleClearCache(),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template as any);
    Menu.setApplicationMenu(menu);
  }

  private async initializeJARVIS(): Promise<void> {
    try {
      // Initialize configuration
      this.config = new JARVISConfig();

      const validation = this.config.validatePrinciples();
      if (!validation.valid) {
        console.warn('Configuration validation errors:', validation.errors);
      }

      // Initialize thinking protocol
      this.thinking = new ThinkingProtocol();

      // Initialize JARVIS
      this.jarvis = getJARVIS({
        enableReflection: true,
        enableMonitoring: true,
        enableParticleCore: true,
        monitoringInterval: 5000,
        reflectionThreshold: 0.7,
      });

      await this.jarvis.initialize();

      // Send ready signal to renderer
      this.sendToRenderer('jarvis:ready', {
        version: '1.0.0',
        principles: this.config.getPrinciples(),
        behavior: this.config.getBehavior(),
      });

      console.log('JARVIS Desktop Application initialized');
    } catch (error) {
      console.error('Failed to initialize JARVIS:', error);
      this.sendToRenderer('jarvis:error', {
        message: 'Falha ao inicializar JARVIS',
        error: String(error),
      });
    }
  }

  private setupIPC(): void {
    // Session management
    ipcMain.handle('jarvis:create-session', async () => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      return this.jarvis.createSession();
    });

    ipcMain.handle('jarvis:execute-task', async (event, task) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      await this.jarvis.executeTask(task);
    });

    // Monitoring
    ipcMain.handle('jarvis:system-status', async () => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      return this.jarvis.getSystemStatus();
    });

    // Memory management
    ipcMain.handle('jarvis:store-memory', (event, key, value) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      this.jarvis.storeMemory(key, value);
    });

    ipcMain.handle('jarvis:get-memory', (event, key) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      return this.jarvis.retrieveMemory(key);
    });

    ipcMain.handle('jarvis:get-memory-keys', () => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      return this.jarvis.getMemoryKeys();
    });

    // Knowledge base
    ipcMain.handle('jarvis:add-knowledge', (event, key, knowledge) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      this.jarvis.addKnowledge(key, knowledge);
    });

    ipcMain.handle('jarvis:get-knowledge', (event, key) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      return this.jarvis.getKnowledge(key);
    });

    ipcMain.handle('jarvis:search-knowledge', (event, query) => {
      if (!this.jarvis) throw new Error('JARVIS not initialized');
      const results = this.jarvis.searchKnowledge(query);
      return Array.from(results.entries());
    });

    // Thinking protocol
    ipcMain.handle('jarvis:record-observation', (event, observation, confidence) => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.observe(observation, confidence ?? 1);
    });

    ipcMain.handle('jarvis:record-inference', (event, inference, confidence) => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.infer(inference, confidence ?? 0.8);
    });

    ipcMain.handle('jarvis:record-hypothesis', (event, hypothesis, confidence) => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.hypothesize(hypothesis, confidence ?? 0.5);
    });

    ipcMain.handle('jarvis:record-action', (event, action) => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.act(action);
    });

    ipcMain.handle('jarvis:record-result', (event, result, confidence) => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.result(result, confidence ?? 1);
    });

    ipcMain.handle('jarvis:get-thinking-summary', () => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      return this.thinking.generateSummary();
    });

    ipcMain.handle('jarvis:clear-thinking', () => {
      if (!this.thinking) throw new Error('Thinking protocol not initialized');
      this.thinking.clear();
    });

    // Configuration
    ipcMain.handle('jarvis:update-principles', (event, updates) => {
      if (!this.config) throw new Error('Config not initialized');
      this.config.updatePrinciples(updates);
    });

    ipcMain.handle('jarvis:update-behavior', (event, updates) => {
      if (!this.config) throw new Error('Config not initialized');
      this.config.updateBehavior(updates);
    });

    // Lifecycle
    ipcMain.handle('jarvis:shutdown', async () => {
      if (this.jarvis) {
        await this.jarvis.shutdown();
      }
    });
  }

  private sendToRenderer(channel: string, data?: unknown): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  private handleClearCache(): void {
    if (this.jarvis) {
      const context = this.jarvis.getContext();
      context.memory.clear();
      this.sendToRenderer('jarvis:cache-cleared');
    }
  }
}

// Initialize app
new JARVISDesktopApp();
