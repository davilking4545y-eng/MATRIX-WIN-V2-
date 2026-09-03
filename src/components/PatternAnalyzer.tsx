import React, { useState } from 'react';
import { WinGoIssue, ThemeConfig } from '../types';
import { BarChart3, ShieldCheck, Calculator, Sparkles, PieChart, TrendingUp } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface PatternAnalyzerProps {
  issues: WinGoIssue[];
  latestIssue: string;
  activeTheme?: ThemeConfig;
}

export const PatternAnalyzer: React.FC<PatternAnalyzerProps> = ({
  issues,
  latestIssue,
  activeTheme,
}) => {
  const [baseUnit, setBaseUnit] = useState<number>(10);
  const primary = activeTheme?.primary || '#00FF41';
  const border = activeTheme?.border || 'rgba(0,255,65,0.25)';
  const cardBg = activeTheme?.cardBg || '#0A0A0A';

  // Calculate digit frequency 0-9
  const digitCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  let bigCount = 0;
  let smallCount = 0;
  let greenCount = 0;
  let redCount = 0;
  let violetCount = 0;

  issues.forEach((item) => {
    const num = parseInt(item.number, 10);
    if (!isNaN(num) && num >= 0 && num <= 9) {
      digitCounts[num] = (digitCounts[num] || 0) + 1;
      if (num >= 5) bigCount++;
      else smallCount++;

      const col = item.color.toLowerCase();
      if (col.includes('green')) greenCount++;
      if (col.includes('red')) redCount++;
      if (col.includes('violet')) violetCount++;
    }
  });

  const total = issues.length || 1;
  const bigPercent = Math.round((bigCount / total) * 100);
  const smallPercent = 100 - bigPercent;

  // Find hottest and coldest number
  let maxCount = -1;
  let hotNum = 7;
  let minCount = 9999;
  let coldNum = 2;

  Object.entries(digitCounts).forEach(([k, v]) => {
    const n = parseInt(k, 10);
    if (v > maxCount) {
      maxCount = v;
      hotNum = n;
    }
    if (v < minCount) {
      minCount = v;
      coldNum = n;
    }
  });

  return (
    <div
      id="pattern-analyzer-card"
      className="rounded-xl p-4 backdrop-blur-md flex flex-col justify-between shadow-xl transition-colors border"
      style={{ background: cardBg, borderColor: border }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border"
          style={{
            background: `${primary}15`,
            borderColor: `${primary}35`,
            color: primary,
          }}
        >
          <BarChart3 className="w-3.5 h-3.5" style={{ color: primary }} />
          <span className="tracking-wider uppercase text-[10px] font-bold">
            WINGO 1M FREQUENCY MATRIX & RISK ADVISOR
          </span>
        </div>
        <div className="text-[11px] text-[#888888] font-mono">
          SAMPLE: <strong className="text-white">{issues.length} DRAWS</strong>
        </div>
      </div>

      {/* 1. DIGIT FREQUENCY GRID (0 to 9) */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#888888] mb-2">
          <span className="uppercase text-[10px] font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>0-9 NUMBER MOMENTUM</span>
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span>HOT: <strong className="text-[#00FF41]">#{hotNum}</strong></span>
            <span>COLD: <strong className="text-[#38bdf8]">#{coldNum}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => {
            const count = digitCounts[digit] || 0;
            const isHot = digit === hotNum && count > 0;
            const isCold = digit === coldNum && issues.length >= 10;
            const isGreen = [1, 3, 7, 9].includes(digit);
            const isRed = [2, 4, 6, 8].includes(digit);
            const isViolet = digit === 0 || digit === 5;

            return (
              <div
                key={digit}
                className={`p-2 rounded-lg border text-center font-mono flex flex-col items-center justify-between transition-transform hover:scale-105 ${
                  isHot
                    ? 'bg-[#00FF41]/15 border-[#00FF41] text-[#00FF41] shadow-[0_0_10px_rgba(0,255,65,0.3)]'
                    : isCold
                    ? 'bg-sky-950/40 border-sky-600/40 text-sky-300'
                    : 'bg-[#070707] border-[#1A1A1A] text-[#CCCCCC]'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm font-black text-white">{digit}</span>
                  {isViolet && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  {isGreen && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {isRed && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                </div>
                <div className="text-[10px] text-[#888888] font-bold mt-1">
                  {count}x
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BIG VS SMALL DISTRIBUTION GAUGE */}
      <div className="p-3 rounded-lg bg-[#070707] border border-[#1A1A1A] font-mono text-xs mb-3">
        <div className="flex items-center justify-between text-xs text-[#888888] mb-2">
          <span className="flex items-center gap-1 font-bold">
            <PieChart className="w-3 h-3 text-[#00E5FF]" />
            <span>SIZE RATIO: BIG ({bigCount}) vs SMALL ({smallCount})</span>
          </span>
          <span className="text-[10px] text-[#00FF41] font-bold">
            {bigPercent > smallPercent ? 'BIG BIAS' : 'SMALL BIAS'}
          </span>
        </div>

        {/* Dual Color Progress Bar */}
        <div className="w-full bg-[#141414] h-3 rounded-full overflow-hidden flex border border-[#222222]">
          <div
            className="bg-[#00FF41] h-full transition-all duration-500 text-[8px] font-bold text-black flex items-center justify-center"
            style={{ width: `${bigPercent}%` }}
          >
            {bigPercent >= 15 ? `BIG ${bigPercent}%` : ''}
          </div>
          <div
            className="bg-[#00E5FF] h-full transition-all duration-500 text-[8px] font-bold text-black flex items-center justify-center"
            style={{ width: `${smallPercent}%` }}
          >
            {smallPercent >= 15 ? `SMALL ${smallPercent}%` : ''}
          </div>
        </div>
      </div>

      {/* 3. 3X SAFE STAKE ASSISTANT (Martingale Recovery Formula) */}
      <div className="p-3 rounded-lg bg-[#070707] border border-[#00FF41]/20 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-white font-bold text-[11px]">
            <Calculator className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="text-[#00FF41] uppercase tracking-wider text-[10px]">
              SMART 3X STAKE RECOVERY ASSISTANT
            </span>
          </span>
          <div className="flex items-center gap-1 text-[10px] text-[#888888]">
            <span>BASE UNIT:</span>
            <select
              value={baseUnit}
              onChange={(e) => {
                soundFx.playClick();
                setBaseUnit(Number(e.target.value));
              }}
              className="bg-[#0E0E0E] border border-[#222222] text-[#00FF41] rounded px-1.5 py-0.5 focus:outline-none"
            >
              <option value={10}>$10</option>
              <option value={20}>$20</option>
              <option value={50}>$50</option>
              <option value={100}>$100</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
          <div className="bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <div className="text-[#888888] text-[9px]">LEVEL 1 (BASE)</div>
            <div className="text-white font-bold text-sm mt-0.5">${baseUnit}</div>
            <div className="text-[#00FF41] text-[9px] mt-0.5">Primary Entry</div>
          </div>
          <div className="bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <div className="text-[#888888] text-[9px]">LEVEL 2 (3X)</div>
            <div className="text-amber-300 font-bold text-sm mt-0.5">${baseUnit * 3}</div>
            <div className="text-[#888888] text-[9px] mt-0.5">Recover + Profit</div>
          </div>
          <div className="bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <div className="text-[#888888] text-[9px]">LEVEL 3 (9X)</div>
            <div className="text-rose-400 font-bold text-sm mt-0.5">${baseUnit * 9}</div>
            <div className="text-[#888888] text-[9px] mt-0.5">Surge Defense</div>
          </div>
          <div className="bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
            <div className="text-[#888888] text-[9px]">LEVEL 4 (27X)</div>
            <div className="text-purple-400 font-bold text-sm mt-0.5">${baseUnit * 27}</div>
            <div className="text-[#888888] text-[9px] mt-0.5">Max Lock</div>
          </div>
        </div>
      </div>
    </div>
  );
};
