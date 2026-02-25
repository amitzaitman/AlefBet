/**
 * Anthropic API Client — browser-side
 * משתמש במפתח ה-API של המחנך מ-localStorage
 */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

export class ClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this._history = [];
  }

  /** שלח הודעה ל-Claude וקבל תשובה (streaming) */
  async sendMessage(userMessage, systemPrompt, onChunk) {
    this._history.push({ role: 'user', content: userMessage });

    const body = {
      model: MODEL,
      max_tokens: 8192,
      system: systemPrompt,
      messages: this._history,
      stream: true,
    };

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    let fullText = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
            const text = parsed.delta.text;
            fullText += text;
            onChunk?.(text);
          }
        } catch {
          // skip malformed lines
        }
      }
    }

    this._history.push({ role: 'assistant', content: fullText });
    return fullText;
  }

  /** אפס את היסטוריית השיחה */
  clearHistory() {
    this._history = [];
  }
}
