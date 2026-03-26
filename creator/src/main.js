/**
 * AlefBet Creator — Main entry point
 * מנהל אתחול האפליקציה, מפתח ה-API, וזרימת הצ'אט
 */

import { ClaudeClient } from './claude-client.js';
import { ChatUI } from './chat-ui.js';
import { buildSystemPrompt } from './system-prompt.js';
import { extractGameFiles, renderPreview, formatCodeOutput, downloadGame } from './game-preview.js';
import { showPublishDialog } from './publish.js';

// ── DOM refs ──────────────────────────────────────────────────────────────

const apiKeyModal    = document.getElementById('api-key-modal');
const apiKeyInput    = document.getElementById('api-key-input');
const apiKeySubmit   = document.getElementById('api-key-submit');
const changeKeyBtn   = document.getElementById('change-key-btn');

const appEl          = document.getElementById('app');
const chatForm       = document.getElementById('chat-form');
const chatInputEl    = document.getElementById('chat-input');
const chatSendBtn    = document.getElementById('chat-send-btn');
const chatMessagesEl = document.getElementById('chat-messages');
const publishGameBtn = document.getElementById('publish-game-btn');
const saveGameBtn    = document.getElementById('save-game-btn');
const copyCodeBtn    = document.getElementById('copy-code-btn');

const previewPane    = document.getElementById('preview-pane');
const codePane       = document.getElementById('code-pane');
const codeOutput     = document.getElementById('code-output').querySelector('code');
const previewTabs    = document.querySelectorAll('.preview-tab');
const quickBtns      = document.querySelectorAll('.quick-btn');

// ── State ─────────────────────────────────────────────────────────────────

let claude        = null;
let chatUI        = null;
let systemPrompt  = '';
let lastGameFiles = null;
let lastGameName  = 'my-game';

// ── Init ──────────────────────────────────────────────────────────────────

async function init() {
  chatUI = new ChatUI(chatMessagesEl);

  // Load system prompt in background
  buildSystemPrompt().then(sp => { systemPrompt = sp; });

  const savedKey = localStorage.getItem('alefbet-api-key');
  if (savedKey) {
    startApp(savedKey);
  } else {
    showApiKeyModal();
  }
}

// ── API Key Modal ─────────────────────────────────────────────────────────

function showApiKeyModal() {
  apiKeyModal.removeAttribute('hidden');
  appEl.hidden = true;
  apiKeyInput.focus();
}

function hideApiKeyModal() {
  apiKeyModal.hidden = true;
  appEl.removeAttribute('hidden');
}

function startApp(apiKey) {
  claude = new ClaudeClient(apiKey);
  hideApiKeyModal();
}

apiKeySubmit.addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (!key || !key.startsWith('sk-')) {
    apiKeyInput.style.borderColor = 'var(--c-error)';
    return;
  }
  apiKeyInput.style.borderColor = '';
  localStorage.setItem('alefbet-api-key', key);
  startApp(key);
});

apiKeyInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') apiKeySubmit.click();
});

changeKeyBtn.addEventListener('click', () => {
  apiKeyInput.value = localStorage.getItem('alefbet-api-key') || '';
  showApiKeyModal();
});

// ── Chat ──────────────────────────────────────────────────────────────────

chatForm.addEventListener('submit', async e => {
  e.preventDefault();
  const text = chatInputEl.value.trim();
  if (!text || !claude) return;
  await sendMessage(text);
});

chatInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.requestSubmit();
  }
});

quickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    chatInputEl.value = btn.dataset.prompt;
    chatInputEl.focus();
  });
});

async function sendMessage(text) {
  if (!claude) return;

  chatInputEl.value = '';
  chatSendBtn.disabled = true;
  chatInputEl.disabled = true;

  chatUI.addUserMessage(text);
  chatUI.startAssistantMessage();

  // Extract game name hint from message
  const nameMatch = text.match(/משחק\s+(\S+)/);
  if (nameMatch) lastGameName = nameMatch[1];

  try {
    let fullText = '';
    await claude.sendMessage(text, systemPrompt, chunk => {
      fullText += chunk;
      chatUI.updateAssistantMessage(fullText);
    });

    chatUI.finalizeAssistantMessage(fullText);

    // Try to extract game files from the response
    const files = extractGameFiles(fullText);
    if (Object.keys(files).length > 0) {
      lastGameFiles = files;
      renderGamePreview(files);
      updateCodeView(files);
      saveGameBtn.removeAttribute('hidden');
      publishGameBtn.removeAttribute('hidden');
    }

  } catch (err) {
    chatUI.finalizeAssistantMessage('');
    chatUI.addErrorMessage(err.message);
  } finally {
    chatSendBtn.disabled = false;
    chatInputEl.disabled = false;
    chatInputEl.focus();
  }
}

// ── Preview ───────────────────────────────────────────────────────────────

function renderGamePreview(files) {
  renderPreview(previewPane, files);
}

function updateCodeView(files) {
  codeOutput.textContent = formatCodeOutput(files);
}

// ── Tabs ──────────────────────────────────────────────────────────────────

previewTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    previewTabs.forEach(t => t.classList.remove('preview-tab--active'));
    tab.classList.add('preview-tab--active');
    const target = tab.dataset.tab;
    previewPane.hidden = target !== 'preview';
    codePane.hidden    = target !== 'code';
  });
});

// ── Save / Copy ───────────────────────────────────────────────────────────

saveGameBtn.addEventListener('click', () => {
  if (!lastGameFiles) return;
  downloadGame(lastGameName, lastGameFiles);
});

publishGameBtn.addEventListener('click', () => {
  if (!lastGameFiles) return;
  showPublishDialog(lastGameName, lastGameFiles);
});

copyCodeBtn.addEventListener('click', async () => {
  const text = codeOutput.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyCodeBtn.textContent = 'הֻועְתַּק!';
    setTimeout(() => { copyCodeBtn.textContent = 'הֶעְתֵּק'; }, 2000);
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
});

// ── Start ─────────────────────────────────────────────────────────────────

init();
