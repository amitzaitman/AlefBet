import type { AudioLevel } from './schemas.ts';

// ─── UPnP SOAP helpers ─────────────────────────────────────────────────────

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sonosAction(
  ip: string, port: number,
  endpoint: string, service: string,
  action: string, body = '',
): Promise<string> {
  const soapBody = `<?xml version="1.0" encoding="utf-8"?>
<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
  s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
  <s:Body>
    <u:${action} xmlns:u="${service}">
      ${body}
    </u:${action}>
  </s:Body>
</s:Envelope>`;

  const res = await fetch(`http://${ip}:${port}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset="utf-8"',
      SOAPAction: `"${service}#${action}"`,
    },
    body: soapBody,
  });

  return res.text();
}

// ─── Volume ─────────────────────────────────────────────────────────────────

const RC_ENDPOINT = '/MediaRenderer/RenderingControl/Control';
const RC_SERVICE = 'urn:schemas-upnp-org:service:RenderingControl:1';

export function setVolume(ip: string, port: number, volume: number): Promise<string> {
  return sonosAction(ip, port, RC_ENDPOINT, RC_SERVICE, 'SetVolume',
    `<InstanceID>0</InstanceID><Channel>Master</Channel><DesiredVolume>${volume}</DesiredVolume>`);
}

export async function getVolume(ip: string, port: number): Promise<number> {
  const xml = await sonosAction(ip, port, RC_ENDPOINT, RC_SERVICE, 'GetVolume',
    '<InstanceID>0</InstanceID><Channel>Master</Channel>');
  return parseInt(xml.match(/<CurrentVolume>(\d+)<\/CurrentVolume>/)?.[1] ?? '0');
}

// ─── Transport ──────────────────────────────────────────────────────────────

const AVT_ENDPOINT = '/MediaRenderer/AVTransport/Control';
const AVT_SERVICE = 'urn:schemas-upnp-org:service:AVTransport:1';

export function play(ip: string, port: number): Promise<string> {
  return sonosAction(ip, port, AVT_ENDPOINT, AVT_SERVICE, 'Play',
    '<InstanceID>0</InstanceID><Speed>1</Speed>');
}

export function pause(ip: string, port: number): Promise<string> {
  return sonosAction(ip, port, AVT_ENDPOINT, AVT_SERVICE, 'Pause',
    '<InstanceID>0</InstanceID>');
}

export function setAVTransportURI(ip: string, port: number, uri: string, metadata = ''): Promise<string> {
  return sonosAction(ip, port, AVT_ENDPOINT, AVT_SERVICE, 'SetAVTransportURI',
    `<InstanceID>0</InstanceID>` +
    `<CurrentURI>${escapeXml(uri)}</CurrentURI>` +
    `<CurrentURIMetaData>${escapeXml(metadata)}</CurrentURIMetaData>`);
}

// ─── AudioIn / Microphone ───────────────────────────────────────────────────

const AUDIOIN_ENDPOINT = '/AudioIn/Control';
const AUDIOIN_SERVICE = 'urn:schemas-upnp-org:service:AudioIn:1';

export async function getMicEnabled(ip: string, port: number): Promise<string | null> {
  try {
    return await sonosAction(ip, port, AUDIOIN_ENDPOINT, AUDIOIN_SERVICE,
      'GetAudioInputAttributes', '<InstanceID>0</InstanceID>');
  } catch {
    return null;
  }
}

export async function getAudioInputLevel(ip: string, port: number): Promise<AudioLevel | null> {
  // AudioIn SOAP service
  try {
    const xml = await sonosAction(ip, port, AUDIOIN_ENDPOINT, AUDIOIN_SERVICE,
      'GetLineInLevel', '<InstanceID>0</InstanceID>');
    const match = xml.match(/<CurrentLevel>(\d+)<\/CurrentLevel>/i);
    if (match) return { level: parseInt(match[1]), source: 'audioin' };
  } catch { /* not supported */ }

  // Direct mic status endpoint (newer firmware)
  try {
    const res = await fetch(`http://${ip}:${port}/status/mic`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.text();
      const match = data.match(/level[>":\s]+(\d+)/i);
      if (match) return { level: parseInt(match[1]), source: 'mic-status' };
    }
  } catch { /* not available */ }

  // Diagnostics fallback
  try {
    const res = await fetch(`http://${ip}:${port}/support/review`, { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const text = await res.text();
      const match = text.match(/mic[^<]*level[^<]*?(\d+)/i);
      if (match) return { level: parseInt(match[1]), source: 'diagnostics' };
    }
  } catch { /* not available */ }

  return null;
}

export async function subscribeToAudioEvents(
  ip: string, port: number, callbackUrl: string,
): Promise<string | null> {
  try {
    const res = await fetch(`http://${ip}:${port}/AudioIn/Event`, {
      method: 'SUBSCRIBE',
      headers: {
        CALLBACK: `<${callbackUrl}>`,
        NT: 'upnp:event',
        TIMEOUT: 'Second-300',
      },
    });
    return res.headers.get('sid');
  } catch (err) {
    console.log('AudioIn subscription failed:', (err as Error).message);
    return null;
  }
}

// ─── Alert Playback ─────────────────────────────────────────────────────────

export async function playAlert(
  ip: string, port: number,
  volume: number, soundUrl: string,
): Promise<number> {
  const prevVol = await getVolume(ip, port);
  await setVolume(ip, port, volume);

  const metadata = `<DIDL-Lite xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
    xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/">
    <item id="1" parentID="0" restricted="1">
      <dc:title>Baby Alert</dc:title>
      <upnp:class>object.item.audioItem.musicTrack</upnp:class>
      <res protocolInfo="http-get:*:audio/mpeg:*">${escapeXml(soundUrl)}</res>
    </item>
  </DIDL-Lite>`;

  await setAVTransportURI(ip, port, soundUrl, metadata);
  await play(ip, port);

  // Restore volume after 15 seconds
  setTimeout(async () => {
    try { await setVolume(ip, port, prevVol); } catch { /* ignore */ }
  }, 15000);

  return prevVol;
}
