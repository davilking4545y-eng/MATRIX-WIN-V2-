/**
 * Safe, robust celebration confetti engine.
 * Self-contained without external WebWorker or OffscreenCanvas bugs.
 */

export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
  colors?: string[];
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

export function triggerConfetti(options: ConfettiOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  try {
    const particleCount = options.particleCount ?? 80;
    const spread = options.spread ?? 70;
    const originX = (options.origin?.x ?? 0.5) * window.innerWidth;
    const originY = (options.origin?.y ?? 0.6) * window.innerHeight;
    const colors = options.colors && options.colors.length > 0
      ? options.colors
      : ['#00FF41', '#00E5FF', '#F59E0B', '#FFFFFF', '#EC4899'];

    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '99999';

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    document.body.appendChild(canvas);

    const particles: Particle[] = [];
    const spreadRad = (spread * Math.PI) / 180;

    for (let i = 0; i < particleCount; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * spreadRad;
      const speed = 7 + Math.random() * 9;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: colors[i % colors.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
        opacity: 1,
        shape: Math.random() > 0.3 ? 'rect' : 'circle',
      });
    }

    let animationFrameId: number;
    const gravity = 0.28;
    const drag = 0.985;
    const startTime = performance.now();
    const maxDuration = options.duration ?? 2600;

    const update = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.opacity <= 0.01) continue;

        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;

        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        if (elapsed > 1200) {
          p.opacity -= 0.02;
        }

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;

          if (p.shape === 'rect') {
            const w = p.size * Math.cos(p.wobble);
            ctx.fillRect(-w / 2, -p.size / 2, w, p.size);
          } else {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (aliveCount > 0 && elapsed < maxDuration) {
        animationFrameId = requestAnimationFrame(update);
      } else {
        cleanup();
      }
    };

    const cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };

    animationFrameId = requestAnimationFrame(update);
  } catch (err) {
    console.warn('Confetti animation suppressed:', err);
  }
}

export default triggerConfetti;
