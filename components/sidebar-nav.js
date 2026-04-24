import { BaseElement } from '../lib/reactive.js';

class SidebarNav extends BaseElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.injectStyles(`
      :host {
        display: block;
        width: 80px;
        height: 100vh;
        background: rgba(5, 5, 5, 0.8);
        backdrop-filter: blur(20px);
        border-right: 1px solid rgba(0, 243, 255, 0.1);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem 0;
        z-index: 100;
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .logo {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #00f3ff, #aa3bff);
        border-radius: 10px;
        margin-bottom: 3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 15px rgba(0, 243, 255, 0.4);
      }

      .nav-items {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .nav-item {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
      }

      .nav-item:hover {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.05);
        text-shadow: 0 0 10px rgba(0, 243, 255, 0.5);
      }

      .nav-item.active {
        color: #00f3ff;
        background: rgba(0, 243, 255, 0.1);
        box-shadow: inset 0 0 10px rgba(0, 243, 255, 0.1);
      }

      .nav-item.active::before {
        content: '';
        position: absolute;
        left: -15px;
        width: 4px;
        height: 20px;
        background: #00f3ff;
        border-radius: 0 4px 4px 0;
        box-shadow: 0 0 10px #00f3ff;
      }

      .bottom-section {
        margin-top: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      ion-icon {
        --ionicon-stroke-width: 32px;
      }
    `);

    this.render(`
      <div class="logo">
        <ion-icon name="flash" style="color: #fff; font-size: 1.5rem;"></ion-icon>
      </div>
      <nav class="nav-items">
        <div class="nav-item active" title="Dashboard">
          <ion-icon name="grid-outline"></ion-icon>
        </div>
        <div class="nav-item" title="Media Library">
          <ion-icon name="play-circle-outline"></ion-icon>
        </div>
        <div class="nav-item" title="Analytics">
          <ion-icon name="stats-chart-outline"></ion-icon>
        </div>
        <div class="nav-item" title="Messages">
          <ion-icon name="chatbubbles-outline"></ion-icon>
        </div>
      </nav>
      <div class="bottom-section">
        <div class="nav-item" id="nav-settings">
          <ion-icon name="settings-outline"></ion-icon>
        </div>
      </div>
    `);

    this.shadowRoot.getElementById('nav-settings').onclick = () => {
      document.getElementById('settings-trigger').click();
    };
  }
}

customElements.define('sidebar-nav', SidebarNav);
