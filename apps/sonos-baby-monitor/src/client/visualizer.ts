export class Visualizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private history: number[] = new Array(64).fill(0);
  private width = 0;
  private height = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  push(level: number): void {
    this.history.push(level);
    if (this.history.length > 64) this.history.shift();
  }

  draw(threshold: number): void {
    const { ctx, width, height, history } = this;
    ctx.clearRect(0, 0, width, height);

    const barCount = history.length;
    const barW = width / barCount - 1;

    // Threshold line
    const threshY = height - (threshold / 100) * height;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, threshY);
    ctx.lineTo(width, threshY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Bars
    for (let i = 0; i < barCount; i++) {
      const val = history[i] / 100;
      const barH = Math.max(1, val * height * 0.95);
      const isAbove = history[i] >= threshold;
      const alpha = 0.4 + val * 0.6;

      if (isAbove) {
        ctx.fillStyle = `rgba(255, 71, 87, ${alpha})`;
      } else if (history[i] > threshold * 0.7) {
        ctx.fillStyle = `rgba(255, 165, 2, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(46, 213, 115, ${alpha})`;
      }

      ctx.fillRect(i * (barW + 1), height - barH, barW, barH);
    }
  }

  drawIdle(): void {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);
    const t = Date.now() / 2000;
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < 64; i++) {
      const h = (Math.sin(t + i * 0.15) * 0.5 + 0.5) * 12 + 2;
      ctx.fillRect(i * (width / 64), height - h, width / 64 - 1, h);
    }
  }
}
