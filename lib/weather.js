import { ReactiveProperty } from './reactive.js';

/**
 * Weather Management logic
 */
export class WeatherManager {
  constructor(apiKey, city = 'Tokyo') {
    this.apiKey = apiKey;
    this.city = city;
    this.weatherData = new ReactiveProperty({
      temp: '--',
      description: 'Loading...',
      icon: ''
    });
  }

  async fetchWeather() {
    if (!this.apiKey) {
      console.warn('Weather API Key is missing');
      return;
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${this.city}&appid=${this.apiKey}&units=metric&lang=ja`
      );
      const data = await response.json();
      
      if (data.main) {
        this.weatherData.value = {
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
        };
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    }
  }

  startAutoUpdate(intervalMs = 1800000) { // Default 30 min
    this.fetchWeather();
    setInterval(() => this.fetchWeather(), intervalMs);
  }
}
