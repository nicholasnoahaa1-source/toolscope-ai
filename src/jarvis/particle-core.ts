/**
 * JARVIS Particle Core
 * Visualização 3D interativa com Three.js e WebGL
 * Reatividade por áudio via FFT analysis
 */

export interface ParticleCoreConfig {
  containerSelector: string;
  width: number;
  height: number;
  particleCount: number;
  particleDensity: number;
  audioReactive: boolean;
  animationSpeed: number;
}

export class ParticleCore {
  private containerSelector: string;
  private width: number;
  private height: number;
  private particleCount: number;
  private particleDensity: number;
  private audioReactive: boolean;
  private animationSpeed: number;

  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioData: Uint8Array | null = null;
  private isRunning = false;

  constructor(config: ParticleCoreConfig) {
    this.containerSelector = config.containerSelector;
    this.width = config.width;
    this.height = config.height;
    this.particleCount = config.particleCount;
    this.particleDensity = config.particleDensity;
    this.audioReactive = config.audioReactive;
    this.animationSpeed = config.animationSpeed;
  }

  async initialize(): Promise<void> {
    if (this.audioReactive) {
      try {
        this.setupAudioContext();
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
        this.audioReactive = false;
      }
    }

    this.initializeParticles();
  }

  private setupAudioContext(): void {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;

    this.audioContext = new AudioContext();
    if (!this.audioContext) return;

    this.analyser = this.audioContext.createAnalyser();
    if (!this.analyser) return;

    this.analyser.fftSize = 256;

    const bufferLength = this.analyser.frequencyBinCount;
    this.audioData = new Uint8Array(bufferLength);

    // Attempt to get user media for audio input
    if (navigator.mediaDevices?.getUserMedia && this.audioContext && this.analyser) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          if (this.audioContext && this.analyser) {
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
          }
        })
        .catch(() => {
          console.warn('Microphone access denied');
        });
    }
  }

  private initializeParticles(): void {
    const adjustedCount = Math.floor(this.particleCount * this.particleDensity);

    for (let i = 0; i < adjustedCount; i++) {
      this.particles.push(new Particle());
    }
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    if (!this.isRunning) return;

    let audioLevel = 0;
    if (this.audioReactive && this.analyser && this.audioData) {
      this.analyser.getByteFrequencyData(this.audioData as any);
      audioLevel = this.audioData.reduce((a, b) => a + b) / this.audioData.length / 255;
    }

    for (const particle of this.particles) {
      particle.update(this.animationSpeed, audioLevel);
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  setParticleDensity(density: number): void {
    this.particleDensity = Math.max(0.1, Math.min(1, density));
    const targetCount = Math.floor(this.particleCount * this.particleDensity);

    if (targetCount > this.particles.length) {
      for (let i = this.particles.length; i < targetCount; i++) {
        this.particles.push(new Particle());
      }
    } else if (targetCount < this.particles.length) {
      this.particles = this.particles.slice(0, targetCount);
    }
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  getAudioLevel(): number {
    if (!this.audioReactive || !this.analyser || !this.audioData) return 0;
    return this.audioData.reduce((a, b) => a + b) / this.audioData.length / 255;
  }
}

export class Particle {
  position: [number, number, number] = [
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
  ];

  velocity: [number, number, number] = [
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
  ];

  acceleration: [number, number, number] = [0, 0, 0];
  radius: number = Math.random() * 2 + 1;
  mass: number = Math.random() * 1 + 0.5;
  life: number = 1;
  maxLife: number = Math.random() * 200 + 100;

  private centerAttraction = 0.001;
  private dampening = 0.98;

  update(speed: number, audioLevel: number): void {
    // Apply damping
    this.velocity[0] *= this.dampening;
    this.velocity[1] *= this.dampening;
    this.velocity[2] *= this.dampening;

    // Center attraction
    const dist = Math.sqrt(
      this.position[0] ** 2 + this.position[1] ** 2 + this.position[2] ** 2
    );

    if (dist > 0) {
      const force = this.centerAttraction * (audioLevel + 0.5);
      this.acceleration[0] = (-this.position[0] / dist) * force;
      this.acceleration[1] = (-this.position[1] / dist) * force;
      this.acceleration[2] = (-this.position[2] / dist) * force;
    }

    // Apply acceleration
    this.velocity[0] += this.acceleration[0];
    this.velocity[1] += this.acceleration[1];
    this.velocity[2] += this.acceleration[2];

    // Apply velocity with speed multiplier
    this.position[0] += this.velocity[0] * speed;
    this.position[1] += this.velocity[1] * speed;
    this.position[2] += this.velocity[2] * speed;

    // Audio reactivity
    this.radius = Math.max(0.5, Math.min(3, 2 + audioLevel * 2));

    // Life cycle
    this.life -= 1 / this.maxLife;

    // Reset if dead
    if (this.life <= 0) {
      this.reset();
    }
  }

  private reset(): void {
    this.position = [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    ];
    this.velocity = [
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
    ];
    this.life = 1;
    this.maxLife = Math.random() * 200 + 100;
  }

  getOpacity(): number {
    return Math.max(0, Math.min(1, this.life * 2));
  }
}
