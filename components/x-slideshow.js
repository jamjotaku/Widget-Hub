/**
 * x-slideshow.js - セキュア・ランダム・カテゴリ対応スライドショー (Final Version)
 */
class XSlideshow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.images = [];
    this.currentIndex = 0;
    this.timer = null;
    this.speed = parseInt(localStorage.getItem('hub_slide_speed') || '8') * 1000;
    this.userId = null;
    this.filters = {
      category: localStorage.getItem('hub_filter_category') || '',
      tags: localStorage.getItem('hub_filter_tags') || ''
    };
  }

  connectedCallback() {
    this.render();
    
    // 認証成功イベントを待機
    window.addEventListener('auth-success', (e) => {
      this.userId = e.detail.userId;
      this.fetchImages();
      this.fetchFilterOptions(); // オプションの取得を追加
    });

    // 設定更新イベントを待機
    window.addEventListener('settings-update', (e) => {
      const { type, value } = e.detail;
      if (type === 'speed') {
        this.speed = value;
        this.startTimer();
      } else if (type === 'filters') {
        this.filters = { ...this.filters, ...value };
        localStorage.setItem('hub_filter_category', this.filters.category);
        localStorage.setItem('hub_filter_tags', this.filters.tags);
        this.fetchImages();
      }
    });
  }

  async fetchImages() {
    if (!this.userId || !window.supabase) return;

    // Supabase Client の初期化
    const SUPABASE_URL = "https://jimefzcdtkpwhnhjuhts.supabase.co";
    const SUPABASE_KEY = "sb_publishable_5Ea1XiOyx2xEOELour1bUw_35LpBqJH";
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
      let query = client
        .from('bookmarks')
        .select('*')
        .eq('owner_id', this.userId);

      if (this.filters.category) {
        query = query.ilike('folder', `%${this.filters.category}%`);
      }

      if (this.filters.tags) {
        const tagList = this.filters.tags.split(',').map(t => t.trim());
        tagList.forEach(tag => {
          query = query.ilike('tags', `%${tag}%`);
        });
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const mappedData = data.map(item => ({
          url: item.image_url,
          text: item.tweet_text || '',
          user: item.author_name || '',
          icon: item.author_icon || ''
        }));
        this.images = this.shuffleArray(mappedData);
        this.currentIndex = 0;
        this.updateUI();
        this.startTimer();
      } else {
        this.images = [];
        this.updateUI();
      }
    } catch (err) {
      console.error('[Slideshow] Fetch Error:', err);
    }
  }

  async fetchFilterOptions() {
    if (!this.userId || !window.supabase) return;
    const client = window.supabase.createClient(
      "https://jimefzcdtkpwhnhjuhts.supabase.co", 
      "sb_publishable_5Ea1XiOyx2xEOELour1bUw_35LpBqJH"
    );

    try {
      const { data, error } = await client
        .from('bookmarks')
        .select('folder, tags')
        .eq('owner_id', this.userId);

      if (error) throw error;

      // ユニークなカテゴリの抽出
      const categories = [...new Set(data.map(item => item.folder).filter(Boolean))];
      
      // ユニークなタグの抽出 (カンマ区切り対応)
      const tagSet = new Set();
      data.forEach(item => {
        if (item.tags) {
          item.tags.split(',').forEach(tag => {
            const trimmed = tag.trim();
            if (trimmed) tagSet.add(trimmed);
          });
        }
      });
      const tags = [...tagSet];

      // UIを更新するためのイベントを発行
      window.dispatchEvent(new CustomEvent('filters-loaded', {
        detail: { categories, tags }
      }));
    } catch (err) {
      console.error('[Slideshow] Filter fetching error:', err);
    }
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.next();
    }, this.speed);
  }

  next() {
    if (this.images.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateUI();
  }

  updateUI() {
    const container = this.shadowRoot.querySelector('.container');
    if (!container) return;

    const current = this.images[this.currentIndex];

    if (!current || !current.url) {
      // エンプティステートの描画
      container.innerHTML = `
        <div id="bg-blur"></div>
        <div class="empty-message">
          <ion-icon name="images-outline"></ion-icon>
          <p>No matching images found.<br><span style="font-size: 0.8rem; opacity: 0.7;">Sync your bookmarks from the archive site to get started.</span></p>
        </div>
      `;
      return;
    }

    // 通常の画像表示用の構造を復元（もしエンプティ表示から戻る場合）
    if (!this.shadowRoot.getElementById('slide-img')) {
      this.render();
    }

    const img = this.shadowRoot.getElementById('slide-img');
    const bg = this.shadowRoot.getElementById('bg-blur');
    const text = this.shadowRoot.getElementById('tweet-text');
    const userName = this.shadowRoot.getElementById('user-name');
    const userIcon = this.shadowRoot.getElementById('user-icon');

    // フェード演出を伴う更新
    img.style.opacity = '0';
    
    setTimeout(() => {
      img.src = current.url;
      bg.style.backgroundImage = `url(${current.url})`;
      text.textContent = current.text;
      userName.textContent = current.user;
      userIcon.src = current.icon || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png';
      
      img.onload = () => {
        img.style.opacity = '1';
      };
    }, 400);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          background: #000;
        }
        .container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }
        #bg-blur {
          position: absolute;
          inset: -30px;
          background-size: cover;
          background-position: center;
          filter: blur(50px) brightness(0.4);
          transition: background-image 1.2s ease-in-out;
          z-index: 1;
        }
        #slide-img {
          max-width: 95%;
          max-height: 95%;
          object-fit: contain;
          z-index: 2;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.9);
          transition: opacity 0.8s ease-in-out;
          opacity: 0;
        }
        .empty-message {
          z-index: 5;
          text-align: center;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 243, 255, 0.2);
          border-radius: 20px;
          max-width: 80%;
        }
        .empty-message ion-icon {
          font-size: 3rem;
          color: #00f3ff;
          margin-bottom: 1rem;
          opacity: 0.8;
        }
        .empty-message p {
          color: #fff;
          font-size: 1.1rem;
          margin: 0;
          line-height: 1.6;
        }
        .overlay-info {
          position: absolute;
          bottom: 2rem;
          left: 2rem;
          right: 2rem;
          z-index: 10;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          pointer-events: none;
        }
        .user {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          margin-bottom: 0.5rem;
        }
        #user-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }
        #user-name {
          font-weight: 700;
          color: #00f3ff;
          font-size: 0.9rem;
        }
        #tweet-text {
          font-size: 1rem;
          line-height: 1.5;
          opacity: 0.9;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      </style>
      <div class="container">
        <div id="bg-blur"></div>
        <img id="slide-img" src="" alt="Slideshow">
        <div class="overlay-info">
          <div class="user">
            <img id="user-icon" src="" alt="">
            <span id="user-name"></span>
          </div>
          <p id="tweet-text"></p>
        </div>
      </div>
    `;
  }
}

customElements.define('x-slideshow', XSlideshow);
