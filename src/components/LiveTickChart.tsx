import React, { useEffect, useRef, useState } from 'react';
import { WinGoIssue } from '../types';
import { Activity, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

interface LiveTickChartProps {
  issues: WinGoIssue[];
  isStreaming: boolean;
}

export const LiveTickChart: React.FC<LiveTickChartProps> = ({
  issues,
  isStreaming,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<'draws' | 'momentum'>('draws');
  const [sampleCount, setSampleCount] = useState<20 | 30 | 50>(30);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      try {
        if (!container || typeof container.getBoundingClientRect !== 'function' || !canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        if (width <= 0 || height <= 0) {
          animId = requestAnimationFrame(render);
          return;
        }

        if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
          canvas.width = width * dpr;
          canvas.height = height * dpr;
        }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Extract drawn numbers in chronological order (oldest to newest)
      const dataSlice = [...issues].reverse().slice(-sampleCount);
      const points = dataSlice.map((item) => {
        const num = parseInt(item.number, 10);
        return isNaN(num) ? 5 : num;
      });

      if (points.length < 2) {
        ctx.restore();
        animId = requestAnimationFrame(render);
        return;
      }

      const paddingLeft = 24;
      const paddingRight = 48;
      const paddingTop = 24;
      const paddingBottom = 32;
      const chartWidth = width - paddingLeft - paddingRight;
      const chartHeight = height - paddingTop - paddingBottom;

      const minVal = 0;
      const maxVal = 9;

      const getY = (val: number) => {
        return paddingTop + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;
      };

      const getX = (index: number) => {
        return paddingLeft + (index / (points.length - 1)) * chartWidth;
      };

      // 1. Draw Grid Lines (0, 2, 4, 6, 8, 9)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.08)';
      const levels = [0, 2, 4, 6, 8, 9];
      levels.forEach((lvl) => {
        const y = getY(lvl);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();

        ctx.fillStyle = '#666666';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lvl.toString(), width - paddingRight + 8, y + 3);
      });

      // 2. BIG / SMALL Divider Threshold at 4.5
      const midY = getY(4.5);
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, midY);
      ctx.lineTo(width - paddingRight, midY);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText('BIG / SMALL (4.5)', width - paddingRight + 4, midY - 4);
      ctx.restore();

      // 3. Shaded Background Zone for BIG (>=5) and SMALL (<5)
      ctx.fillStyle = 'rgba(0, 255, 65, 0.03)';
      ctx.fillRect(paddingLeft, paddingTop, chartWidth, midY - paddingTop);

      ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
      ctx.fillRect(paddingLeft, midY, chartWidth, paddingTop + chartHeight - midY);

      // 4. Draw Line Gradient Area
      ctx.beginPath();
      ctx.moveTo(getX(0), height - paddingBottom);
      points.forEach((val, i) => {
        ctx.lineTo(getX(i), getY(val));
      });
      ctx.lineTo(getX(points.length - 1), height - paddingBottom);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
      gradient.addColorStop(0, 'rgba(0, 255, 65, 0.25)');
      gradient.addColorStop(0.5, 'rgba(0, 229, 255, 0.12)');
      gradient.addColorStop(1, 'rgba(0, 255, 65, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // 5. Draw Main Draw Curve Line
      ctx.beginPath();
      points.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 2.4;
      ctx.stroke();

      // 6. Draw Moving Average (EMA-5) Line
      if (points.length >= 5) {
        ctx.beginPath();
        const period = 5;
        let started = false;
        for (let i = period - 1; i < points.length; i++) {
          const sum = points.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
          const ma = sum / period;
          const x = getX(i);
          const y = getY(ma);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.4;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 7. Draw Circles for Each Result Ball
      points.forEach((val, i) => {
        const x = getX(i);
        const y = getY(val);
        const isGreen = [1, 3, 7, 9].includes(val);
        const isRed = [2, 4, 6, 8].includes(val);
        const isViolet = val === 0 || val === 5;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);

        if (isViolet) {
          ctx.fillStyle = '#a855f7';
          ctx.shadowColor = '#a855f7';
        } else if (isGreen) {
          ctx.fillStyle = '#10b981';
          ctx.shadowColor = '#10b981';
        } else {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
        }
        ctx.shadowBlur = 6;
        ctx.fill();

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      // 8. Highlight Current Leading Head
      const lastIndex = points.length - 1;
      const headX = getX(lastIndex);
      const headVal = points[lastIndex];
      const headY = getY(headVal);

      // Pulse ring around current head
      const pulseRadius = 6 + Math.sin(Date.now() / 150) * 3;
      ctx.beginPath();
      ctx.arc(headX, headY, pulseRadius + 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Current Value Badge
      ctx.fillStyle = '#00FF41';
      ctx.beginPath();
      ctx.arc(headX, headY, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    } catch (err) {
      console.warn('LiveTickChart render suppressed:', err);
    }
  };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [issues, sampleCount]);

  const latestDrawnNum = issues.length > 0 ? issues[0].number : '-';
  const latestSize = issues.length > 0 ? (parseInt(issues[0].number, 10) >= 5 ? 'BIG' : 'SMALL') : '-';

  return (
    <div
      id="live-tick-chart-container"
      className="relative w-full bg-[#0A0A0A] border border-[#00FF41]/25 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Top Chart Header HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs font-semibold text-[#00FF41]">
            <Activity className={`w-3.5 h-3.5 ${isStreaming ? 'animate-pulse text-[#00FF41]' : 'text-slate-500'}`} />
            <span className="tracking-wider uppercase text-[10px] font-bold">
              WINGO 1M TRAJECTORY & OSCILLOGRAM
            </span>
          </div>
          <span className="text-xs text-[#888888] font-mono">
            LAST DIGIT: <strong className="text-white">#{latestDrawnNum} ({latestSize})</strong>
          </span>
        </div>

        {/* Sample Count Filter */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#070707] border border-[#222222] rounded p-0.5 text-[11px]">
            {([20, 30, 50] as const).map((cnt) => (
              <button
                key={cnt}
                id={`sample-count-${cnt}-btn`}
                onClick={() => setSampleCount(cnt)}
                className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
                  sampleCount === cnt
                    ? 'bg-[#00FF41] text-black font-bold'
                    : 'text-[#888888] hover:text-white'
                }`}
              >
                {cnt} DRAWS
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div ref={containerRef} className="relative w-full h-52 sm:h-60 md:h-64">
        <canvas id="matrix-tick-canvas" ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Sub-HUD Legend */}
      <div className="flex items-center justify-between text-[11px] text-[#888888] border-t border-[#1C1C1C] pt-2 mt-1 font-mono">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00FF41] shadow-[0_0_4px_#00FF41]"></span>
            <span>Digit Trajectory (0-9)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]"></span>
            <span>MA-5 Trend</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
            <span>Big/Small Midpoint (4.5)</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[#00FF41]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px] tracking-wider uppercase font-semibold">AR-LOTTERY01 API LIVE</span>
        </div>
      </div>
    </div>
  );
};

