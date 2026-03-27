import type { SonosSpeaker, MonitorSettings } from '../schemas.ts';

export async function discover(): Promise<SonosSpeaker[]> {
  const res = await fetch('/api/discover');
  const data: { speakers?: SonosSpeaker[] } = await res.json();
  return data.speakers ?? [];
}

export async function setBabySpeaker(speaker: SonosSpeaker): Promise<void> {
  await fetch('/api/baby-speaker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(speaker),
  });
}

export async function setParentSpeaker(speaker: SonosSpeaker): Promise<void> {
  await fetch('/api/parent-speaker', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(speaker),
  });
}

export async function syncSettings(settings: Partial<MonitorSettings>): Promise<void> {
  await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
}

export async function startMonitoring(): Promise<{ ok?: boolean; error?: string }> {
  const res = await fetch('/api/start', { method: 'POST' });
  return res.json() as Promise<{ ok?: boolean; error?: string }>;
}

export async function stopMonitoring(): Promise<void> {
  await fetch('/api/stop', { method: 'POST' });
}

export async function sendAlert(
  ip: string, port: number, volume: number, audioUrl: string,
): Promise<void> {
  await fetch('/api/alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, port, volume, audioUrl }),
  });
}
