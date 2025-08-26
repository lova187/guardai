export interface StressEvent {
  type: 'audio' | 'command';
  payload: string;
  at: number;
}

export class StressSim {
  private isActive: boolean = false;
  private eventQueue: StressEvent[] = [];
  private callback?: (event: StressEvent) => void;
  private intervalId?: number;

  start(callback: (event: StressEvent) => void): void {
    this.isActive = true;
    this.callback = callback;
    this.scheduleNextEvent();
  }

  stop(): void {
    this.isActive = false;
    this.eventQueue = [];
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = undefined;
    }
  }

  nextEvent(): StressEvent | null {
    return this.eventQueue.shift() || null;
  }

  private scheduleNextEvent(): void {
    if (!this.isActive) return;
    
    // Random delay between 3-15 seconds
    const delay = Math.random() * 12000 + 3000;
    
    this.intervalId = setTimeout(() => {
      if (this.isActive) {
        const event = this.generateRandomEvent();
        if (this.callback) {
          this.callback(event);
        }
        this.scheduleNextEvent();
      }
    }, delay);
  }

  private generateRandomEvent(): StressEvent {
    const eventTypes = ['audio', 'command'];
    const commands = [
      'Block high!',
      'Duck low!',
      'Move left!',
      'Move right!',
      'Counter attack!',
      'Reset guard!',
      'Stay focused!'
    ];
    const audioTypes = ['alert', 'warning', 'attention'];
    
    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)] as 'audio' | 'command';
    
    let payload: string;
    if (type === 'command') {
      payload = commands[Math.floor(Math.random() * commands.length)];
    } else {
      payload = audioTypes[Math.floor(Math.random() * audioTypes.length)];
    }
    
    return {
      type,
      payload,
      at: Date.now()
    };
  }
}
