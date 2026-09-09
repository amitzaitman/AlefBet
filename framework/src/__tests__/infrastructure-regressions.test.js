import { describe, it, expect, vi, afterEach } from 'vitest';
import { createDragSource, createDropTarget } from '../input/drag.js';
import { createVoiceRecorder } from '../audio/voice-recorder.js';
import { createZonePlayer } from '../ui/zone-player.js';
import { createVoiceRecordButton } from '../ui/voice-record-button.js';
import { createOptionCards } from '../ui/option-cards.js';
import { makeMockMediaRecorder } from './helpers.js';
import { playVoice } from '../audio/voice-store.js';
vi.mock('../audio/voice-store.js', () => ({ playVoice: vi.fn(async () => true), loadVoice: vi.fn(async () => null), saveVoice: vi.fn(), deleteVoice: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
function pointer(el, type, pointerId = 1) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId, button: 0, clientX: 20, clientY: 20 });
  el.dispatchEvent(event);
}
function element() {
  const el = document.createElement('button');
  el.setPointerCapture = vi.fn();
  document.body.append(el);
  return el;
}
describe('drag ownership', () => {
  it('ignores other fingers, cancels the old source, and handles capture loss', () => {
    const a = element(), b = element();
    const first = createDragSource(a, {}), second = createDragSource(b, {});
    pointer(a, 'pointerdown');
    pointer(a, 'pointerup', 2);
    expect(a.classList.contains('drag-source--dragging')).toBe(true);
    pointer(b, 'pointerdown', 2);
    expect(a.classList.contains('drag-source--dragging')).toBe(false);
    pointer(a, 'pointerup');
    expect(document.querySelector('[aria-hidden="true"]')).not.toBeNull();
    pointer(b, 'lostpointercapture', 2);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();
    first.destroy(); second.destroy();
  });
  it.each(['disabled', 'aria-disabled'])('rejects a target locked with %s during a drag', attribute => {
    const source = element(), target = element(), drop = vi.fn();
    const drag = createDragSource(source, {}), zone = createDropTarget(target, drop);
    document.elementFromPoint = vi.fn(() => target);
    pointer(source, 'pointerdown');
    target.setAttribute(attribute, 'true');
    pointer(source, 'pointerup');
    expect(drop).not.toHaveBeenCalled();
    target.removeAttribute(attribute);
    pointer(source, 'pointerdown'); pointer(source, 'pointerup');
    expect(drop).toHaveBeenCalledOnce();
    drag.destroy(); zone.destroy(); delete document.elementFromPoint;
  });
});
describe('recording permissions', () => {
  it('stops a late stream after cancellation and allows a new recording', async () => {
    let allow;
    const stop = vi.fn();
    const getUserMedia = vi.fn().mockImplementationOnce(() => new Promise(resolve => { allow = resolve; }))
      .mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    const MR = makeMockMediaRecorder(); vi.stubGlobal('MediaRecorder', MR);
    const recorder = createVoiceRecorder();
    const pending = recorder.start();
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    recorder.cancel();
    await recorder.start();
    allow({ getTracks: () => [{ stop }] });
    await rejected;
    expect(stop).toHaveBeenCalledOnce();
    expect(recorder.isActive()).toBe(true);
    expect(MR.instances).toHaveLength(1);
    recorder.cancel();
  });
  it('shares a pending permission request and releases the stream if construction fails', async () => {
    let allow;
    const stop = vi.fn(), getUserMedia = vi.fn(() => new Promise(resolve => { allow = resolve; }));
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('MediaRecorder', class { static isTypeSupported() { return false; } constructor() { throw new Error('unsupported'); } });
    const recorder = createVoiceRecorder();
    const a = recorder.start(), b = recorder.start();
    const results = Promise.allSettled([a, b]);
    expect(getUserMedia).toHaveBeenCalledOnce();
    allow({ getTracks: () => [{ stop }] });
    expect((await results).every(result => result.status === 'rejected')).toBe(true);
    expect(stop).toHaveBeenCalledOnce();
  });
});
describe('zone lifetime', () => {
  it('cancels delayed instruction and removes listeners on destroy', () => {
    vi.useFakeTimers();
    const host = element();
    const onCorrect = vi.fn();
    const player = createZonePlayer(host, { image: '', gameId: 'g', roundId: 'r', zones: [{ id: 'z', correct: true }], onCorrect });
    const zone = host.querySelector('.ab-zp-zone');
    player.destroy(); zone.click(); vi.runAllTimers();
    expect(playVoice).not.toHaveBeenCalled(); expect(onCorrect).not.toHaveBeenCalled();
  });
  it('aborts playing audio and clears timers on reset and destroy', async () => {
    vi.useFakeTimers();
    const player = createZonePlayer(element(), { image: '', gameId: 'g', roundId: 'r' });
    await player.playInstruction();
    const signal = vi.mocked(playVoice).mock.calls[0][2].signal;
    player.reset(); expect(signal.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await player.playInstruction();
    const next = vi.mocked(playVoice).mock.calls[1][2].signal;
    expect(next.aborted).toBe(false);
    player.destroy(); expect(next.aborted).toBe(true);
  });
});
it('renders answer text and emoji literally', () => {
  const host = element();
  createOptionCards(host, [{ id: 'x', text: '<b>text</b>', emoji: '<img src=x>' }], vi.fn());
  expect(host.querySelector('.option-card__text').textContent).toBe('<b>text</b>');
  expect(host.querySelector('b, img')).toBeNull();
});

it('destroying a recording button during permission prompt cannot restart it', async () => {
  vi.useFakeTimers();
  let allow;
  const stop = vi.fn();
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise(resolve => { allow = resolve; }) } });
  const MR = makeMockMediaRecorder(); vi.stubGlobal('MediaRecorder', MR);
  const host = element();
  const button = createVoiceRecordButton(host, { gameId: 'g', voiceKey: 'r' });
  await button.refresh();
  host.querySelector('.ab-voice-btn--record').click();
  button.destroy();
  allow({ getTracks: () => [{ stop }] });
  await vi.advanceTimersByTimeAsync(0);
  expect(stop).toHaveBeenCalledOnce();
  expect(MR.instances).toHaveLength(0);
  expect(vi.getTimerCount()).toBe(0);
  expect(host.querySelector('.ab-voice-btn-wrap')).toBeNull();
});
