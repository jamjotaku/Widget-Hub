import { BaseElement, ReactiveProperty } from '../lib/reactive.js';

class MediaPanel extends BaseElement {
  constructor() {
    super();
    this.mediaInfo = new ReactiveProperty({
      title: 'No Media Playing',
      artist: 'Waiting for signal...',
      album: '',
      artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop'
    });
  }

  connectedCallback() {
    this.render();
    this.injectStyles(`
      :host {
        display: block;
        height: 100%;
        position: relative;
        overflow: hidden;
        border-right: 1px solid rgba(0, 243, 255, 0.1);
      }
      .media-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 3rem;
        position: relative;
        background: #000;
      }
      .artwork-bg {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background-size: cover;
        background-position: center;
        filter: blur(50px) brightness(0.4);
        z-index: 0;
        transition: background-image 1.5s ease-in-out;
      }
      .overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: linear-gradient(135deg, rgba(0,0,0,0.8), transparent);
        z-index: 1;
      }
      .content {
        position: relative;
        z-index: 2;
        text-align: center;
        width: 100%;
        max-width: 440px;
      }
      .artwork-wrapper {
        width: 100%;
        max-width: 380px;
        aspect-ratio: 1 / 1;
        margin: 0 auto 3rem;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 30px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0, 243, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.02);
      }
      #artwork {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      .title-container {
        width: 100%;
        overflow: hidden;
        margin-bottom: 0.5rem;
        position: relative;
        white-space: nowrap;
      }
      #title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.8rem;
        display: inline-block;
        padding-right: 50px;
        color: #fff;
        text-shadow: var(--glow-cyan);
      }
      .marquee {
        animation: marquee 15s linear infinite;
        will-change: transform;
      }
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      #artist {
        font-size: 1.1rem;
        color: var(--text-dim);
        margin-bottom: 2.5rem;
        font-family: 'JetBrains Mono', monospace;
      }
      .playback-bar {
        width: 100%;
        height: 6px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
        overflow: hidden;
        transition: opacity 0.5s ease;
      }
      .playback-bar.hidden {
        opacity: 0;
        pointer-events: none;
      }
      .bar-inner {
        height: 100%;
        background: var(--accent-cyan);
        box-shadow: var(--glow-cyan);
        border-radius: 3px;
        transition: width 0.3s linear;
      }
      .time-label {
        margin-top: 0.8rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        color: var(--accent-cyan);
        opacity: 0.8;
        letter-spacing: 1px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
      }
      .live-badge {
        display: none;
        color: #ff3e3e;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 62, 62, 0.5);
        align-items: center;
        gap: 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.8rem;
        letter-spacing: 2px;
      }
      .live-badge.visible {
        display: flex;
      }
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #ff3e3e;
        border-radius: 50%;
        box-shadow: 0 0 10px #ff3e3e;
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 62, 62, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 62, 62, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 62, 62, 0); }
      }
      .controls-hint {
        position: absolute;
        bottom: 2.5rem;
        z-index: 2;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 4px;
        color: var(--accent-cyan);
        opacity: 0.4;
      }
      .debug-info {
        position: absolute;
        bottom: 5px;
        left: 10px;
        font-size: 10px;
        color: rgba(0, 243, 255, 0.3);
        font-family: 'JetBrains Mono', monospace;
        z-index: 10;
        pointer-events: none;
      }
    `);

    // バインド設定 (タイトル・アーティスト・アートワーク)
    this.bind('media', this.mediaInfo, (val) => {
      const titleEl = this.shadowRoot.getElementById('title');
      const artistEl = this.shadowRoot.getElementById('artist');
      const artworkEl = this.shadowRoot.getElementById('artwork');
      const bgArtworkEl = this.shadowRoot.getElementById('bg-artwork');
      const artworkWrapper = this.shadowRoot.querySelector('.artwork-wrapper');
      
      if (titleEl && titleEl.getAttribute('data-title') !== val.title) {
        titleEl.setAttribute('data-title', val.title);
        titleEl.textContent = val.title;
        if (artistEl) artistEl.textContent = val.artist;
        if (artworkEl) artworkEl.src = val.artwork;
        if (bgArtworkEl) bgArtworkEl.style.backgroundImage = `url(${val.artwork})`;

        setTimeout(() => {
          const containerWidth = titleEl.parentElement.offsetWidth;
          const textWidth = titleEl.scrollWidth;
          if (textWidth > containerWidth) {
            titleEl.textContent = val.title + '     ' + val.title;
            titleEl.classList.add('marquee');
          } else {
            titleEl.classList.remove('marquee');
          }
        }, 100);

        const isYoutube = val.artwork.includes('ytimg.com') || val.artwork.includes('i.ytimg.com');
        if (artworkWrapper) {
          artworkWrapper.style.aspectRatio = isYoutube ? '16 / 9' : '1 / 1';
        }
      }
    });

    this.localState = {
      currentTime: 0,
      duration: 0,
      isPaused: true,
      isLive: false,
      lastUpdate: 0
    };

    const updateUI = () => {
      const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      const progressEl = this.shadowRoot.getElementById('progress');
      const timeDisplay = this.shadowRoot.getElementById('time-text');
      const liveBadge = this.shadowRoot.querySelector('.live-badge');
      const playbackBar = this.shadowRoot.querySelector('.playback-bar');
      const debugEl = this.shadowRoot.getElementById('debug-status');

      if (this.localState.isLive) {
        if (progressEl) progressEl.style.width = '100%';
        if (timeDisplay) timeDisplay.textContent = formatTime(this.localState.currentTime);
        if (liveBadge) liveBadge.classList.add('visible');
        if (playbackBar) playbackBar.classList.add('hidden');
      } else {
        const progress = this.localState.duration > 0 ? (this.localState.currentTime / this.localState.duration) * 100 : 0;
        if (progressEl) progressEl.style.width = `${Math.min(progress, 100)}%`;
        if (timeDisplay) {
          if (this.localState.duration > 0) {
             timeDisplay.textContent = `${formatTime(this.localState.currentTime)} / ${formatTime(this.localState.duration)}`;
          } else {
             timeDisplay.textContent = formatTime(this.localState.currentTime);
          }
        }
        if (liveBadge) liveBadge.classList.remove('visible');
        if (playbackBar) playbackBar.classList.remove('hidden');
      }
      
      if (debugEl) {
        debugEl.textContent = `v1.2-beta | L:${this.localState.isLive} | D:${Math.floor(this.localState.duration)}`;
      }
    };

    // 自律更新ループ
    setInterval(() => {
      if (!this.localState.isPaused && (this.localState.duration > 0 || this.localState.isLive)) {
        const now = Date.now();
        const delta = (now - this.localState.lastUpdate) / 1000;
        if (delta > 0 && delta < 2) {
          this.localState.currentTime += delta;
          this.localState.lastUpdate = now;
          updateUI();
        }
      }
    }, 100);
    
    window.addEventListener('media-update', (e) => {
      const data = e.detail;
      const now = Date.now();
      
      this.mediaInfo.value = {
        title: data.title || 'No Title',
        artist: data.artist || 'Unknown Artist',
        album: data.album || '',
        artwork: data.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop'
      };

      const title = (data.title || '').toLowerCase();
      const hasLiveKeyword = title.includes('live') || title.includes('生放送') || title.includes('配信');
      
      this.localState.currentTime = data.currentTime;
      this.localState.duration = data.duration;
      this.localState.isPaused = data.isPaused;
      this.localState.isLive = data.isLive === true || data.duration === Infinity || (hasLiveKeyword && data.duration > 3000);
      this.localState.lastUpdate = now;
      
      updateUI();
    });
  }

  render() {
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(this.style);
    
    const container = document.createElement('div');
    container.innerHTML = `
      <div class="media-container animate-fade-in">
        <div id="bg-artwork" class="artwork-bg"></div>
        <div class="overlay"></div>
        <div class="content">
          <div class="artwork-wrapper">
            <img id="artwork" src="${this.mediaInfo.value.artwork}">
          </div>
          <div class="title-container">
            <div id="title" data-title="${this.mediaInfo.value.title}">${this.mediaInfo.value.title}</div>
          </div>
          <p id="artist">${this.mediaInfo.value.artist}</p>
          <div class="playback-bar">
            <div id="progress" class="bar-inner" style="width: 0%"></div>
          </div>
          <div class="time-label">
            <div class="live-badge">
              <div class="pulse-dot"></div>
              LIVE
            </div>
            <span id="time-text">0:00 / 0:00</span>
          </div>
        </div>
        <div class="controls-hint">REMOTE SYNC ACTIVE</div>
        <div id="debug-status" class="debug-info">v1.2-beta | Waiting...</div>
      </div>
    `;
    this.shadowRoot.appendChild(container);
  }
}

customElements.define('media-panel', MediaPanel);
