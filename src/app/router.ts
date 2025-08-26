import { Onboarding } from './ui/Onboarding';
import { Training } from './ui/Training';
import { Progress } from './ui/Progress';
import { Settings } from './ui/Settings';

export class Router {
  private screens: Map<string, any> = new Map();
  private currentScreen: string = 'onboarding';

  constructor() {
    this.screens.set('onboarding', new Onboarding(this));
    this.screens.set('training', new Training(this));
    this.screens.set('progress', new Progress(this));
    this.screens.set('settings', new Settings(this));
  }

  init(): void {
    this.createNavigation();
    
    // Handle browser navigation
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
    
    // Initial route
    this.handleRoute();
  }

  navigate(screenName: string): void {
    if (this.screens.has(screenName)) {
      this.currentScreen = screenName;
      history.pushState({ screen: screenName }, '', `#${screenName}`);
      this.showScreen(screenName);
      this.updateNavigation();
    }
  }

  private handleRoute(): void {
    const hash = window.location.hash.substring(1) || 'onboarding';
    if (this.screens.has(hash)) {
      this.currentScreen = hash;
      this.showScreen(hash);
      this.updateNavigation();
    }
  }

  private showScreen(screenName: string): void {
    // Hide all screens
    this.screens.forEach((screen, name) => {
      const element = document.getElementById(`${name}-screen`);
      if (element) {
        element.classList.add('screen-hidden');
      }
    });

    // Show target screen
    const targetElement = document.getElementById(`${screenName}-screen`);
    if (targetElement) {
      targetElement.classList.remove('screen-hidden');
    }

    // Initialize screen
    const screen = this.screens.get(screenName);
    if (screen && typeof screen.show === 'function') {
      screen.show();
    }
  }

  private createNavigation(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // Create navigation
    const nav = document.createElement('nav');
    nav.className = 'nav';
    nav.innerHTML = `
      <div class="nav-items">
        <a href="#training" class="nav-item" data-screen="training">Train</a>
        <a href="#progress" class="nav-item" data-screen="progress">Progress</a>
        <a href="#settings" class="nav-item" data-screen="settings">Settings</a>
      </div>
    `;

    // Add click handlers
    nav.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const screenName = target.dataset.screen;
      if (screenName) {
        this.navigate(screenName);
      }
    });

    app.appendChild(nav);

    // Create screen containers
    this.screens.forEach((screen, name) => {
      screen.render();
    });
  }

  private updateNavigation(): void {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-screen') === this.currentScreen) {
        item.classList.add('active');
      }
    });
  }
}
