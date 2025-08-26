import './styles.css';

console.log('GuardAI loading...');

class App {
  constructor() {
    this.init();
  }

  private init(): void {
    try {
      // Hide loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        setTimeout(() => {
          loading.style.display = 'none';
        }, 1000);
      }

      // Show welcome message
      this.showWelcome();
      
    } catch (error) {
      console.error('App initialization failed:', error);
      this.showError('Failed to initialize GuardAI. Please refresh the page.');
    }
  }

  private showWelcome(): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="text-align: center; color: white; padding: 50px;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">Welcome to GuardAI</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem;">AI-powered virtual self-defense trainer</p>
          <p>Coming Soon...</p>
        </div>
      `;
    }
  }

  private showError(message: string): void {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = `
        <div style="text-align: center; color: white; padding: 50px;">
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
new App();
