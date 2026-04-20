import { BaseElement, ReactiveProperty } from '../lib/reactive.js';
import { supabase } from '../lib/supabase.js';
import { XClient } from '../lib/x-client.js';

class XSlideshow extends BaseElement {
  constructor() {
    super();
    this.slides = new ReactiveProperty([]);
    this.currentIndex = new ReactiveProperty(0);
    this.xClient = new XClient();
    this.interval = 8000; // 8秒周期
  }

  async connectedCallback() {
    this.render(`
      <div class="slideshow-container">
        <div id="slide-wrapper"></div>
        <div class="overlay-gradient"></div>
        
        <div class="info-overlay animate-fade-in" id="info-box">
          <div class="user-info">
            <img id="user-icon" src="" alt="">
            <span id="user-name">--</span>
          </div>
          <p id="tweet-text">--</p>
        </div>
      </div>
    `);

    this.injectStyles(`
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
      .slideshow-container {
        width: 100%;
        height: 100%;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      #slide-wrapper {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0; left: 0;
      }
      .slide-img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        position: absolute;
        top: 0; left: 0;
        opacity: 0;
        transition: opacity 1.5s ease-in-out;
      }
      .slide-img.active {
        opacity: 1;
      }
      .overlay-gradient {
        position: absolute;
        bottom: 0; left: 0; width: 100%; height: 50%;
        background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4), transparent);
        z-index: 5;
        pointer-events: none;
      }
      .info-overlay {
        position: absolute;
        bottom: 3rem;
        left: 3rem;
        right: 3rem;
        z-index: 10;
        pointer-events: none;
      }
      .user-info {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
      }
      #user-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2px solid var(--accent-cyan);
      }
      #user-name {
        font-weight: 600;
        font-size: 1.2rem;
        color: var(--accent-cyan);
      }
      #tweet-text {
        font-size: 1.1rem;
        line-height: 1.6;
        color: var(--text-main);
        word-break: break-all;
        max-height: 6em;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }
    `);

    // バインド設定
    this.bind('index', this.currentIndex, (idx) => {
      this.updateSlide(idx);
    });

    // データの読み込み
    await this.initData();
  }

  async initData() {
    // 1. Supabase からブックマーク取得
    const { data: bookmarks } = await supabase.from('bookmarks').select('*').limit(10);
    
    let tweetIds = [];
    if (bookmarks && bookmarks.length > 0) {
      tweetIds = bookmarks.map(b => b.tweet_id || b.url);
    } else {
      // フォールバック用のデモデータ
      tweetIds = ['1872166946654941655', '1871146749873520935'];
    }

    // 2. vxtwitter API で情報取得
    const fetchedSlides = await this.xClient.fetchMultiple(tweetIds);
    
    // 画像があるものだけをスライド化
    const imageSlides = [];
    fetchedSlides.forEach(tweet => {
      tweet.media.forEach(imgUrl => {
        imageSlides.push({
          ...tweet,
          currentImg: imgUrl
        });
      });
    });

    if (imageSlides.length > 0) {
      this.slides.value = imageSlides;
      this.startSlideshow();
    }
  }

  startSlideshow() {
    this.updateSlide(0);
    setInterval(() => {
      this.currentIndex.value = (this.currentIndex.value + 1) % this.slides.value.length;
    }, this.interval);
  }

  updateSlide(idx) {
    const slides = this.slides.value;
    if (slides.length === 0) return;

    const current = slides[idx];
    const wrapper = this.shadowRoot.getElementById('slide-wrapper');
    const infoBox = this.shadowRoot.getElementById('info-box');

    // 画像の切り替え（フェード演出）
    const existingImgs = wrapper.querySelectorAll('.slide-img');
    existingImgs.forEach(img => img.classList.remove('active'));

    let imgElement = wrapper.querySelector(`[data-idx="${idx}"]`);
    if (!imgElement) {
      imgElement = document.createElement('img');
      imgElement.src = current.currentImg;
      imgElement.className = 'slide-img';
      imgElement.dataset.idx = idx;
      wrapper.appendChild(imgElement);
      // Wait for load to avoid flicker
      imgElement.onload = () => imgElement.classList.add('active');
    } else {
      imgElement.classList.add('active');
    }

    // テキスト情報の更新
    const textEl = this.shadowRoot.getElementById('tweet-text');
    const userEl = this.shadowRoot.getElementById('user-name');
    const iconEl = this.shadowRoot.getElementById('user-icon');

    // リセットアニメーション
    infoBox.style.animation = 'none';
    infoBox.offsetHeight; // reflow
    infoBox.style.animation = null;

    textEl.textContent = current.text;
    userEl.textContent = current.user;
    iconEl.src = current.userIcon;
  }
}

customElements.define('x-slideshow', XSlideshow);
