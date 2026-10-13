import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../core/events.js';

describe('EventBus', () => {
  it('calls every handler of an event with its payload, and on/emit chain', () => {
    const bus = new EventBus();
    const h1 = vi.fn(), h2 = vi.fn();
    bus.on('ev', h1).on('ev', h2).on('other', h2).emit('ev', { x: 1 }).emit('other');
    expect(h1).toHaveBeenCalledOnce();
    expect(h1).toHaveBeenCalledWith({ x: 1 });
    expect(h2).toHaveBeenCalledTimes(2);
  });

  it('off() removes only that handler; off() and emit() on unknown events do not throw', () => {
    const bus = new EventBus();
    const h1 = vi.fn(), h2 = vi.fn();
    bus.on('ev', h1).on('ev', h2);
    bus.off('ev', h1);
    bus.emit('ev');
    expect(h1).not.toHaveBeenCalled();
    expect(h2).toHaveBeenCalledOnce();
    expect(() => bus.off('ghost', () => {})).not.toThrow();
    expect(() => bus.emit('nobody')).not.toThrow();
  });

  it('handlers added during emit are not called in the same emit', () => {
    const bus = new EventBus();
    const late = vi.fn();
    bus.on('ev', () => bus.on('ev', late));
    bus.emit('ev');
    expect(late).not.toHaveBeenCalled(); // slice() in emit prevents this
  });
});
