import './components/login-panel.js';
import './components/media-panel.js';
import './components/status-panel.js';
import './components/x-slideshow.js';
import './components/sidebar-nav.js';

// --- Supabase Config ---
const SUPABASE_URL = "https://jimefzcdtkpwhnhjuhts.supabase.co";
const SUPABASE_KEY = "sb_publishable_5Ea1XiOyx2xEOELour1bUw_35LpBqJH";
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// --- DOM Elements ---
const loginScreen = document.getElementById('login-screen');
const dashboard = document.getElementById('dashboard');
const drawer = document.getElementById('settings-drawer');
const trigger = document.getElementById('settings-trigger');
const closeBtn = document.getElementById('close-settings');
const speedInput = document.getElementById('slide-speed');
const speedValue = document.getElementById('speed-value');
const extensionStatus = document.getElementById('extension-status');

// --- Auth State Management ---
async function checkAuth() {
  if (!supabase) return;

  const { data: { session } } = await supabase.auth.getSession();
  const guestId = localStorage.getItem('supabase_user_id');

  if (session) {
    showDashboard(session.user);
  } else if (guestId) {
    // 同期 ID がある場合はゲストモードでダッシュボード表示
    showDashboard({ id: guestId, email: '6775657374@guest.local' }); // 'guest' in hex
  } else {
    showLogin();
  }
}

function showLogin() {
  // 高級感のあるビュー遷移 (Login画面へ)
  dashboard.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  
  // 全ドロワー・モーダルのクリーンアップ
  if (typeof closeDrawer === 'function') closeDrawer();

  // ログインパネルの初期化
  if (!loginScreen.querySelector('login-panel')) {
    loginScreen.innerHTML = '<login-panel></login-panel>';
  } else {
    const lp = loginScreen.querySelector('login-panel');
    if (lp.setError) lp.setError(''); // エラー表示のクリア
  }
}

function showDashboard(user) {
  // 高級感のあるビュー遷移 (Dashboardへ)
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  
  // 同期キー（UUID）を設定画面に表示
  const syncKeyDisplay = document.getElementById('sync-key-val');
  if (syncKeyDisplay) syncKeyDisplay.textContent = user.id;

  // 16進数から元のユーザー名を復元 (安全なフォールバック付き)
  let username = user.email.split('@')[0];
  try {
    const original = username.match(/.{1,2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
    if (original) username = original;
  } catch(e) { /* ignore if not hex */ }

  console.log(`[Auth] Logged in as: ${username}`);
  
  // 全コンポーネントにユーザーIDを通知
  window.dispatchEvent(new CustomEvent('auth-success', { detail: { 
    userId: user.id,
    username: username
  }}));

  // --- Supabase Realtime Media Sync ---
  // media_sync テーブルの更新を購読
  supabase
    .channel('media-changes')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: 'media_sync',
      filter: `user_id=eq.${user.id}` 
    }, (payload) => {
      console.log('[Realtime] Media update received:', payload.new);
      if (payload.new) {
        window.dispatchEvent(new CustomEvent('media-update', { 
          detail: {
            title: payload.new.title,
            artist: payload.new.artist,
            album: payload.new.album,
            artwork: payload.new.artwork,
            currentTime: payload.new.current_time,
            duration: payload.new.duration,
            isPaused: payload.new.is_paused,
            isLive: payload.new.is_live,
            mediaType: payload.new.media_type || 'unknown',
            viewerCount: payload.new.viewer_count || 0,
            liveStats: payload.new.live_stats || null
          } 
        }));
      }
    })
    .subscribe();
}

// 認証要求のハンドル
window.addEventListener('auth-request', async (e) => {
  const { type, email, password } = e.detail;
  const loginPanel = document.querySelector('login-panel');

  try {
    let result;
    if (type === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password });
    } else {
      result = await supabase.auth.signUp({ email, password });
    }

    if (result.error) throw result.error;
    showDashboard(result.data.user);
  } catch (err) {
    console.error('[Auth Error]', err.message);
    let msg = err.message;
    if (msg.includes('rate limit')) {
      msg = 'Rate limited. Please wait 1-2 minutes and try again.';
    }
    if (loginPanel) loginPanel.setError(msg);
  }
});

// ログアウト処理
const logoutBtn = document.getElementById('auth-logout');
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      closeDrawer();
      showLogin();
    }
  };
}

// --- Settings & UI Interaction ---
// Load saved settings
const savedSpeed = localStorage.getItem('hub_slide_speed') || '8';
if (speedInput) speedInput.value = savedSpeed;
if (speedValue) speedValue.textContent = `${savedSpeed}s`;

const closeDrawer = () => {
  if (drawer) drawer.classList.remove('open');
};

if (trigger && drawer) trigger.onclick = () => drawer.classList.add('open');
if (closeBtn) closeBtn.onclick = closeDrawer;

if (speedInput) {
  speedInput.oninput = (e) => {
    const val = e.target.value;
    if (speedValue) speedValue.textContent = `${val}s`;
    localStorage.setItem('hub_slide_speed', val);
    window.dispatchEvent(new CustomEvent('settings-update', { detail: { type: 'speed', value: val * 1000 } }));
  };
}

// フィルタ入力の連動
const catInput = document.getElementById('cat-input');
const tagsInput = document.getElementById('tags-input');

[catInput, tagsInput].forEach(el => {
  if (el) {
    const storageKey = el.id === 'cat-input' ? 'hub_filter_category' : 'hub_filter_tags';
    // 初回読み込み
    el.value = localStorage.getItem(storageKey) || '';
    
    el.onchange = () => { // select要素なのでonchangeを使用
      localStorage.setItem(storageKey, el.value);
      window.dispatchEvent(new CustomEvent('settings-update', { 
        detail: { 
          type: 'filters', 
          value: {
            category: catInput.value,
            tags: tagsInput.value
          }
        } 
      }));
    };
  }
});

// --- Extension Connectivity ---
window.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'MEDIA_UPDATE' || event.data.type === 'EXTENSION_READY')) {
    if (extensionStatus) {
      extensionStatus.textContent = 'Online';
      extensionStatus.className = 'status-online';
    }
    if (event.data.type === 'MEDIA_UPDATE') {
      window.dispatchEvent(new CustomEvent('media-update', { detail: event.data.data }));
    }
  }
});

// --- UI Filter Populating ---
window.addEventListener('filters-loaded', (e) => {
  const { categories, tags } = e.detail;
  const catSelect = document.getElementById('cat-input');
  const tagSelect = document.getElementById('tags-input');

  if (catSelect) {
    const currentVal = catSelect.value;
    catSelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      catSelect.appendChild(opt);
    });
    catSelect.value = currentVal;
  }

  if (tagSelect) {
    const currentVal = tagSelect.value;
    tagSelect.innerHTML = '<option value="">All Tags</option>';
    tags.forEach(tag => {
      const opt = document.createElement('option');
      opt.value = tag;
      opt.textContent = tag;
      tagSelect.appendChild(opt);
    });
    tagSelect.value = currentVal;
  }
});

// Init App
checkAuth();

// --- URL Parameter Auto-Sync ---
const urlParams = new URLSearchParams(window.location.search);
const syncId = urlParams.get('sync_id');
if (syncId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(syncId)) {
  localStorage.setItem('supabase_user_id', syncId);
  // URLからパラメータを取り除く
  window.history.replaceState({}, document.title, window.location.pathname);
  
  // ユーザーに通知（簡単なアラートまたはUI通知）
  setTimeout(() => {
    alert("連携完了！ブックマークとの同期キーを自動設定しました。");
    window.location.reload(); // 設定を反映させるためにリロード
  }, 500);
}

// PWA Install Prompt Handling
let deferredPrompt;
const installSection = document.getElementById('install-section');
const installBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
  // ブラウザのデフォルトプロンプトを抑制し、独自ボタンを表示
  e.preventDefault();
  deferredPrompt = e;
  if (installSection) installSection.style.display = 'block';
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] Install choice: ${outcome}`);
    deferredPrompt = null;
    if (installSection) installSection.style.display = 'none';
  });
}

window.addEventListener('appinstalled', () => {
  console.log('[PWA] App installed successfully');
  if (installSection) installSection.style.display = 'none';
});

// PWA Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => console.log('SW registered')).catch(err => console.log('SW failed', err));
  });
}
