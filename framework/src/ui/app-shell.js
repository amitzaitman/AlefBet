/**
 * מעטפת אפליקציה רב-לשונית — כותרת, ניווט טאבים, ניווט תחתון לנייד
 *
 * @param {HTMLElement} container
 * @param {object} config
 * @param {string} config.title
 * @param {string} [config.subtitle]
 * @param {Array<{id: string, label: string, icon: string}>} config.tabs
 * @param {string} [config.homeUrl]
 * @param {Function} [config.onTabChange]
 * @returns {{ contentEl: HTMLElement, setSubtitle(text): void, setActiveTab(tabId): void }}
 */
import { LitElement, html } from 'lit';

class AbAppShell extends LitElement {
  static properties = {
    title:      { type: String },
    subtitle:   { type: String },
    tabs:       { type: Array },
    homeUrl:    { type: String },
    _activeTab: { state: true },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.title = '';
    this.subtitle = '';
    this.tabs = [];
    this.homeUrl = null;
    this._activeTab = null;
    this._onTabChange = null;
  }

  _handleTabClick(tabId) {
    this._activeTab = tabId;
    this._onTabChange?.(tabId);
  }

  render() {
    const { title, subtitle, tabs, homeUrl, _activeTab } = this;
    return html`
      <header class="ab-app-header">
        <div class="ab-app-header-text">
          <h1 class="ab-app-title">${title}</h1>
          <span class="ab-app-subtitle">${subtitle}</span>
        </div>
        ${homeUrl ? html`<a href=${homeUrl} class="ab-app-back-link" aria-label="דף הבית">🏠</a>` : ''}
      </header>
      <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
        ${tabs.map(tab => html`
          <button
            class=${'ab-app-tab' + (_activeTab === tab.id ? ' ab-active' : '')}
            data-tab=${tab.id}
            aria-selected=${_activeTab === tab.id ? 'true' : 'false'}
            role="tab"
            @click=${() => this._handleTabClick(tab.id)}
          >
            <span class="ab-app-tab-icon">${tab.icon}</span>
            <span class="ab-app-tab-label">${tab.label}</span>
          </button>
        `)}
      </nav>
      <main class="ab-app-content"></main>
      <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
        ${tabs.map(tab => html`
          <button
            class=${'ab-app-nav-item' + (_activeTab === tab.id ? ' ab-active' : '')}
            data-tab=${tab.id}
            aria-selected=${_activeTab === tab.id ? 'true' : 'false'}
            role="tab"
            @click=${() => this._handleTabClick(tab.id)}
          >
            <span class="ab-app-nav-icon">${tab.icon}</span>
            <span class="ab-app-nav-label">${tab.label}</span>
          </button>
        `)}
      </nav>
    `;
  }
}

customElements.define('ab-app-shell', AbAppShell);

export function createAppShell(container, config = {}) {
  const {
    title = '',
    subtitle = '',
    tabs = [],
    homeUrl = null,
    onTabChange = null,
  } = config;

  container.classList.add('ab-app');

  const el = document.createElement('ab-app-shell');
  el.title = title;
  el.subtitle = subtitle;
  el.tabs = tabs;
  el.homeUrl = homeUrl;
  el._onTabChange = onTabChange;
  el._activeTab = tabs.length > 0 ? tabs[0].id : null;
  container.appendChild(el);

  return {
    get contentEl() { return el.querySelector('.ab-app-content'); },
    setSubtitle(text) { el.subtitle = text; },
    setActiveTab(tabId) { el._activeTab = tabId; },
  };
}
