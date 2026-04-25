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
      mediaType: 'unknown',
      isLive: false
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
        text-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
        font-weight: 700;
        letter-spacing: 1px;
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
        gap: 15px;
        margin: 0.5rem 0;
      }
      .stats-row.visible {
        display: flex;
        justify-content: center;
      }
      .live-badge {
        color: #ff3e3e;
        font-weight: 700;
        text-shadow: 0 0 12px rgba(255, 62, 62, 0.6);
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Orbitron', sans-serif;
        font-size: 0.85rem;
        letter-spacing: 2px;
        background: rgba(255, 62, 62, 0.1);
        padding: 4px 12px;
        border-radius: 20px;
        border: 1px solid rgba(255, 62, 62, 0.3);
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
        bottom: 6.5rem;
        width: 85%;
        max-width: 420px;
        background: rgba(20, 20, 25, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem 1.4rem;
        border-radius: 16px;
        backdrop-filter: blur(25px);
        transform: translateY(20px) scale(0.95);
        opacity: 0;
        transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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
        <div id="debug-status" class="debug-info">v2.7-STABLE | Waiting...</div>
        <!-- FORCE_UPDATE_HASH: 2026-04-25T16:45:00Z - This is a large dummy comment to ensure the build hash changes and bypasses any stubborn browser or service worker caches. 1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ -->
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

      // モード判定
      // data.isLive, data.is_live, mediaType === 'youtube-live' のいずれかが真ならライブとみなす
      const isLive = !!(val.isLive || val.is_live || val.mediaType === 'youtube-live');
      
      console.log(`[MediaPanel] UI Update - isLive: ${isLive}, mediaType: ${val.mediaType}`);
      
      this.setAttribute('data-is-live', isLive); // CSSセレクタ用

      // テーマ切り替え
      // Liveの場合は強制的にyoutube-liveテーマ（赤）を適用
      const themeType = isLive ? 'youtube-live' : val.mediaType;
      this.setAttribute('data-type', themeType);
      
      if (syncStatus) {
        syncStatus.textContent = themeType.toUpperCase().replace('-', ' ') + ' SYNC ACTIVE';
      }

      // 基本情報更新
      if (titleEl) {
        const isTitleChanged = titleEl.getAttribute('data-title') !== val.title;
        if (isTitleChanged) {
          titleEl.setAttribute('data-title', val.title);
          titleEl.textContent = val.title;
          
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
        }
      }
      
      if (artistEl) artistEl.textContent = val.artist;
      if (artworkEl && artworkEl.src !== val.artwork) artworkEl.src = val.artwork;
      if (bgArtworkEl) bgArtworkEl.style.backgroundImage = `url(${val.artwork})`;

      // レイアウト比率の動的調整
      if (artworkWrapper) {
        artworkWrapper.style.aspectRatio = val.mediaType.startsWith('youtube') ? '16 / 9' : '1 / 1';
      }

      // モード別表示制御
      if (statsRow) statsRow.classList.toggle('visible', isLive);
      if (playbackBar) playbackBar.classList.toggle('hidden', isLive);
      
      const timeDisplay = this.shadowRoot.getElementById('time-text');
      if (timeDisplay) {
        timeDisplay.style.display = isLive ? 'none' : 'block';
      }
      if (playbackBar) {
        playbackBar.style.display = isLive ? 'none' : 'block';
      }

      if (viewerEl) {
        const count = typeof val.viewerCount === 'number' ? val.viewerCount : 0;
        if (count > 0) {
          viewerEl.textContent = `👁 ${count.toLocaleString()}`;
          this.lastViewerCount = count;
        } else if (this.lastViewerCount) {
          viewerEl.textContent = `👁 ${this.lastViewerCount.toLocaleString()}`;
        } else {
          viewerEl.textContent = `👁 ---`;
        }
      }

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

      const isLive = this.getAttribute('data-is-live') === 'true';

      if (isLive) {
        if (progressEl) {
          progressEl.style.width = '100%';
          progressEl.style.display = 'none'; // ライブ時は進捗バーも隠す（または別の見せ方にする）
        }
        if (timeDisplay) {
          timeDisplay.style.display = 'none';
        }
      } else {
        const progress = this.localState.duration > 0 ? (this.localState.currentTime / this.localState.duration) * 100 : 0;
        if (progressEl) progressEl.style.width = `${Math.min(progress, 100)}%`;
        if (timeDisplay) {
          timeDisplay.style.display = 'block';
          if (this.localState.duration > 0) {
             timeDisplay.textContent = `${formatTime(this.localState.currentTime)} / ${formatTime(this.localState.duration)}`;
          } else {
             timeDisplay.textContent = formatTime(this.localState.currentTime);
          }
        }
        if (progressEl) progressEl.style.display = 'block';
      }
      if (debugEl) {
        debugEl.textContent = `v2.7-STABLE | M:${this.getAttribute('data-type')} | L:${this.getAttribute('data-is-live')} | T:${Math.floor(this.localState.currentTime)}`;
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
      if (!data) return;
      
      const now = Date.now();
      
      const isLiveFromServer = !!(data.isLive || data.is_live);
      const isVideoExplicit = data.mediaType === 'youtube-video' || data.mediaType === 'spotify';
      
      // フォールバック判定：サーバーからのフラグがなくても、YouTubeの特有の挙動からライブを推測する
      const timeDiff = (data.duration || 0) - (data.currentTime || 0);
      // 残り1時間かつ視聴者がいる場合
      const isSuspiciousYouTube = (data.mediaType === 'unknown' || !data.mediaType) && 
                                  (data.duration > 3600) && 
                                  (Math.abs(timeDiff - 3600) < 30) &&
                                  (data.viewerCount > 0);

      // 判定の安定化（フリッカ防止）:
      // タイトルが変わった場合は即座に状態を切り替える
      const isTitleChanged = data.title !== this.mediaInfo.value.title;
      
      // 動画であることが明示されている場合はライブ判定を強制的にfalseにする
      const nextLiveState = isVideoExplicit ? false : (isLiveFromServer || data.mediaType === 'youtube-live' || isSuspiciousYouTube);
      
      // タイトルが変わっていない場合、頻繁なライブ状態の切り替えを抑制する（2秒間のクールダウン）
      const now_ts = Date.now();
      let isLive = nextLiveState;
      if (!isTitleChanged && this.lastStateChange && (now_ts - this.lastStateChange < 2000)) {
        isLive = this.mediaInfo.value.isLive; // 前の状態を維持
      } else if (isLive !== this.mediaInfo.value.isLive) {
        this.lastStateChange = now_ts;
      }
      
      console.log('[MediaPanel] Update received:', { 
        isLive, 
        mediaType: data.mediaType, 
        title: data.title,
        isTitleChanged
      });

      this.mediaInfo.value = {
        title: data.title || 'No Title',
        artist: data.artist || 'Unknown Artist',
        album: data.album || '',
        artwork: data.artwork || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
        viewerCount: data.viewerCount || 0,
        latestChat: data.liveStats || null,
        mediaType: data.mediaType || 'unknown',
        isLive: isLive
      };

      // ライブでなくなった場合は視聴者数バッファをリセット
      if (!isLive) {
        this.lastViewerCount = 0;
      }

      this.localState.currentTime = typeof data.currentTime === 'number' ? data.currentTime : 0;
      this.localState.duration = typeof data.duration === 'number' ? data.duration : 0;
      this.localState.isPaused = !!data.isPaused;
      this.localState.lastUpdate = now;
      
      // 属性を即時更新（これで updateUI がこの値を参照する）
      this.setAttribute('data-is-live', isLive);
      this.setAttribute('data-type', isLive ? 'youtube-live' : (data.mediaType || 'unknown'));
      
      updateUI();
    });
  }
}

customElements.define('media-panel', MediaPanel);
