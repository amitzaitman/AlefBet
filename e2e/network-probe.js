/** Runs inside page.evaluate. Timeouts are inconclusive, never proof of being offline. */
export async function probeInBrowser(url, timeoutMs = 1500) {
  const controller = new AbortController();
  let timer;
  const timeout = new Promise(resolve => {
    timer = setTimeout(() => resolve('timeout'), timeoutMs);
  });
  try {
    return await Promise.race([
      timeout,
      (async () => {
        try {
          const response = await fetch(url, { cache: 'no-store', signal: controller.signal });
          const expected = new URL(url).pathname + new URL(url).search;
          return response.ok && await response.text() === expected ? 'online' : 'unexpected-response';
        } catch {
          return 'network-error';
        }
      })(),
    ]);
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
