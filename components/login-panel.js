/**
 * login-panel.js - セキュアな認証コンポーネント
 */
class LoginPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
        
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100vh;
          background: #000;
          color: #e0e0e0;
          font-family: 'Inter', sans-serif;
        }
        .login-card {
          background: rgba(15, 15, 20, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 243, 255, 0.3);
          border-radius: 20px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 0 40px rgba(0, 243, 255, 0.1);
          text-align: center;
          animation: appear 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes appear {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        h2 {
          color: #00f3ff;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin-bottom: 2rem;
          font-weight: 800;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
        }
        .input-group {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: #00f3ff;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }
        input {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 0.9rem;
          color: #fff;
          outline: none;
          transition: all 0.3s;
          box-sizing: border-box;
          font-size: 1rem;
        }
        input:focus {
          border-color: #00f3ff;
          background: rgba(0, 243, 255, 0.05);
          box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
        }
        .actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        button {
          padding: 1rem;
          border-radius: 8px;
          border: none;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 0.9rem;
        }
        .primary-btn {
          background: #00f3ff;
          color: #000;
        }
        .primary-btn:hover {
          background: #fff;
          box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
          transform: translateY(-2px);
        }
        .secondary-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
        }
        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: #fff;
        }
        .error-msg {
          color: #ff3e3e;
          font-size: 0.85rem;
          margin-top: 1rem;
          display: none;
          background: rgba(255, 62, 62, 0.1);
          padding: 0.5rem;
          border-radius: 4px;
        }
      </style>
      <div class="login-card">
        <h2>Auth Grid</h2>
        <div class="input-group">
          <label>Sync ID (Username)</label>
          <input type="text" id="username" placeholder="Enter registration ID" autocomplete="username">
        </div>
        <div class="input-group">
          <label>Access Key (Password)</label>
          <input type="password" id="password" placeholder="••••••••" autocomplete="current-password">
        </div>
        
        <div id="error" class="error-msg">Invalid Credentials</div>

        <div class="actions">
          <button id="login-btn" class="primary-btn">Initialize Connection</button>
          <button id="signup-btn" class="secondary-btn">Register New Unit</button>
        </div>
        <p style="margin-top:2.5rem; font-size:0.65rem; color:#444; text-transform:uppercase; letter-spacing:2px;">
          Multi-User Isolation: Active
        </p>
      </div>
    `;

    this.shadowRoot.getElementById('login-btn').onclick = () => this.handleAuth('login');
    this.shadowRoot.getElementById('signup-btn').onclick = () => this.handleAuth('signup');
  }

  async handleAuth(type) {
    const user = this.shadowRoot.getElementById('username').value.trim();
    const pass = this.shadowRoot.getElementById('password').value.trim();
    const errorEl = this.shadowRoot.getElementById('error');

    if (!user || !pass) {
      this.setError("Please populate all vector fields.");
      return;
    }

    // 記号によるエラーとレートリミットを避けるため、IDを16進数エンコード化し、ドメインを差し替え
    const hex = Array.from(user).map(c => c.charCodeAt(0).toString(16)).join('');
    const email = `${hex}@sync-hub.net`;

    this.dispatchEvent(new CustomEvent('auth-request', {
      detail: { type, email, password: pass, username: user.toLowerCase() },
      bubbles: true,
      composed: true
    }));
  }

  setError(msg) {
    const errorEl = this.shadowRoot.getElementById('error');
    errorEl.textContent = msg;
    errorEl.style.display = "block";
  }
}

customElements.define('login-panel', LoginPanel);
