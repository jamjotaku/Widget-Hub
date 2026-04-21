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
    this.render(`
      <div class="media-container animate-fade-in">
        <div id="bg-artwork" class="artwork-bg"></div>
        <div class="overlay"></div>
        
        <div class="content">
          <div class="artwork-wrapper">
            <img id="artwork" src="" alt="Artwork">
          </div>
          <div class="info">
            <div class="title-container">
              <h1 id="title" class="glow-text-cyan">--</h1>
            </div>
            <p id="artist">--</p>
            <div class="playback-bar">
              <div id="progress" class="bar-inner" style="width: 0%;"></div>
            </div>
            <div id="time-display" class="time-label">
              <div class="live-badge">
                <div class="pulse-dot"></div>
                LIVE
              </div>
              <span id="time-text">0:00 / 0:00</span>
            </div>
          </div>
        </div>

        <div class="controls-hint">
          <span>WEB MEDIA BRIDGE ACTIVE</span>
        </div>
      </div>
    `);

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
        max-width: 440px; /* 左側枠内で収めるための最大幅 */
      }
      .artwork-wrapper {
        width: 100%;
        max-width: 380px;
        aspect-ratio: 1 / 1; /* デフォルト正方形 */
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
        object-fit: contain; /* 横長画像でも全体を表示 */
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
        padding-right: 50px; /* 流れる際の間隔 */
      }
      .marquee {
        animation: marquee 15s linear infinite;
        will-change: transform; /* GPUアクセラレーション */
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
      }
      .bar-inner {
        height: 100%;
        background: var(--accent-cyan);
        box-shadow: var(--glow-cyan);
        border-radius: 3px;
        transition: width 0.3s linear; /* なめらかな同期 */
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
      /* LIVE Badge Styles */
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
        animation: fadeIn 0.5s ease forwards;
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
    `);

    // バインド設定
    this.bind('media', this.mediaInfo, (val) => {
      const titleEl = this.shadowRoot.getElementById('title');
      const artistEl = this.shadowRoot.getElementById('artist');
      const artworkWrapper = this.shadowRoot.querySelector('.artwork-wrapper');
      
      // 曲名が実際に変わった時だけ DOM を更新
      if (titleEl.getAttribute('data-title') !== val.title) {
        titleEl.setAttribute('data-title', val.title);
        titleEl.textContent = val.title;
        artistEl.textContent = val.artist;
        this.shadowRoot.getElementById('artwork').src = val.artwork;
        this.shadowRoot.getElementById('bg-artwork').style.backgroundImage = `url(${val.artwork})`;

        // タイトルが長いかチェックしてスクロール開始
        setTimeout(() => {
          const containerWidth = titleEl.parentElement.offsetWidth;
          const textWidth = titleEl.scrollWidth;
          if (textWidth > containerWidth) {
            titleEl.textContent = val.title + '     ' + val.title; // リピート表示
            titleEl.classList.add('marquee');
          } else {
            titleEl.classList.remove('marquee');
          }
        }, 100);

        // 画像比率への対応 (YouTubeサムネなら横長っぽく見せる)
        const isYoutube = val.artwork.includes('ytimg.com') || val.artwork.includes('i.ytimg.com');
        if (isYoutube) {
          artworkWrapper.style.aspectRatio = '16 / 9';
        } else {
          artworkWrapper.style.aspectRatio = '1 / 1';
        }
      }
    });

    // 内部状態の管理
    this.localState = {
      currentTime: 0,
      duration: 0,
      isPaused: true,
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

      if (this.localState.isLive) {
        if (progressEl) progressEl.style.width = '100%';
        if (timeDisplay) timeDisplay.textContent = formatTime(this.localState.currentTime);
        liveBadge.classList.add('visible');
        playbackBar.classList.add('hidden');
      } else if (this.localState.duration > 0) {
        const progress = (this.localState.currentTime / this.localState.duration) * 100;
        if (progressEl) progressEl.style.width = `${Math.min(progress, 100)}%`;
        if (timeDisplay) {
          timeDisplay.textContent = `${formatTime(this.localState.currentTime)} / ${formatTime(this.localState.duration)}`;
        }
        liveBadge.classList.remove('visible');
        playbackBar.classList.remove('hidden');
      }
    };

    // 自律更新ループ (100ms ごとに滑らかに補間)
    setInterval(() => {
      if (!this.localState.isPaused && (this.localState.duration > 0 || this.localState.isLive)) {
        const now = Date.now();
        const delta = (now - this.localState.lastUpdate) / 1000;
        if (delta > 0 && delta < 2) { // 異常なジャンプを防止
          this.localState.currentTime += delta;
          this.localState.lastUpdate = now;
          updateUI();
        }
      }
    }, 100);
    
    // 拡張機能からのカスタムイベントを監視
    window.addEventListener('media-update', (e) => {
      const data = e.detail;
      const now = Date.now();
      
      // 基本情報の更新
      this.mediaInfo.value = {
        title: data.title || 'No Title',
        artist: data.artist || 'Unknown Artist',
        album: data.album || '',
        artwork: data.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop'
      };

      // 内部状態を新しいもので上書き（同期）
      this.localState.currentTime = data.currentTime;
      this.localState.duration = data.duration;
      this.localState.isPaused = data.isPaused;
      this.localState.isLive = data.isLive || data.duration === Infinity; // LIVE判定
      this.localState.lastUpdate = now;
      
      updateUI();
    });
  }

  setupMediaSessionObserver() {
    // Media Session API の更新を検知
    // 注: PWA単体では他タブの情報を取得できないが、APIの仕様に従いハンドラをセット
    if ('mediaSession' in navigator) {
      const updateMetadata = () => {
        const metadata = navigator.mediaSession.metadata;
        if (metadata) {
          this.mediaInfo.value = {
            title: metadata.title || 'Unknown Title',
            artist: metadata.artist || 'Unknown Artist',
            album: metadata.album || '',
            artwork: metadata.artwork && metadata.artwork.length > 0 
              ? metadata.artwork[metadata.artwork.length - 1].src 
              : this.mediaInfo.value.artwork
          };
        }
      };

      // 定期的にチェック (ブラウザ制限によりイベント駆動が難しいため)
      setInterval(updateMetadata, 2000);
      
      // 初回実行
      updateMetadata();
    } else {
      console.warn('Media Session API not supported');
    }
  }
}

customElements.define('media-panel', MediaPanel);
