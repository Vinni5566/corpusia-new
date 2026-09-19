import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

interface WavePoint {
  x: number;
  y: number;
}

interface Wave {
  hue: string;
  amplitude: number;
  frequency: number;
  speed: number;
  yOffset: number;
  lineWidth: number;
  alpha: number;
  phase: number;
  particles: number[];
}

interface ConstellationPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const WAVE_COLORS = [
  "330, 81%, 62%", // pink
  "262, 83%, 66%", // violet
  "189, 94%, 55%", // cyan
];

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let stars: Star[] = [];
    let waves: Wave[] = [];
    let constellation: ConstellationPoint[] = [];

    const setup = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const starCount = Math.round((width * height) / 6000);
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.4 + Math.random() * 0.8,
        baseAlpha: 0.25 + Math.random() * 0.55,
      }));

      waves = WAVE_COLORS.map((hue, i) => ({
        hue,
        amplitude: height * (0.08 + i * 0.03),
        frequency: 0.9 + i * 0.35,
        speed: 0.06 + i * 0.03,
        yOffset: height * (0.6 + i * 0.1),
        lineWidth: 2.6 - i * 0.4,
        alpha: 0.55 - i * 0.1,
        phase: i * 1.7,
        particles: Array.from({ length: 6 }, () => Math.random()),
      }));

      const nodeCount = Math.round((width * height) / 55000);
      constellation = Array.from({ length: nodeCount }, () => ({
        x: Math.random() * width * 0.55 + width * 0.4,
        y: Math.random() * height * 0.6,
        vx: (Math.random() - 0.5) * 0.05,
        vy: (Math.random() - 0.5) * 0.05,
      }));
    };

    setup();
    window.addEventListener("resize", setup);

    let frameId: number;
    let t = 0;

    const drawNebulaGlow = () => {
      const glowSpots: { x: number; y: number; r: number; hue: string; alpha: number }[] = [
        { x: width * 0.05, y: height * 0.08, r: Math.max(width, height) * 0.5, hue: "262, 83%, 60%", alpha: 0.16 },
        { x: width * 0.08, y: height * 0.92, r: Math.max(width, height) * 0.45, hue: "330, 81%, 55%", alpha: 0.14 },
        { x: width * 0.95, y: height * 0.85, r: Math.max(width, height) * 0.5, hue: "189, 94%, 50%", alpha: 0.13 },
        { x: width * 0.85, y: height * 0.1, r: Math.max(width, height) * 0.4, hue: "262, 83%, 60%", alpha: 0.1 },
      ];
      for (const spot of glowSpots) {
        const gradient = ctx.createRadialGradient(spot.x, spot.y, 0, spot.x, spot.y, spot.r);
        gradient.addColorStop(0, `hsla(${spot.hue}, ${spot.alpha})`);
        gradient.addColorStop(1, `hsla(${spot.hue}, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const drawStars = () => {
      for (const star of stars) {
        const twinkle = prefersReducedMotion
          ? star.baseAlpha
          : star.baseAlpha *
            (0.55 + 0.45 * Math.sin(t * star.twinkleSpeed + star.twinklePhase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(226, 232, 255, ${twinkle})`;
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const waveY = (wave: Wave, x: number) => {
      const nx = x / width;
      return (
        wave.yOffset +
        Math.sin(nx * Math.PI * wave.frequency + wave.phase) * wave.amplitude +
        Math.sin(nx * Math.PI * wave.frequency * 2.3 + wave.phase * 1.4) * wave.amplitude * 0.35
      );
    };

    const drawWaves = () => {
      const waveWidth = width * 0.62;

      for (const wave of waves) {
        ctx.beginPath();
        const points: WavePoint[] = [];
        for (let x = 0; x <= waveWidth; x += 8) {
          points.push({ x, y: waveY(wave, x) });
        }
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });

        const gradient = ctx.createLinearGradient(0, 0, waveWidth, 0);
        gradient.addColorStop(0, `hsla(${wave.hue}, 0)`);
        gradient.addColorStop(0.25, `hsla(${wave.hue}, ${wave.alpha})`);
        gradient.addColorStop(0.75, `hsla(${wave.hue}, ${wave.alpha * 0.6})`);
        gradient.addColorStop(1, `hsla(${wave.hue}, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = wave.lineWidth;
        ctx.shadowColor = `hsla(${wave.hue}, 0.8)`;
        ctx.shadowBlur = 16;
        ctx.stroke();
        ctx.shadowBlur = 0;

        for (const p of wave.particles) {
          const px = p * waveWidth;
          const py = waveY(wave, px);
          ctx.beginPath();
          ctx.fillStyle = `hsla(${wave.hue}, 0.9)`;
          ctx.shadowColor = `hsla(${wave.hue}, 0.9)`;
          ctx.shadowBlur = 8;
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        if (!prefersReducedMotion) {
          wave.phase += wave.speed * 0.016;
          wave.particles = wave.particles.map(
            (p) => (p + wave.speed * 0.012) % 1,
          );
        }
      }
    };

    const drawConstellation = () => {
      const maxDist = Math.max(width, height) * 0.16;
      ctx.lineWidth = 1;
      for (let i = 0; i < constellation.length; i++) {
        const a = constellation[i];
        for (let j = i + 1; j < constellation.length; j++) {
          const b = constellation[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.18;
            ctx.strokeStyle = `hsla(262, 60%, 75%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const node of constellation) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(199, 210, 254, 0.55)";
        ctx.arc(node.x, node.y, 1.4, 0, Math.PI * 2);
        ctx.fill();

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;
          if (node.x < width * 0.35 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height * 0.65) node.vy *= -1;
        }
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      drawNebulaGlow();
      drawStars();
      drawWaves();
      drawConstellation();
      if (!prefersReducedMotion) t += 0.016;
      frameId = requestAnimationFrame(draw);
    };

    if (prefersReducedMotion) {
      draw();
    } else {
      frameId = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", setup);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <canvas ref={canvasRef} className="h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 80% 55% at 50% 100%, black 30%, transparent 100%)",
        }}
      />
    </div>
  );
}
