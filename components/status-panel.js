import { BaseElement, ReactiveProperty } from '../lib/reactive.js';
import { WeatherManager } from '../lib/weather.js';

class StatusPanel extends BaseElement {
  constructor() {
    super();
    this.timeProp = new ReactiveProperty(this.getCurrentTime());
    this.dateProp = new ReactiveProperty(this.getCurrentDate());
    
    // 天気マネージャーの初期化 (環境変数問題を回避するため直接指定)
    this.weatherManager = new WeatherManager('4cd52c6f9b612fca2e1686208babe30d');
  }

  connectedCallback() {
    this.render(`
      <div class="status-container animate-fade-in">
        <div class="time-section">
          <div id="clock" class="glow-text-cyan">--:--:--</div>
          <div id="date" class="date-text">----/--/--</div>
        </div>
        <div class="weather-section">
          <img id="weather-icon" src="" alt="" style="display:none;">
          <div id="weather-info">
            <span id="temp">--</span>°C
            <div id="weather-desc">Loading...</div>
          </div>
        </div>
      </div>
    `);

    this.injectStyles(`
      :host {
        display: block;
        height: 100%;
        padding: 1.5rem;
        font-family: 'Orbitron', sans-serif;
      }
      .status-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;
      }
      .time-section {
        display: flex;
        flex-direction: column;
      }
      #clock {
        font-size: 3.5rem;
        font-weight: 700;
        letter-spacing: 2px;
        color: #00f3ff;
        text-shadow: 0 0 15px rgba(0, 243, 255, 0.5);
      }
      .date-text {
        font-size: 1.2rem;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'JetBrains Mono', monospace;
      }
      .weather-section {
        display: flex;
        align-items: center;
        gap: 1rem;
        background: rgba(255, 255, 255, 0.05);
        padding: 1rem 1.5rem;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }
      #weather-icon {
        width: 64px;
        height: 64px;
      }
      #temp {
        font-size: 2rem;
        font-weight: 700;
        color: #ffb800;
      }
      #weather-desc {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.6);
        font-family: 'Inter', sans-serif;
      }
    `);

    this.bind('time', this.timeProp, (val) => {
      const el = this.shadowRoot.getElementById('clock');
      if (el) el.textContent = val;
    });

    this.bind('date', this.dateProp, (val) => {
      const el = this.shadowRoot.getElementById('date');
      if (el) el.textContent = val;
    });

    this.bind('weather', this.weatherManager.weatherData, (val) => {
      const tempEl = this.shadowRoot.getElementById('temp');
      const descEl = this.shadowRoot.getElementById('weather-desc');
      const iconEl = this.shadowRoot.getElementById('weather-icon');
      
      if (tempEl) tempEl.textContent = val.temp;
      if (descEl) descEl.textContent = val.description;
      if (val.icon && iconEl) {
        iconEl.src = val.icon;
        iconEl.style.display = 'block';
      }
    });

    this.startTimers();
    this.weatherManager.startAutoUpdate();
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('ja-JP', { hour12: false });
  }

  getCurrentDate() {
    const now = new Date();
    return now.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' });
  }

  startTimers() {
    setInterval(() => {
      this.timeProp.value = this.getCurrentTime();
      if (new Date().getSeconds() === 0) {
        this.dateProp.value = this.getCurrentDate();
      }
    }, 1000);
  }
}

customElements.define('status-panel', StatusPanel);
