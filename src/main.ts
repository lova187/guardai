import './styles.css';
import { Router } from './app/router';
import { registerSW } from './pwa/registerSW';
import { i18n } from './utils/i18n';

class App {
  private router: Router;

  constructor() {
    this.router = new Router();
    this.init();
  }

  private async init(): Promise<void> {
    try {
      // Initialize i18n
      await i18n.init();
      
      // Register service worker
      await registerSW();
      
      // Start router
      this.router.init();
      
      // Hide loading
      const loading = document.getElementById('loading');
      if (loading) loading.style.display = 'none';
      
    } catch (error) {
      console.error('App initialization failed:', error);
      this.showError('Failed to initialize GuardAI. Please refresh the page.');
    }
  }

  private showError(message: string): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div class="error-screen">
          <h1>Error</h1>
          <p>${message}</p>
          <button onclick="location.reload()">Reload</button>
        </div>
      `;
    }
  }
}

// Start the app
new App();
