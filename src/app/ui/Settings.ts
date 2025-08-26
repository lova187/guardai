import { Router } from '../router';
import { i18n } from '../../utils/i18n';

export class Settings {
  constructor(private router: Router) {}

  render(): void {
    const app = document.getElementById('app');
    if (!app) return;

    const screen = document.createElement('div');
    screen.id = 'settings-screen';
    screen.className = 'screen screen-hidden';
    screen.innerHTML = `
      <div class="container">
        <div style="text-align: center; color: white; margin-bottom: 2rem;">
          <h1 style="font-size: 2rem; margin-bottom: 0.5rem;">Settings</h1>
          <p style="opacity: 0.8;">Customize your training experience</p>
        </div>
        
        <div style="max-width: 500px; margin: 0 auto;">
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">
            <h3 style="color: white; margin-bottom: 1rem;">Language</h3>
            <select id="language-select" style="width: 100%; padding: 0.75rem; border-radius: 8px; border: none; font-size: 1rem;">
              <option value="en">English</option>
              <option value="he">עברית (Hebrew)</option>
              <option value="ru">Русский (Russian)</option>
            </select>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">
            <h3 style="color: white; margin-bottom: 1rem;">Detection Sensitivity</h3>
            <input type="range" id="sensitivity-slider" min="0.3" max="0.9" step="0.1" value="0.6" style="width: 100%; margin-bottom: 0.5rem;">
            <div style="color: white; opacity: 0.8; text-align: center;" id="sensitivity-value">60%</div>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">
            <h3 style="color: white; margin-bottom: 1rem;">Audio Volume</h3>
            <input type="range" id="volume-slider" min="0" max="1" step="0.1" value="0.7" style="width: 100%; margin-bottom: 0.5rem;">
            <div style="color: white; opacity: 0.8; text-align: center;" id="volume-value">70%</div>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; backdrop-filter: blur(10px);">
            <h3 style="color: white; margin-bottom: 1rem;">Stress Simulation</h3>
            <label style="display: flex; align-items: center; color: white; cursor: pointer;">
              <input type="checkbox" id="stress-enabled" checked style="margin-right: 0.5rem; transform: scale(1.2);">
              Enable random commands during training
            </label>
          </div>
          
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; backdrop-filter: blur(10px);">
            <h3 style="color: white; margin-bottom: 1rem;">Privacy</h3>
            <div style="color: white; opacity: 0.8; font-size: 0.9rem; line-height: 1.5;">
              ✅ All pose detection runs on your device<br>
              ✅ No video is uploaded or stored<br>
              ✅ Progress data stays on your device<br>
              ✅ Works offline after first load
            </div>
          </div>
          
          <div style="text-align: center;">
            <button id="save-settings" class="btn">Save Settings</button>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 3rem; color: white; opacity: 0.6; font-size: 0.9rem;">
          GuardAI v1.0.0 • Built with ❤️ for self-defense training
        </div>
      </div>
    `;

    app.appendChild(screen);
    this.setupEventListeners();
  }

  show(): void {
    this.loadSettings();
  }

  private setupEventListeners(): void {
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;
    const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
    const stressEnabled = document.getElementById('stress-enabled') as HTMLInputElement;
    const saveButton = document.getElementById('save-settings') as HTMLButtonElement;
    
    const sensitivityValue = document.getElementById('sensitivity-value');
    const volumeValue = document.getElementById('volume-value');

    // Update display values
    sensitivitySlider.addEventListener('input', () => {
      if (sensitivityValue) {
        sensitivityValue.textContent = `${Math.round(parseFloat(sensitivitySlider.value) * 100)}%`;
      }
    });

    volumeSlider.addEventListener('input', () => {
      if (volumeValue) {
        volumeValue.textContent = `${Math.round(parseFloat(volumeSlider.value) * 100)}%`;
      }
    });

    saveButton.addEventListener('click', () => {
      this.saveSettings();
    });
  }

  private loadSettings(): void {
    const settings = this.getSettings();
    
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;
    const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
    const stressEnabled = document.getElementById('stress-enabled') as HTMLInputElement;
    
    languageSelect.value = settings.language;
    sensitivitySlider.value = settings.sensitivity.toString();
    volumeSlider.value = settings.volume.toString();
    stressEnabled.checked = settings.stressEnabled;
    
    // Update display values
    const sensitivityValue = document.getElementById('sensitivity-value');
    const volumeValue = document.getElementById('volume-value');
    
    if (sensitivityValue) {
      sensitivityValue.textContent = `${Math.round(settings.sensitivity * 100)}%`;
    }
    if (volumeValue) {
      volumeValue.textContent = `${Math.round(settings.volume * 100)}%`;
    }
  }

  private saveSettings(): void {
    const languageSelect = document.getElementById('language-select') as HTMLSelectElement;
    const sensitivitySlider = document.getElementById('sensitivity-slider') as HTMLInputElement;
    const volumeSlider = document.getElementById('volume-slider') as HTMLInputElement;
    const stressEnabled = document.getElementById('stress-enabled') as HTMLInputElement;
    
    const settings = {
      language: languageSelect.value,
      sensitivity: parseFloat(sensitivitySlider.value),
      volume: parseFloat(volumeSlider.value),
      stressEnabled: stressEnabled.checked
    };
    
    localStorage.setItem('guardai_settings', JSON.stringify(settings));
    
    // Apply language change
    if (settings.language !== i18n.getCurrentLanguage()) {
      i18n.setLanguage(settings.language);
      // In a full implementation, this would update all UI text
    }
    
    // Show confirmation
    const saveButton = document.getElementById('save-settings') as HTMLButtonElement;
    const originalText = saveButton.textContent;
    saveButton.textContent = 'Saved!';
    saveButton.style.background = '#00cc6a';
    
    setTimeout(() => {
      saveButton.textContent = originalText;
      saveButton.style.background = '';
    }, 2000);
  }

  private getSettings() {
    const defaultSettings = {
      language: 'en',
      sensitivity: 0.6,
      volume: 0.7,
      stressEnabled: true
    };
    
    const saved = localStorage.getItem('guardai_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  }
}
