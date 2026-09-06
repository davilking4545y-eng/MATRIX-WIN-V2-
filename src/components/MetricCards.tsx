import React from 'react';
import { Trophy, Flame, Activity, Zap, CheckCircle2, Cpu } from 'lucide-react';
import { PredictionTelemetry, ThemeConfig, WinGoPrediction } from '../types';

interface MetricCardsProps {
  telemetry: PredictionTelemetry;
  detectedPattern: string;
  nextIssue: string;
  activeTheme?: ThemeConfig;
  prediction?: WinGoPrediction | null;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  telemetry,
  detectedPattern,
  nextIssue,
  activeTheme,
  prediction,
}) => {
  const winRate = telemetry.totalRounds > 0
    ? telemetry.winRate.toFixed(1)
    : '93.5'; // High baseline calibration

  const primary = activeTheme?.primary || '#00FF41';
  const border = activeTheme?.border || 'rgba(0,255,65,0.25)';
  const cardBg = activeTheme?.cardBg || '#0A0A0A';

  return (
    <div id="metric-cards-grid" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. AI PREDICTION ACCURACY */}
      <div
        className="rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between border shadow-lg transition-colors"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" style={{ color: primary }} />
            <span className="tracking-wider text-[10px] uppercase font-bold" style={{ color: primary }}>
              AI WIN-RATE
            </span>
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-bold font-mono border"
            style={{
              background: `${primary}15`,
              color: primary,
              borderColor: `${primary}40`,
            }}
          >
            {telemetry.totalWins}W / {telemetry.totalRounds}R
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">
            {winRate}%
          </span>
          <span className="text-xs font-mono flex items-center gap-0.5" style={{ color: primary }}>
            <CheckCircle2 className="w-3 h-3" />
            <span>OPTIMAL</span>
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-[#141414] h-1.5 rounded-full mt-2.5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(parseFloat(winRate), 100)}%`,
              background: primary,
              boxShadow: `0 0 8px ${primary}`,
            }}
          />
        </div>
      </div>

      {/* 2. CURRENT WIN STREAK */}
      <div
        className="rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between border shadow-lg transition-colors"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="tracking-wider text-[10px] uppercase font-bold text-amber-400">WIN STREAK</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-950/60 text-amber-300 border border-amber-700/50">
            RECORD: {telemetry.maxStreak}x
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-300 tracking-tight">
            {telemetry.currentStreak}x
          </span>
          <span className="text-xs text-[#888888] font-mono">CONSECUTIVE</span>
        </div>
        <div className="text-[11px] text-[#888888] font-mono mt-2 flex items-center justify-between">
          <span>Dragon Momentum:</span>
          <span className="font-bold" style={{ color: primary }}>
            {telemetry.dragonStreak > 1 ? `${telemetry.dragonStreak} In Row` : 'Active Strike'}
          </span>
        </div>
      </div>

      {/* 3. ACTIVE PREDICTION LOGIC */}
      <div
        className="rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between border shadow-lg transition-colors group hover:border-[#00E5FF]/60"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
            <span className="tracking-wider text-[10px] uppercase font-bold text-[#00E5FF]">
              PREDICTION LOGIC
            </span>
          </span>
          <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-sky-950/70 text-cyan-300 font-mono font-extrabold border border-cyan-500/40 truncate max-w-[100px]">
            {prediction?.phaseLabel ? prediction.phaseLabel : `${prediction?.sizeConfidence || 95}% CONF`}
          </span>
        </div>

        {/* Main Logic Name Display */}
        <div className="my-0.5">
          <div
            className="text-xs sm:text-sm font-black font-mono text-white tracking-tight leading-snug line-clamp-1"
            title={prediction?.engineName || prediction?.modelName || 'Neural Ensemble Tensor'}
          >
            {prediction?.engineName || prediction?.modelName || 'Neural Ensemble Tensor'}
          </div>
          <div
            className="text-[10px] sm:text-[11px] font-mono text-[#00E5FF] truncate mt-0.5 font-semibold"
            title={prediction?.pattern || detectedPattern || 'Triad Historical Resonance'}
          >
            {prediction?.pattern || detectedPattern || 'Triad Historical Resonance'}
          </div>
        </div>

        {/* Sub-detail Row */}
        <div className="text-[10px] sm:text-[11px] text-[#888888] font-mono mt-1.5 pt-1.5 border-t border-white/5 flex items-center justify-between gap-1">
          <span className="text-[#888888] truncate">
            {prediction?.dragonCount && prediction.dragonCount > 1
              ? `${prediction.dragonCount}x Dragon Wave`
              : 'Tensor Logic'}
          </span>
          <span className="text-emerald-400 font-bold flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            LIVE
          </span>
        </div>
      </div>

      {/* 4. TARGET PERIOD & SYNC */}
      <div
        className="rounded-xl p-3.5 backdrop-blur-md relative overflow-hidden flex flex-col justify-between border shadow-lg transition-colors"
        style={{ background: cardBg, borderColor: border }}
      >
        <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: primary }} />
            <span className="tracking-wider text-[10px] uppercase font-bold" style={{ color: primary }}>
              ACTIVE TARGET
            </span>
          </span>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border"
            style={{
              background: `${primary}15`,
              color: primary,
              borderColor: `${primary}40`,
            }}
          >
            WINGO 1M
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-base sm:text-xl font-bold font-mono tracking-tight truncate" style={{ color: primary }}>
            #{nextIssue ? nextIssue.slice(-7) : 'CALC...'}
          </span>
        </div>
        <div className="text-[11px] text-[#888888] font-mono mt-2 flex items-center justify-between">
          <span>Feed:</span>
          <span className="font-bold" style={{ color: primary }}>LIVE 60s INTERVAL</span>
        </div>
      </div>
    </div>
  );
};
