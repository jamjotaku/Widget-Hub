import { BaseElement } from '../lib/reactive.js';

class SidebarNav extends BaseElement {
  constructor() {
    super();
  }

  connectedCallback() {
    console.log('[SidebarNav] Connected');
    this.injectStyles(`
      :host {
        display: block;
        width: 80px;
        height: 100vh;
        background: rgba(5, 5, 5, 0.9);
        backdrop-filter: blur(30px);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2.5rem 0;
        z-index: 100;
      }
      
      .logo {
        width: 44px;
        height: 44px;
        background: linear-gradient(135deg, #00f3ff, #aa3bff);
        border-radius: 12px;
        margin-bottom: 4rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(0, 243, 255, 0.4);
      }

      .nav-items {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }

      .nav-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 14px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 1.6rem;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        background: transparent;
        border: none;
        outline: none;
      }

      .nav-item:hover {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.08);
        transform: scale(1.1);
        text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
      }

      .nav-item.active {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.15);
        box-shadow: inset 0 0 12px rgba(0, 243, 255, 0.2);
      }

      .nav-item.active::after {
        content: '';
        position: absolute;
        right: -10px;
        width: 4px;
        height: 20px;
        background: #00f3ff;
        border-radius: 4px;
        box-shadow: 0 0 15px #00f3ff;
      }

      .bottom-section {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      ion-icon {
        pointer-events: none; /* Let the container handle clicks */
      }
    `);

    this.render(`
      <div class="logo">
        <ion-icon name="flash" style="color: #fff; font-size: 1.6rem;"></ion-icon>
      </div>
      <nav class="nav-items">
        <button class="nav-item active" title="Dashboard">
          <ion-icon name="grid-outline"></ion-icon>
        </button>
        <button class="nav-item" title="Media Sync Status">
          <ion-icon name="radio-outline"></ion-icon>
        </button>
        <button class="nav-item" title="Slideshow Gallery">
          <ion-icon name="images-outline"></ion-icon>
        </button>
      </nav>
      <div class="bottom-section">
        <button class="nav-item" id="nav-settings" title="Open Settings">
          <ion-icon name="settings-outline"></ion-icon>
        </button>
      </div>
    `);

    const settingsBtn = this.shadowRoot.getElementById('nav-settings');
    if (settingsBtn) {
      settingsBtn.onclick = (e) => {
        console.log('[SidebarNav] Settings clicked');
        const trigger = document.getElementById('settings-trigger');
        if (trigger) {
          trigger.click();
        } else {
          // Fallback if trigger not found
          window.dispatchEvent(new CustomEvent('toggle-settings'));
        }
      };
    }
  }
}

customElements.define('sidebar-nav', SidebarNav);
