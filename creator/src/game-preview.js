/**
 * תצוגה מקדימה של המשחק
 * מריץ את קוד המשחק שנוצר ב-iframe מבודד
 */

/** חלץ בלוקי קוד מתשובת Claude */
export function extractGameFiles(assistantText) {
  const files = {};
  // Match ```html filename or ```js filename blocks
  const blockRe = /```(\w+)(?:\s+(\S+))?\n([\s\S]*?)```/g;
  let match;
  while ((match = blockRe.exec(assistantText)) !== null) {
    const lang = match[1];
    const fileName = match[2] || (lang === 'html' ? 'index.html' : 'game.js');
    files[fileName] = match[3];
  }
  return files;
}

/** בנה HTML מלא ל-iframe מקוד game.js */
function buildIframeHTML(gameJs, gameCss = '') {
  // Inline the framework using CDN-style approach.
  // Since we can't load from file:// in an iframe, we bundle what we need.
  // The iframe will have access to the framework via a blob URL.
  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'Heebo', Arial, sans-serif; }
  </style>
  <style id="framework-css">/* Framework CSS loaded dynamically */</style>
  <style>${gameCss}</style>
</head>
<body>
  <div id="game"></div>
  <script type="module">
    // Load framework CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../framework/dist/alefbet.css';
    document.head.appendChild(link);

    // Inline game code
    ${gameJs}

    // Auto-start
    if (typeof startGame === 'function') {
      startGame(document.getElementById('game'));
    }
  </script>
</body>
</html>`;
}

/** Render the game in a preview container */
export function renderPreview(container, files) {
  const gameJs  = files['game.js']    || '';
  const gameCss = files['game.css']   || '';
  const indexHtml = files['index.html'] || buildIframeHTML(gameJs, gameCss);

  container.innerHTML = '';

  const iframe = document.createElement('iframe');
  iframe.className = 'preview-iframe';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
  iframe.setAttribute('title', 'תְּצוּגָה מַקְדִּימָה שֶׁל הַמִּשְׂחָק');

  container.appendChild(iframe);

  // Write HTML into the iframe
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(indexHtml);
  doc.close();

  return iframe;
}

/** Get all generated code as a formatted string for the code view */
export function formatCodeOutput(files) {
  return Object.entries(files)
    .map(([name, code]) => `/* ===== ${name} ===== */\n\n${code}`)
    .join('\n\n\n');
}

/** Attempt to save game files to a named folder (downloads them) */
export function downloadGame(gameName, files) {
  const slug = gameName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u05D0-\u05EA-]/g, '');

  Object.entries(files).forEach(([fileName, content]) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}-${fileName}`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/**
 * Build a single self-contained HTML file with the framework and game inlined.
 * Uses the UMD build so no ES module imports are needed in the output.
 */
export async function buildStandaloneHTML(gameName, files) {
  const [frameworkJs, frameworkCss] = await Promise.all([
    fetch('../framework/dist/alefbet.umd.cjs').then(r => r.text()),
    fetch('../framework/dist/alefbet.css').then(r => r.text()),
  ]);

  const gameJs  = files['game.js']  || '';
  const gameCss = files['game.css'] || '';

  // Replace ES module import with destructure from window.AlefBet (UMD global)
  const transformedJs = gameJs.replace(
    /import\s*\{([^}]+)\}\s*from\s*['"][^'"]*alefbet[^'"]*['"]\s*;?/g,
    (_, imports) => `const {${imports.trim()}} = window.AlefBet;`
  );

  const title = gameName || 'AlefBet Game';

  return `<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;padding:0;font-family:'Heebo',Arial,sans-serif}
  </style>
  <style>${frameworkCss}</style>
  <style>${gameCss}</style>
</head>
<body>
  <div id="game"></div>
  <script>${frameworkJs}</script>
  <script>
${transformedJs}

if (typeof startGame === 'function') {
  startGame(document.getElementById('game'));
}
  </script>
</body>
</html>`;
}

/** Download a single standalone HTML file containing the complete game */
export function downloadStandaloneGame(gameName, html) {
  const slug = (gameName || 'game')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u05D0-\u05EA-]/g, '') || 'game';

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
