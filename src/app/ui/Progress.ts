import { Router } from '../router';
import { Progress as ProgressCore } from '../../core/progress';
import { Badges } from '../../core/badges';

export class Progress {
  private progress: ProgressCore;
  private badges: Badges;

  constructor(private router: Router) {
    this.progress = new ProgressCore();
    this.badges = new Badges();
  }

  render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const screen = document.createElement('div');
    screen.id = 'progress-screen';
    screen.className = 'screen screen-hidden';
    screen.innerHTML = `
      <div class="container">
        <div style="text-align: center; color: white; margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Your Progress</h1>
          <p style="opacity: 0.8;">Track your training journey</p>
        </div>
        
        <div class="progress-grid" id="stats-grid">
          <!-- Stats will be populated here -->
        </div>
        
        <div style="text-align: center; color: white; margin: 3rem 0 1rem 0;">
          <h2>Achievements</h2>
        </div>
        
        <div class="badges-grid" id="badges-grid">
          <!-- Badges will be populated here -->
        </div>
        
        <div style="text-align: center; margin-top: 3rem;">
          <button id="reset-progress" class="btn btn-secondary">Reset Progress</button>
        </div>
      </div>
    `;

    app.appendChild(screen);
    this.setupEventListeners();
  }

  show(): void {
    this.updateStats();
    this.updateBadges();
  }

  private setupEventListeners(): void {
    const resetBtn = document.getElementById('reset-progress') as HTMLButtonElement;
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all progress?')) {
        this.progress.reset();
        this.badges.reset();
        this.updateStats();
        this.updateBadges();
      }
    });
  }

  private updateStats(): void {
    const statsGrid = document.getElementById('stats-grid');
    if (!statsGrid) return;

    const stats = this.progress.getStats();
    const totalSessions = this.progress.getSessions().length;
    
    statsGrid.innerHTML = `
      <div class="stat-card">
        <div class="stat-value">${totalSessions}</div>
        <div>Training Sessions</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${stats.accuracy.stance}%</div>
        <div>Stance Accuracy</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${stats.accuracy.blocks}%</div>
        <div>Block Accuracy</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${stats.totalPunches}</div>
        <div>Total Punches</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${stats.avgReaction}ms</div>
        <div>Avg Reaction Time</div>
      </div>
      
      <div class="stat-card">
        <div class="stat-value">${Math.round(stats.totalTrainingTime / 60000)}m</div>
        <div>Training Time</div>
      </div>
    `;
  }

  private updateBadges(): void {
    const badgesGrid = document.getElementById('badges-grid');
    if (!badgesGrid) return;

    const allBadges = this.badges.getAllBadges();
    const earnedBadges = this.badges.getEarnedBadges();
    
    badgesGrid.innerHTML = allBadges.map(badge => {
      const isEarned = earnedBadges.some(e => e.id === badge.id);
      return `
        <div class="badge ${isEarned ? 'earned' : ''}">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">${badge.icon}</div>
          <div style="font-weight: 600; margin-bottom: 0.25rem;">${badge.name}</div>
          <div style="font-size: 0.9rem; opacity: 0.8;">${badge.description}</div>
          ${isEarned ? `<div style="font-size: 0.8rem; margin-top: 0.5rem;">Earned ${new Date(badge.earnedAt!).toLocaleDateString()}</div>` : ''}
        </div>
      `;
    }).join('');
  }
}
