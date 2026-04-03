/**
 * מסך טעינה פשוט
 */
import { LitElement, html } from 'lit';

class AbLoadingScreen extends LitElement {
  static properties = {
    text: { type: String },
  };

  createRenderRoot() { return this; }

  constructor() {
    super();
    this.text = 'טוֹעֵן...';
  }

  render() {
    return html`<div class="ab-loading">${this.text}</div>`;
  }
}

customElements.define('ab-loading-screen', AbLoadingScreen);

/**
 * @param {HTMLElement} container
 * @param {string} [text]
 */
export function showLoadingScreen(container, text = 'טוֹעֵן...') {
  container.innerHTML = '';
  const el = document.createElement('ab-loading-screen');
  el.text = text;
  container.appendChild(el);
}

/**
 * @param {HTMLElement} container
 */
export function hideLoadingScreen(container) {
  container.innerHTML = '';
}
