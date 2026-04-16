import { useRef, useState, useEffect, memo } from 'react';
import { THREAT_COLORS } from '../constants';
import { randInt } from '../utils/helpers';
import type { AttackEvent } from '../types';

interface NeuralCanvasProps {
  attacks: AttackEvent[];
}

interface Node {
  x: number;
  y: number;
  r: number;
  type: 'CORE' | 'LAYER' | 'SENSOR';
  color: string;
  pulse: number;
}

interface Particle {
  sx: number; sy: number;
  tx: number; ty: number;
  progress: number;
  speed: number;
  arc: number;
  color: string;
  blocked: boolean;
}

interface Ring {
  x: number; y: number;
  progress: number;
  color: string;
}

export const NeuralCanvas = memo(function NeuralCanvas({ attacks }: NeuralCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    nodes: Node[];
    particles: Particle[];
    rings: Ring[];
    pulses: Ring[];
    w: number;
    h: number;
  }>({ nodes: [], particles: [], rings: [], pulses: [], w: 0, h: 0 });
  const [size, setSize] = useState({ width: 260, height: 220 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const update = () => {
      const { width, height } = container.getBoundingClientRect();
      if (width > 0 && height > 0)
        setSize({ width: Math.round(width), height: Math.round(height) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    const { width, height } = size;
    const cx = width / 2,
      cy = height / 2;
    const scale = Math.min(width / 260, height / 220);

    const layerColors = ['#1A73E8', '#7C3AED', '#0D9B8A', '#D97706', '#EA580C', '#DC2626'];

    s.nodes = [];
    s.nodes.push({ x: cx, y: cy, r: 24 * scale, type: 'CORE', color: '#1A73E8', pulse: 0 });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist = 70 * scale;
      s.nodes.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 12 * scale,
        type: 'LAYER',
        color: layerColors[i],
        pulse: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dist = 140 * scale;
      s.nodes.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: 6 * scale,
        type: 'SENSOR',
        color: '#D1DCE8',
        pulse: Math.random() * Math.PI * 2,
      });
    }
    s.w = width;
    s.h = height;
  }, [size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const s = stateRef.current;
    const { width, height } = size;
    const scale = Math.min(width / 260, height / 220);
    const maxConnDist = 160 * scale;

    let animId: number;
    let t = 0;

    function draw() {
      t += 0.02;
      ctx!.clearRect(0, 0, width, height);

      // Background
      ctx!.fillStyle = '#F0F4F8';
      ctx!.fillRect(0, 0, width, height);

      // Connection lines
      s.nodes.forEach((n, i) => {
        s.nodes.forEach((m, j) => {
          if (j <= i) return;
          const dx = n.x - m.x,
            dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxConnDist) return;
          const alpha = (1 - dist / maxConnDist) * 1.0;
          ctx!.strokeStyle = `rgba(26,115,232,0.15)`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(n.x, n.y);
          ctx!.lineTo(m.x, m.y);
          ctx!.stroke();
        });
      });

      // Draw rings
      s.rings = s.rings.filter((r) => {
        r.progress += 0.025;
        if (r.progress >= 1) return false;
        const radius = r.progress * 90 * scale;
        const alpha = (1 - r.progress) * 0.4;
        ctx!.strokeStyle = r.color;
        ctx!.globalAlpha = alpha;
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
        return true;
      });

      // Draw particles
      s.particles = s.particles.filter((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          s.rings.push({ x: p.tx, y: p.ty, progress: 0, color: p.color });
          if (p.blocked) {
            s.pulses.push({ x: s.nodes[0].x, y: s.nodes[0].y, progress: 0, color: '#0D9B8A' });
          }
          return false;
        }
        const eased = 1 - Math.pow(1 - p.progress, 3);
        const x = p.sx + (p.tx - p.sx) * eased;
        const y = p.sy + (p.ty - p.sy) * eased + Math.sin(p.progress * Math.PI) * p.arc;
        
        ctx!.beginPath();
        ctx!.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.fill();
        ctx!.strokeStyle = '#FFFFFF';
        ctx!.lineWidth = 1;
        ctx!.stroke();
        return true;
      });

      // Draw pulses
      s.pulses = s.pulses.filter((p) => {
        p.progress += 0.04;
        if (p.progress >= 1) return false;
        const r = p.progress * 45 * scale;
        ctx!.globalAlpha = (1 - p.progress) * 0.5;
        ctx!.strokeStyle = p.color;
        ctx!.lineWidth = 2;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
        return true;
      });

      // Draw nodes
      s.nodes.forEach((n) => {
        n.pulse += 0.05;
        const glow = 0.5 + 0.5 * Math.sin(n.pulse);
        const r = n.r + glow * (n.type === 'CORE' ? 2 : 1);
        
        // Outer halo
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r + 4, 0, Math.PI * 2);
        ctx!.fillStyle = n.type === 'SENSOR' ? '#EBF0F6' : n.color;
        ctx!.globalAlpha = 0.1;
        ctx!.fill();
        ctx!.globalAlpha = 1;

        // Inner circle
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = n.type === 'SENSOR' ? '#EBF0F6' : n.color;
        ctx!.fill();
        ctx!.strokeStyle = n.type === 'SENSOR' ? '#B8C9D9' : '#FFFFFF';
        ctx!.lineWidth = 1.5;
        ctx!.stroke();

        if (n.type === 'CORE') {
          ctx!.font = `bold ${Math.round(10 * scale)}px 'Inter', sans-serif`;
          ctx!.fillStyle = '#FFFFFF';
          ctx!.textAlign = 'center';
          ctx!.fillText('AI', n.x, n.y + 4);
        }
      });

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  useEffect(() => {
    if (!attacks.length) return;
    const atk = attacks[0];
    const s = stateRef.current;
    if (!s.nodes.length) return;
    const core = s.nodes[0];
    const sensorIdx = randInt(7, s.nodes.length - 1);
    const sensor = s.nodes[sensorIdx];
    if (!sensor) return;
    const scale = Math.min(s.w / 260, s.h / 220) || 1;
    s.particles.push({
      sx: sensor.x,
      sy: sensor.y,
      tx: core.x,
      ty: core.y,
      progress: 0,
      speed: 0.022,
      arc: randInt(-30, 30) * scale,
      color: THREAT_COLORS[atk.type] || '#DC2626',
      blocked: atk.blocked,
    });
    if (s.particles.length > 50) s.particles.splice(0, s.particles.length - 50);
    if (s.rings.length > 30) s.rings.splice(0, s.rings.length - 30);
    if (s.pulses.length > 30) s.pulses.splice(0, s.pulses.length - 30);
  }, [attacks]);

  return (
    <div ref={containerRef} className="bg-argus-bg w-full h-full min-h-[120px]">
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
});
