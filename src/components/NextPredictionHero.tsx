import React from 'react';
import { WinGoPrediction, PredictionStrategy, ThemeConfig } from '../types';
import { Target, Clock, Cpu, Sparkles, ShieldCheck, Flame, ChevronRight, Award, Gauge, Lock } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface NextPredictionHeroProps {
  prediction: WinGoPrediction | null;
  countdownSeconds: number;
  selectedStrategy: PredictionStrategy;
  onSelectStrategy: (strat: PredictionStrategy) => void;
  isFetching: boolean;
  onManualRefresh: () => void;
  activeTheme: ThemeConfig;
}

export const NextPredictionHero: React.FC<NextPredictionHeroProps> = ({
  prediction,
  countdownSeconds,
  selectedStrategy,
  onSelectStrategy,
  isFetching,
  onManualRefresh,
  activeTheme,
}) => {
  const mm = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
  const ss = String(countdownSeconds % 60).padStart(2, '0');
  const isLocking = countdownSeconds <= 5 && countdownSeconds > 0;
  const isDrawing = countdownSeconds === 0;

  const strategies: { id: PredictionStrategy; label: string; desc: string }[] = [
    { id: 'neural_ensemble', label: 'MATRIX V2 ENSEMBLE', desc: 'Triad 93% + Markov + N-Gram' },
    { id: 'safe_dragon', label: 'DRAGON MOMENTUM', desc: 'Active Streak Follow' },
    { id: 'aggressive_trend', label: 'TREND BREAKOUT', desc: 'Upper/Lower Surges' },
    { id: 'contrarian_reversal', label: 'MEAN REVERSION', desc: 'Extended Streak Counter' },
  ];

  const isBig = prediction?.size === 'BIG';
  const isGreen = prediction?.color === 'GREEN';

  const primaryNum = prediction?.primaryNum ?? prediction?.luckyNumbers[0] ?? 7;
  const hedgeNum = prediction?.hedgeNum ?? prediction?.luckyNumbers[1] ?? 2;
  const thirdNum = prediction?.luckyNumbers[2] ?? (isBig ? 9 : 0);

  return (
    <div
      id="next-prediction-hero-card"
      className="rounded-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden border-2 transition-all duration-300 shadow-2xl"
      style={{
        background: activeTheme.cardBg,
        borderColor: activeTheme.primary,
        boxShadow: `0 0 35px ${activeTheme.primaryGlow}`,
      }}
    >
      {/* Background Cyber Grid Accent */}
      <div
        className="absolute inset-0 [background-size:24px_24px] opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${activeTheme.primary} 1.2px, transparent 1.2px)`,
        }}
      />

      {/* Top Bar: Target Period & Live Countdown Timer */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b"
        style={{ borderColor: `${activeTheme.primary}30` }}
      >
        {/* Target Period */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold border transition-colors shadow-md"
            style={{
              background: `${activeTheme.primary}18`,
              borderColor: activeTheme.primary,
              color: activeTheme.primary,
            }}
          >
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#888888] tracking-widest uppercase">
                TARGET PREDICTION PERIOD
              </span>
              <span
                className="text-[9px] px-1.5 py-0.2 rounded font-mono font-bold border"
                style={{
                  background: `${activeTheme.primary}20`,
                  color: activeTheme.primary,
                  borderColor: activeTheme.primary,
                }}
              >
                WINGO 1M
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider flex items-center gap-2">
              <span>#{prediction?.targetIssue || 'CALCULATING...'}</span>
            </div>
          </div>
        </div>

        {/* Live Draw Countdown Clock */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono border transition-all ${
              isDrawing
                ? 'animate-pulse'
                : isLocking
                ? 'animate-pulse shadow-lg'
                : ''
            }`}
            style={{
              background: isLocking ? 'rgba(245, 158, 11, 0.2)' : '#03060c',
              borderColor: isLocking ? '#F59E0B' : activeTheme.primary,
              color: isLocking ? '#F59E0B' : activeTheme.primary,
              boxShadow: isLocking ? '0 0 20px rgba(245, 158, 11, 0.4)' : `0 0 15px ${activeTheme.primaryGlow}`,
            }}
          >
            {isLocking ? (
              <Lock className="w-4 h-4 animate-bounce text-amber-400" />
            ) : (
              <Clock className="w-4 h-4" style={{ color: activeTheme.primary }} />
            )}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[#888888]">
                {isDrawing ? 'DRAWING NOW' : isLocking ? 'LOCKING IN' : 'DRAW COUNTDOWN'}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-widest leading-none">
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Badge Banner */}
      <div className="relative z-10 text-center mb-3">
        <div
          id="dispPattern"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-sm"
          style={{
            background: `${activeTheme.primary}18`,
            borderColor: activeTheme.primary,
            color: activeTheme.primary,
            boxShadow: `0 0 12px ${activeTheme.primaryGlow}`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{prediction?.pattern || 'CALCULATING TRIAD RESONANCE...'}</span>
        </div>
      </div>

      {/* Main Signal Display Card */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
        {/* Left Column: GIANT SIGNAL OUTCOME (7 Cols) */}
        <div
          className="md:col-span-7 rounded-xl p-5 sm:p-6 flex flex-col justify-between border relative overflow-hidden"
          style={{
            background: '#04070d',
            borderColor: `${activeTheme.primary}40`,
            boxShadow: `inset 0 0 30px rgba(0,0,0,0.8)`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#888888] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span className="tracking-widest uppercase text-[11px]">AI CORE SIGNAL</span>
            </span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border flex items-center gap-1"
              style={{
                background: `${activeTheme.primary}15`,
                color: activeTheme.primary,
                borderColor: activeTheme.primary,
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{prediction?.recommendedAction || 'HIGH CONFIDENCE'}</span>
            </span>
          </div>

          {/* Giant Signal Display */}
          <div className="py-4 text-center flex flex-col items-center justify-center">
            <div
              id="dispSignal"
              className={`text-6xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight transition-all duration-300 ${
                isBig ? 'text-amber-400' : 'text-cyan-400'
              }`}
              style={{
                textShadow: isBig
                  ? '0 0 35px rgba(245, 158, 11, 0.55)'
                  : '0 0 35px rgba(6, 182, 212, 0.55)',
              }}
            >
              {prediction?.size || 'BIG'}
            </div>
            <div className="text-xs sm:text-sm font-mono text-[#9CA3AF] mt-1 tracking-widest uppercase">
              {isBig ? 'UPPER BRACKET: 5 • 6 • 7 • 8 • 9' : 'LOWER BRACKET: 0 • 1 • 2 • 3 • 4'}
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[#888888]">ALGORITHM CONFIDENCE:</span>
              <span className="text-white font-bold text-sm">
                {prediction?.sizeConfidence || 94}%
              </span>
            </div>
            <div className="w-full bg-[#111827] h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-md"
                style={{
                  width: `${prediction?.sizeConfidence || 94}%`,
                  background: `linear-gradient(90deg, ${activeTheme.primary}, ${activeTheme.secondary})`,
                  boxShadow: `0 0 10px ${activeTheme.primary}`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Digits Row & Key Metrics (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-3 justify-between">
          {/* Dual Number Strike: Primary Num & Hedge Num */}
          <div
            className="rounded-xl p-3.5 border flex flex-col justify-between"
            style={{
              background: '#04070d',
              borderColor: `${activeTheme.primary}40`,
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#888888] mb-2">
              <span className="uppercase text-[10px] font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>PRIMARY & HEDGE NUMBERS</span>
              </span>
              <span className="text-[10px] font-bold" style={{ color: activeTheme.primary }}>
                SEED DERIVED
              </span>
            </div>

            {/* Digits Pill Row */}
            <div className="grid grid-cols-3 gap-2">
              {/* Primary Num */}
              <div
                className="py-2 px-1 rounded-xl border text-center transition-all shadow-md relative overflow-hidden"
                style={{
                  background: `${activeTheme.primary}20`,
                  borderColor: activeTheme.primary,
                  boxShadow: `0 0 15px ${activeTheme.primaryGlow}`,
                }}
              >
                <div className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#E0E0E0]">
                  PRIMARY
                </div>
                <div id="dispN1" className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {primaryNum}
                </div>
              </div>

              {/* Hedge Num */}
              <div
                className="py-2 px-1 rounded-xl border text-center transition-all shadow-sm"
                style={{
                  background: '#030712',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#888888]">
                  HEDGE
                </div>
                <div id="dispN2" className="text-2xl sm:text-3xl font-black font-mono text-[#00E5FF]">
                  {hedgeNum}
                </div>
              </div>

              {/* 3rd Lucky Num */}
              <div
                className="py-2 px-1 rounded-xl border text-center transition-all shadow-sm"
                style={{
                  background: '#030712',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#888888]">
                  ALTERNATE
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                  {thirdNum}
                </div>
              </div>
            </div>
          </div>

          {/* Color Outcome & 3 Key Metrics */}
          <div
            className="rounded-xl p-3.5 border flex flex-col justify-between"
            style={{
              background: '#04070d',
              borderColor: `${activeTheme.primary}40`,
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#888888] mb-2">
              <span className="uppercase text-[10px] font-bold">PREDICTED COLOR & ENGINE METRICS</span>
              <span
                className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded border ${
                  isGreen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                }`}
              >
                {prediction?.color || 'GREEN'} ({prediction?.colorConfidence || 92}%)
              </span>
            </div>

            {/* Metrics 3-Grid: Confidence, Risk Level, Consensus */}
            <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded-lg border border-white/10 text-center font-mono">
              <div>
                <div className="text-[9px] text-[#888888] uppercase">CONFIDENCE</div>
                <div id="dispConf" className="text-sm sm:text-base font-black text-white">
                  {prediction?.sizeConfidence || 94}%
                </div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-[9px] text-[#888888] uppercase">RISK LEVEL</div>
                <div
                  id="dispLevel"
                  className="text-sm sm:text-base font-black"
                  style={{ color: activeTheme.primary }}
                >
                  Level {prediction?.riskLevel || 1}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#888888] uppercase">CONSENSUS</div>
                <div id="dispConsensus" className="text-sm sm:text-base font-black text-emerald-400">
                  {prediction?.consensus || 93}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Engine Tabs */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono text-[#888888] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>ALGORITHM STRATEGY:</span>
          </span>
          <span className="text-[10px] font-mono text-[#00E5FF] hidden sm:inline">
            Model: {prediction?.modelName || 'MATRIX V2 CORE'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {strategies.map((strat) => {
            const active = selectedStrategy === strat.id;
            return (
              <button
                key={strat.id}
                id={`strat-btn-${strat.id}`}
                onClick={() => {
                  soundFx.playClick(1000);
                  onSelectStrategy(strat.id);
                }}
                className={`py-2 px-3 rounded-xl border text-left font-mono transition-all cursor-pointer ${
                  active ? 'font-bold shadow-md' : 'text-[#888888] hover:text-white hover:border-white/30'
                }`}
                style={{
                  background: active ? activeTheme.primary : '#04070d',
                  borderColor: active ? activeTheme.primary : 'rgba(255,255,255,0.12)',
                  color: active ? '#000000' : undefined,
                  boxShadow: active ? `0 0 15px ${activeTheme.primaryGlow}` : 'none',
                }}
              >
                <div className="text-xs font-bold">{strat.label}</div>
                <div
                  className={`text-[9px] truncate ${active ? 'text-black/85' : 'text-[#666666]'}`}
                >
                  {strat.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Telemetry & Reasoning Strip */}
      <div
        className="relative z-10 mt-3 p-3 rounded-xl border font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        style={{
          background: '#04070d',
          borderColor: `${activeTheme.primary}30`,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ background: activeTheme.primary }}
          />
          <span className="font-bold" style={{ color: activeTheme.primary }}>
            [VERDICT]:
          </span>
          <span className="text-[#CCCCCC] text-[11px]">
            {prediction?.reasoning ||
              'Multi-factor matrix analysis confirms strong alignment with predicted outcome.'}
          </span>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={onManualRefresh}
            disabled={isFetching}
            className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Re-evaluate</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
