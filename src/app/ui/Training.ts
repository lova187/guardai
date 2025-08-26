import { Router } from '../router';
import { PoseCoach } from '../../core/poseCoach';
import { CoachRules } from '../../core/coachRules';
import { StressSim } from '../../core/stressSim';
import { Progress } from '../../core/progress';
import { Camera } from '../../utils/camera';
import { CanvasHelper } from '../../utils/canvas';

export class Training {
  private poseCoach?: PoseCoach;
  private coachRules: CoachRules;
  private stressSim: StressSim;
  private progress: Progress;
  private camera: Camera;
  private canvas: CanvasHelper;
  private isTraining: boolean = false;
  private sessionStart: number = 0;
  private sessionMetrics = {
    accuracy: { stance: 0, blocks: 0, combos: 0 },
    reactionMs: 0,
    punches: 0
  };

  constructor(private router: Router) {
    this.coachRules = new CoachRules();
    this.stressSim = new StressSim();
    this.progress = new Progress();
    this.camera = new Camera();
    this.canvas = new CanvasHelper();
  }

  render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const screen = document.createElement('div');
    screen.id = 'training-screen';
    screen.className = 'screen screen-hidden training-container';
    screen.innerHTML = `
      <div class="video-container">
        <video id="video" autoplay muted playsinline></video>
        <canvas id="canvas"></canvas>
        
        <div id="hints-panel" class="hints-panel">
          <div id="hints-container">
            <div class="hint info">Position yourself in front of the camera</div>
          </div>
        </div>
      </div>
      
      <div class="controls">
        <button id="start-btn" class="btn">Start Training</button>
        <button id="stop-btn" class="btn btn-secondary" style="display: none;">Stop</button>
        <button id="demo-btn" class="btn btn-secondary">Demo Mode</button>
      </div>
    `;

    app.appendChild(screen);
    this.setupEventListeners();
  }

  async show(): Promise<void> {
    try {
      // Initialize pose detection if not already done
      if (!this.poseCoach) {
        this.showHint('Loading AI model...', 'info');
        this.poseCoach = new PoseCoach();
        await this.poseCoach.init();
      }
      
      this.showHint('Ready to start training!', 'info');
    } catch (error) {
      console.error('Failed to initialize training:', error);
      this.showHint('Failed to load AI model. Try demo mode.', 'warn');
    }
  }

  private setupEventListeners(): void {
    const startBtn = document.getElementById('start-btn') as HTMLButtonElement;
    const stopBtn = document.getElementById('stop-btn') as HTMLButtonElement;
    const demoBtn = document.getElementById('demo-btn') as HTMLButtonElement;

    startBtn.addEventListener('click', () => this.startTraining());
    stopBtn.addEventListener('click', () => this.stopTraining());
    demoBtn.addEventListener('click', () => this.startDemo());
  }

  private async startTraining(): Promise<void> {
    try {
      const video = document.getElementById('video') as HTMLVideoElement;
      const canvas = document.getElementById('canvas') as HTMLCanvasElement;
      
      this.showHint('Requesting camera access...', 'info');
      
      // Get camera stream
      const stream = await this.camera.getStream();
      video.srcObject = stream;
      
      // Setup canvas
      this.canvas.setup(canvas, video);
      
      // Start training session
      this.isTraining = true;
      this.sessionStart = Date.now();
      this.sessionMetrics = {
        accuracy: { stance: 0, blocks: 0, combos: 0 },
        reactionMs: 0,
        punches: 0
      };
      
      // Update UI
      document.getElementById('start-btn')!.style.display = 'none';
      document.getElementById('stop-btn')!.style.display = 'inline-block';
      document.getElementById('demo-btn')!.style.display = 'none';
      
      // Start pose detection loop
      this.detectPoses(video, canvas);
      
      // Start stress simulation
      this.stressSim.start((event) => {
        this.handleStressEvent(event);
      });
      
      this.showHint('Training started! Follow the instructions.', 'info');
      
    } catch (error) {
      console.error('Failed to start training:', error);
      this.showHint('Camera access denied. Try demo mode instead.', 'warn');
    }
  }

  private stopTraining(): void {
    this.isTraining = false;
    this.stressSim.stop();
    
    // Stop camera
    this.camera.stop();
    
    // Save session
    this.saveSession();
    
    // Update UI
    document.getElementById('start-btn')!.style.display = 'inline-block';
    document.getElementById('stop-btn')!.style.display = 'none';
    document.getElementById('demo-btn')!.style.display = 'inline-block';
    
    const sessionDuration = Math.round((Date.now() - this.sessionStart) / 1000);
    this.showHint(`Training completed! Duration: ${sessionDuration}s`, 'info');
  }

  private startDemo(): void {
    this.showHint('Demo mode: Follow the on-screen instructions without camera.', 'info');
    
    // Simulate training without camera
    this.isTraining = true;
    this.sessionStart = Date.now();
    
    // Update UI
    document.getElementById('start-btn')!.style.display = 'none';
    document.getElementById('stop-btn')!.style.display = 'inline-block';
    document.getElementById('demo-btn')!.style.display = 'none';
    
    // Start demo instructions
    this.runDemoSequence();
  }

  private runDemoSequence(): void {
    const instructions = [
      'Raise your guard position',
      'Keep your chin down',
      'Move left, then right',
      'Practice blocking motions',
      'Throw quick jabs'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (!this.isTraining || index >= instructions.length) {
        clearInterval(interval);
        if (this.isTraining) {
          this.stopTraining();
        }
        return;
      }
      
      this.showHint(instructions[index], 'info');
      index++;
    }, 3000);
  }

  private async detectPoses(video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<void> {
    if (!this.isTraining || !this.poseCoach) return;

    try {
      const pose = await this.poseCoach.detect(video);
      if (pose) {
        // Draw pose on canvas
        this.canvas.drawPose(pose);
        
        // Get coaching hints
        const hints = this.coachRules.evaluate(pose);
        this.displayHints(hints);
        
        // Update metrics
        this.updateMetrics(pose, hints);
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }

    // Continue detection loop
    requestAnimationFrame(() => this.detectPoses(video, canvas));
  }

  private displayHints(hints: any[]): void {
    const container = document.getElementById('hints-container');
    if (!container) return;

    // Clear old hints
    container.innerHTML = '';
    
    hints.forEach(hint => {
      const hintElement = document.createElement('div');
      hintElement.className = `hint ${hint.severity}`;
      hintElement.textContent = this.getHintMessage(hint.code);
      container.appendChild(hintElement);
    });
  }

  private getHintMessage(code: string): string {
    const messages: Record<string, string> = {
      'RAISE_GUARD': 'Raise your guard higher',
      'LOWER_CHIN': 'Keep your chin down',
      'MOVE_LEFT': 'Move to the left',
      'MOVE_RIGHT': 'Move to the right',
      'GOOD_STANCE': 'Perfect stance!',
      'BLOCK_HIGH': 'Block high',
      'BLOCK_LOW': 'Block low'
    };
    return messages[code] || 'Keep training!';
  }

  private handleStressEvent(event: any): void {
    if (event.type === 'audio') {
      this.playAudioCue(event.payload);
    } else if (event.type === 'command') {
      this.showHint(`Quick! ${event.payload}`, 'warn');
      // Measure reaction time
      const reactionStart = Date.now();
      // This would be enhanced with actual pose verification
      setTimeout(() => {
        this.sessionMetrics.reactionMs = Date.now() - reactionStart;
      }, 1500);
    }
  }

  private playAudioCue(type: string): void {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'alert' ? 800 : 400;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }

  private updateMetrics(pose: any, hints: any[]): void {
    // Simple scoring based on hints
    if (hints.length === 0) {
      this.sessionMetrics.accuracy.stance += 1;
    }
    
    // Count punches (simplified)
    if (hints.some(h => h.code.includes('BLOCK') || h.code.includes('PUNCH'))) {
      this.sessionMetrics.punches += 1;
    }
  }

  private saveSession(): void {
    const sessionData = {
      ...this.sessionMetrics,
      ts: Date.now(),
      duration: Date.now() - this.sessionStart
    };
    
    this.progress.log(sessionData);
  }

  private showHint(message: string, type: 'info' | 'warn'): void {
    const container = document.getElementById('hints-container');
    if (!container) return;
    
    container.innerHTML = `<div class="hint ${type}">${message}</div>`;
  }
}
