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
            <h1 id="title" class="glow-text-cyan">--</h1>
            <p id="artist">--</p>
            <div class="playback-bar">
              <div class="bar-inner" style="width: 35%;"></div>
            </div>
          </div>
        </div>

        <div class="controls-hint">
          <span>WEB MEDIA SESSION ACTIVE</span>
        </div>
      </div>
    `);

    this.injectStyles(`
      :host {
        display: block;
        height: 100%;
        position: relative;
        overflow: hidden;
      }
      .media-container {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        position: relative;
      }
      .artwork-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        filter: blur(40px) brightness(0.3);
        z-index: 0;
        transition: background-image 1s ease-in-out;
      }
      .overlay {
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at center, transparent, rgba(0,0,0,0.8));
        z-index: 1;
      }
      .content {
        position: relative;
        z-index: 2;
        text-align: center;
        width: 100%;
        max-width: 400px;
      }
      .artwork-wrapper {
        width: 280px;
        height: 280px;
        margin: 0 auto 2.5rem;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 20px rgba(0, 243, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      #artwork {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      #title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.8rem;
        margin-bottom: 0.5rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      #artist {
        font-size: 1.1rem;
        color: var(--text-dim);
        margin-bottom: 2rem;
      }
      .playback-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      .bar-inner {
        height: 100%;
        background: var(--accent-cyan);
        box-shadow: var(--glow-cyan);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      .controls-hint {
        position: absolute;
        bottom: 2rem;
        z-index: 2;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.7rem;
        letter-spacing: 4px;
        color: var(--accent-cyan);
        opacity: 0.5;
      }
    `);

    // バインド設定
    this.bind('media', this.mediaInfo, (val) => {
      this.shadowRoot.getElementById('title').textContent = val.title;
      this.shadowRoot.getElementById('artist').textContent = val.artist;
      this.shadowRoot.getElementById('artwork').src = val.artwork;
      this.shadowRoot.getElementById('bg-artwork').style.backgroundImage = `url(${val.artwork})`;
    });

    this.setupMediaSessionObserver();
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
