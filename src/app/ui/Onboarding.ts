import { Router } from '../router';
import { i18n } from '../../utils/i18n';

export class Onboarding {
  constructor(private router: Router) {}

  render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const screen = document.createElement('div');
    screen.id = 'onboarding-screen';
    screen.className = 'screen';
    screen.innerHTML = `
      <div class="container">
        <div style="text-align: center; color: white;">
          <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Welcome to GuardAI</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">
            AI-powered virtual self-defense trainer
          </p>
          
          <div style="max-width: 400px; margin: 0 auto;">
            <div style="margin-bottom: 2rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Your Goal:</label>
              <select id="goal-select" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: none; font-size: 1rem;">
                <option value="fitness">Fitness & Exercise</option>
                <option value="self-defense">Self-Defense Skills</option>
                <option value="stress-relief">Stress Relief</option>
              </select>
            </div>
            
            <div style="margin-bottom: 2rem;">
              <label style="display: block; margin-bottom: 0.5rem; font-weight: 600;">Experience Level:</label>
              <select id="level-select" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: none; font-size: 1rem;">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <button id="start-button" class="btn" style="font-size: 1.2rem; padding: 1rem 2rem; width: 100%;">
              Start Training
            </button>
          </div>
          
          <div style="margin-top: 3rem; padding: 1.5rem; background: rgba(255, 255, 255, 0.1); border-radius: 12px; backdrop-filter: blur(10px);">
            <h3 style="margin-bottom: 1rem;">Features:</h3>
            <ul style="list-style: none; text-align: left; max-width: 300px; margin: 0 auto;">
              <li style="margin-bottom: 0.5rem;">✨ Real-time pose detection</li>
              <li style="margin-bottom: 0.5rem;">🎯 Instant coaching feedback</li>
              <li style="margin-bottom: 0.5rem;">💪 Stress simulation training</li>
              <li style="margin-bottom: 0.5rem;">📊 Progress tracking</li>
              <li>🏆 Achievement badges</li>
            </ul>
          </div>
        </div>
      </div>
    `;

    app.appendChild(screen);

    // Add event listeners
    const startButton = screen.querySelector('#start-button') as HTMLButtonElement;
    startButton.addEventListener('click', () => {
      this.savePreferences();
      this.router.navigate('training');
    });
  }

  show(): void {
    // Onboarding is shown by default
  }

  private savePreferences(): void {
    const goalSelect = document.getElementById('goal-select') as HTMLSelectElement;
    const levelSelect = document.getElementById('level-select') as HTMLSelectElement;
    
    const preferences = {
      goal: goalSelect.value,
      level: levelSelect.value,
      onboardingCompleted: true
    };
    
    localStorage.setItem('guardai_preferences', JSON.stringify(preferences));
  }
}
