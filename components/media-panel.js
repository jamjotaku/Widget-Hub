import { BaseElement, ReactiveProperty } from '../lib/reactive.js';

class MediaPanel extends BaseElement {
  constructor() {
    super();
    this.mediaInfo = new ReactiveProperty({
      title: 'No Media Playing',
      artist: 'Waiting for signal...',
      album: '',
      artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
      viewerCount: 0,
      latestChat: null,
      mediaType: 'unknown'
    });
    
    this.localState = {
      currentTime: 0,
      duration: 0,
      isPaused: true,
      lastUpdate: 0,
      lastLiveConfirm: 0
    };
  }

  connectedCallback() {
    this.injectStyles(`
      :host {
        display: block;
        height: 100%;
        position: relative;
        overflow: hidden;
        border-right: 1px solid rgba(0, 243, 255, 0.1);
        --theme-accent: #00f3ff;
        --theme-glow: 0 0 10px #00f3ff;
      }
      :host([data-type="spotify"]) {
        --theme-accent: #1DB954;
        --theme-glow: 0 0 10px #1DB954;
      }
      :host([data-type="youtube-live"]) {
        --theme-accent: #ff3e3e;
        --theme-glow: 0 0 10px #ff3e3e;
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
        width: 100%;
        box-sizing: border-box;
        transition: all 0.5s ease;
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
        box-shadow: 0 30px 60px rgba(0,0,0,0.7), 0 0 30px rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.02);
        transition: aspect-ratio 0.5s ease;
      }
      #artwork {
        width: 100%;
        height: 100%;
        object-fit: contain;
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
        text-shadow: var(--theme-glow);
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
        color: rgba(255,255,255,0.6);
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
        background: var(--theme-accent);
        box-shadow: var(--theme-glow);
        border-radius: 3px;
        transition: width 0.3s linear;
      }
      .time-label {
        margin-top: 0.8rem;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        color: var(--theme-accent);
        opacity: 0.8;
        letter-spacing: 1px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .stats-row {
        display: none;
        align-items: center;
        gap: 20px;
      }
      .stats-row.visible {
        display: flex;
      }
      .live-badge {
        color: #ff3e3e;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(255, 62, 62, 0.5);
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.8rem;
        letter-spacing: 2px;
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
      .viewer-count {
        color: #ff3e3e;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        letter-spacing: 1px;
        opacity: 0.9;
      }
      .chat-overlay {
        position: absolute;
        bottom: 6rem;
        width: 80%;
        max-width: 400px;
        background: rgba(0, 243, 255, 0.05);
        border: 1px solid rgba(0, 243, 255, 0.2);
        padding: 0.8rem 1.2rem;
        border-radius: 8px;
        backdrop-filter: blur(10px);
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        pointer-events: none;
        z-index: 3;
        display: none;
      }
      .chat-overlay.visible {
        display: block;
        transform: translateY(0);
        opacity: 1;
      }
      .chat-author {
        color: #ffb800;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.7rem;
        margin-bottom: 4px;
        display: block;
      }
      .chat-message {
        color: #fff;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
      }
      .controls-hint {
        position: absolute;
        bottom: 2.5rem;
        z-index: 2;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 4px;
        color: var(--theme-accent);
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

    this.render(`
      <div class="media-container animate-fade-in">
        <div id="bg-artwork" class="artwork-bg"></div>
        <div class="overlay"></div>
        <div id="latest-chat" class="chat-overlay">
          <span class="chat-author" id="chat-author">USER</span>
          <div class="chat-message" id="chat-message">Comment loading...</div>
        </div>
        <div class="content">
          <div class="artwork-wrapper">
            <img id="artwork" src="${this.mediaInfo.value.artwork}">
          </div>
          <div class="title-container">
            <div id="title" data-title="${this.mediaInfo.value.title}">${this.mediaInfo.value.title}</div>
          </div>
          <p id="artist">${this.mediaInfo.value.artist}</p>
          <div class="playback-bar" id="playback-bar">
            <div id="progress" class="bar-inner" style="width: 0%"></div>
          </div>
          <div class="time-label">
            <div class="stats-row" id="stats-row">
              <div class="live-badge">
                <div class="pulse-dot"></div>
                LIVE
              </div>
              <div class="viewer-count" id="viewer-count">👁 0</div>
            </div>
            <span id="time-text">0:00 / 0:00</span>
          </div>
        </div>
        <div class="controls-hint" id="sync-status">REMOTE SYNC ACTIVE</div>
        <div id="debug-status" class="debug-info">v2.0-CHAMELEON | Waiting...</div>
      </div>
    `);

    this.bind('media', this.mediaInfo, (val) => {
      const titleEl = this.shadowRoot.getElementById('title');
      const artistEl = this.shadowRoot.getElementById('artist');
      const artworkEl = this.shadowRoot.getElementById('artwork');
      const bgArtworkEl = this.shadowRoot.getElementById('bg-artwork');
      const artworkWrapper = this.shadowRoot.querySelector('.artwork-wrapper');
      const viewerEl = this.shadowRoot.getElementById('viewer-count');
      const statsRow = this.shadowRoot.getElementById('stats-row');
      const playbackBar = this.shadowRoot.getElementById('playback-bar');
      const chatOverlay = this.shadowRoot.getElementById('latest-chat');
      const chatAuthor = this.shadowRoot.getElementById('chat-author');
      const chatMsg = this.shadowRoot.getElementById('chat-message');
      const syncStatus = this.shadowRoot.getElementById('sync-status');

      // テーマ切り替え
      this.setAttribute('data-type', val.mediaType);
      if (syncStatus) {
        syncStatus.textContent = val.mediaType.toUpperCase().replace('-', ' ') + ' SYNC ACTIVE';
      }

      // 基本情報更新
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

        // レイアウト比率の動的調整
        if (artworkWrapper) {
          artworkWrapper.style.aspectRatio = val.mediaType.startsWith('youtube') ? '16 / 9' : '1 / 1';
        }
      }

      // モード別表示制御
      const isLive = val.mediaType === 'youtube-live';
      if (statsRow) statsRow.classList.toggle('visible', isLive);
      if (playbackBar) playbackBar.classList.toggle('hidden', isLive);
      if (viewerEl) viewerEl.textContent = `👁 ${val.viewerCount.toLocaleString()}`;

      // チャット演出
      if (isLive && val.latestChat && val.latestChat.message) {
        const isNew = chatMsg.textContent !== val.latestChat.message;
        if (isNew) {
           chatAuthor.textContent = val.latestChat.author;
           chatMsg.textContent = val.latestChat.message;
           chatOverlay.classList.add('visible');
           if (this.chatTimeout) clearTimeout(this.chatTimeout);
           this.chatTimeout = setTimeout(() => {
             chatOverlay.classList.remove('visible');
           }, 7000);
        }
      } else {
        chatOverlay.classList.remove('visible');
      }
    });

    const updateUI = () => {
      const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      const progressEl = this.shadowRoot.getElementById('progress');
      const timeDisplay = this.shadowRoot.getElementById('time-text');
      const debugEl = this.shadowRoot.getElementById('debug-status');

      const isLive = this.getAttribute('data-type') === 'youtube-live';
      if (isLive) {
        if (progressEl) progressEl.style.width = '100%';
        if (timeDisplay) timeDisplay.textContent = formatTime(this.localState.currentTime);
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
      }
      if (debugEl) {
        debugEl.textContent = `v2.0-CHAMELEON | M:${this.getAttribute('data-type')} | T:${Math.floor(this.localState.currentTime)}`;
      }
    };

    setInterval(() => {
      if (!this.localState.isPaused && (this.localState.duration > 0 || this.getAttribute('data-type') === 'youtube-live')) {
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
        artwork: data.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
        viewerCount: data.viewerCount || 0,
        latestChat: data.liveStats || null,
        mediaType: data.mediaType || 'unknown'
      };

      this.localState.currentTime = data.currentTime;
      this.localState.duration = data.duration;
      this.localState.isPaused = data.isPaused;
      this.localState.lastUpdate = now;
      
      updateUI();
    });
  }
}

customElements.define('media-panel', MediaPanel);
