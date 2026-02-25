import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../core/events.js';

describe('EventBus', () => {
  it('calls handler when event is emitted', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('test', handler);
    bus.emit('test', { x: 1 });
    expect(handler).toHaveBeenCalledWith({ x: 1 });
  });

  it('calls multiple handlers for the same event', () => {
    const bus = new EventBus();
    const h1 = vi.fn(), h2 = vi.fn();
    bus.on('ev', h1);
    bus.on('ev', h2);
    bus.emit('ev');
    expect(h1).toHaveBeenCalledOnce();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('removes a handler with off()', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on('ev', handler);
    bus.off('ev', handler);
    bus.emit('ev');
    expect(handler).not.toHaveBeenCalled();
  });

  it('off() on unknown event does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.off('ghost', () => {})).not.toThrow();
  });

  it('emit on event with no handlers does not throw', () => {
    const bus = new EventBus();
    expect(() => bus.emit('nobody')).not.toThrow();
  });

  it('removing a handler does not affect other handlers on the same event', () => {
    const bus = new EventBus();
    const h1 = vi.fn(), h2 = vi.fn();
    bus.on('ev', h1);
    bus.on('ev', h2);
    bus.off('ev', h1);
    bus.emit('ev');
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
  });

  it('is chainable', () => {
    const bus = new EventBus();
    const h = vi.fn();
    bus.on('a', h).on('b', h).emit('a').emit('b');
    expect(h).toHaveBeenCalledTimes(2);
  });

  it('handlers added during emit are not called in the same emit', () => {
    const bus = new EventBus();
    const late = vi.fn();
    bus.on('ev', () => bus.on('ev', late));
    bus.emit('ev');
    expect(late).not.toHaveBeenCalled(); // slice() in emit prevents this
  });
});
