import { BaseElement, ReactiveProperty } from '../lib/reactive.js';
import { WeatherManager } from '../lib/weather.js';

class StatusPanel extends BaseElement {
  constructor() {
    super();
    this.timeProp = new ReactiveProperty(this.getCurrentTime());
    this.dateProp = new ReactiveProperty(this.getCurrentDate());
    
    // 天気マネージャーの初期化 (Keyは後で設定)
    const apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
    this.weatherManager = new WeatherManager(apiKey);
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
      }
      .date-text {
        font-size: 1.2rem;
        color: var(--text-dim);
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
      }
      #weather-icon {
        width: 64px;
        height: 64px;
      }
      #temp {
        font-size: 2rem;
        font-weight: 700;
        color: var(--accent-gold);
      }
      #weather-desc {
        font-size: 0.9rem;
        color: var(--text-dim);
        font-family: 'Inter', sans-serif;
      }
    `);

    // バインド設定
    this.bind('time', this.timeProp, (val) => {
      this.shadowRoot.getElementById('clock').textContent = val;
    });

    this.bind('date', this.dateProp, (val) => {
      this.shadowRoot.getElementById('date').textContent = val;
    });

    this.bind('weather', this.weatherManager.weatherData, (val) => {
      this.shadowRoot.getElementById('temp').textContent = val.temp;
      this.shadowRoot.getElementById('weather-desc').textContent = val.description;
      if (val.icon) {
        const img = this.shadowRoot.getElementById('weather-icon');
        img.src = val.icon;
        img.style.display = 'block';
      }
    });

    // タイマー開始
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
      // 日付も1分おきに更新チェック（不要かもしれないが念のため）
      if (new Date().getSeconds() === 0) {
        this.dateProp.value = this.getCurrentDate();
      }
    }, 1000);
  }
}

customElements.define('status-panel', StatusPanel);
