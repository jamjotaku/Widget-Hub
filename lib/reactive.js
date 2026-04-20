/**
 * Antigravity Framework Core: Reactive Property
 * シンプルな非 VDOM リアクティブ・プロパティの実装
 */
export class ReactiveProperty {
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = new Set();
  }

  get value() {
    return this._value;
  }

  set value(newValue) {
    if (this._value === newValue) return;
    this._value = newValue;
    this.notify();
  }

  subscribe(callback) {
    this._subscribers.add(callback);
    callback(this._value); // 初回実行
    return () => this._subscribers.delete(callback);
  }

  notify() {
    this._subscribers.forEach(callback => callback(this._value));
  }
}

/**
 * Antigravity Framework Core: BaseElement
 * Web Components + Reactive Property を統合したベースクラス
 */
export class BaseElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  /**
   * プロパティをリアクティブ化し、変更時に要素のコンテンツを更新する
   * @param {string} propName 
   * @param {ReactiveProperty} reactiveProp 
   * @param {Function} updateFn 
   */
  bind(propName, reactiveProp, updateFn) {
    reactiveProp.subscribe((val) => {
      updateFn.call(this, val);
    });
  }

  /**
   * シャドウドメイン内部のスタイルを定義
   */
  injectStyles(css) {
    const style = document.createElement('style');
    style.textContent = css;
    this.shadowRoot.appendChild(style);
  }

  /**
   * HTML テンプレートをレンダリング
   */
  render(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}
