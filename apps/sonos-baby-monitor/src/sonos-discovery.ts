import dgram from 'node:dgram';
import type { SonosSpeaker } from './schemas.ts';

interface RawSpeaker {
  ip: string;
  port: number;
  location: string;
}

const SSDP_ADDRESS = '239.255.255.250';
const SSDP_PORT = 1900;

const SEARCH_MESSAGE = Buffer.from(
  'M-SEARCH * HTTP/1.1\r\n' +
  `HOST: ${SSDP_ADDRESS}:${SSDP_PORT}\r\n` +
  'MAN: "ssdp:discover"\r\n' +
  'MX: 3\r\n' +
  'ST: urn:schemas-upnp-org:device:ZonePlayer:1\r\n' +
  '\r\n'
);

const MIC_MODELS = /One|Era|Beam|Arc|Move|Roam/i;

export function discoverSonos(timeoutMs = 5000): Promise<RawSpeaker[]> {
  return new Promise((resolve) => {
    const speakers = new Map<string, RawSpeaker>();
    const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });

    socket.on('message', (msg) => {
      const text = msg.toString();
      const locationMatch = text.match(/LOCATION:\s*(.*)/i);
      if (!locationMatch) return;

      const location = locationMatch[1].trim();
      const urlMatch = location.match(/http:\/\/([\d.]+):(\d+)/);
      if (urlMatch) {
        speakers.set(urlMatch[1], {
          ip: urlMatch[1],
          port: parseInt(urlMatch[2]),
          location,
        });
      }
    });

    socket.on('error', (err) => {
      console.error('SSDP error:', err.message);
      socket.close();
      resolve([]);
    });

    socket.bind(() => {
      socket.addMembership(SSDP_ADDRESS);
      socket.send(SEARCH_MESSAGE, 0, SEARCH_MESSAGE.length, SSDP_PORT, SSDP_ADDRESS);
      // Retry once for reliability
      setTimeout(() => {
        try { socket.send(SEARCH_MESSAGE, 0, SEARCH_MESSAGE.length, SSDP_PORT, SSDP_ADDRESS); }
        catch { /* socket may be closed */ }
      }, 1000);
    });

    setTimeout(() => {
      socket.close();
      resolve([...speakers.values()]);
    }, timeoutMs);
  });
}

export async function getSonosDeviceInfo(raw: RawSpeaker): Promise<SonosSpeaker> {
  try {
    const res = await fetch(raw.location);
    const xml = await res.text();
    const roomName = xml.match(/<roomName>(.*?)<\/roomName>/)?.[1] ?? 'Unknown Room';
    const modelName = xml.match(/<modelName>(.*?)<\/modelName>/)?.[1] ?? 'Sonos';
    const modelNumber = xml.match(/<modelNumber>(.*?)<\/modelNumber>/)?.[1] ?? '';
    const hasMic = MIC_MODELS.test(`${modelName} ${modelNumber}`);
    return { ...raw, roomName, modelName, modelNumber, hasMic };
  } catch {
    return { ...raw, roomName: raw.ip, modelName: 'Sonos', modelNumber: '', hasMic: false };
  }
}
