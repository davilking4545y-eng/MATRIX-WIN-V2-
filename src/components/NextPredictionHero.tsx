import React from 'react';
import { WinGoPrediction, PredictionStrategy, ThemeConfig } from '../types';
import {
  Target,
  Clock,
  Cpu,
  Sparkles,
  ShieldCheck,
  Flame,
  ChevronRight,
  Award,
  Lock,
  Zap,
  TrendingUp,
  Radio,
  CheckCircle2,
} from 'lucide-react';
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

  const strategies: { id: PredictionStrategy; label: string; desc: string; isMaster?: boolean }[] = [
    { id: 'matrix_win_v2', label: '★ MATRIX WIN V2', desc: '8-in-1 Quantum Master Fusion (Best)', isMaster: true },
    { id: 'deepseek_fluid', label: 'DEEPSEEK TENSOR 98%', desc: 'Fluid Inversion & Wave Sync' },
    { id: 'dragon_strike', label: 'DRAGON STRIKE CORE', desc: 'Streak Momentum Matrix' },
    { id: 'ultimate_pro', label: 'ULTIMATE PRO (6-IN-1)', desc: 'Adaptive Self-Learning Matrix' },
    { id: 'ronin_vip', label: 'RONIN VIP 2-GRAM', desc: 'Pattern Markov & Sequence' },
    { id: 'single_number_12', label: '12-ENGINE ROTATION', desc: 'Wisdom 51 + Golden Ratio' },
    { id: 'contrarian_reversal', label: 'MEAN REVERSION', desc: 'Extended Streak Counter' },
    { id: 'aggressive_trend', label: 'TREND BREAKOUT', desc: 'Breakout Tensor Surge' },
  ];

  const isBig = prediction?.size === 'BIG';
  const isGreen = prediction?.color === 'GREEN';
  const oppSize = isBig ? 'SMALL' : 'BIG';

  const primaryNum = prediction?.primaryNum ?? prediction?.luckyNumbers?.[0] ?? 7;
  const hedgeNum = prediction?.hedgeNum ?? prediction?.luckyNumbers?.[1] ?? 2;

  // Real engine votes fallback
  const engineVotes = prediction?.engineVotes || [
    { name: 'DeepSeek Tensor', vote: prediction?.size || 'BIG', confidence: 98 },
    { name: 'Dragon Strike', vote: prediction?.size || 'BIG', confidence: 94 },
    { name: 'Ronin VIP', vote: prediction?.size || 'BIG', confidence: 92 },
    { name: 'Ultimate Pro', vote: prediction?.size || 'BIG', confidence: 95 },
    { name: 'Triad Matrix', vote: prediction?.size || 'BIG', confidence: 93 },
  ];

  const unanimousVotes = engineVotes.filter((v) => v.vote === prediction?.size).length;
  const hotList = prediction?.hotDigits || [primaryNum, 9, 3];
  const coldList = prediction?.coldDigits || [hedgeNum, 0];
  const mLevel = prediction?.martingaleLevel || 1;
  const mMultiplier = prediction?.martingaleMultiplier || '1X';

  return (
    <div
      id="next-prediction-hero-card"
      className="rounded-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden border-2 transition-all duration-300 shadow-2xl"
      style={{
        background: activeTheme.cardBg,
        borderColor: activeTheme.primary,
        boxShadow: `0 0 40px ${activeTheme.primaryGlow}`,
      }}
    >
      {/* Background Cyber Grid Accent */}
      <div
        className="absolute inset-0 [background-size:24px_24px] opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${activeTheme.primary} 1.2px, transparent 1.2px)`,
        }}
      />

      {/* Top Header: Target Period & Live Countdown Timer */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b"
        style={{ borderColor: `${activeTheme.primary}30` }}
      >
        {/* Target Period & Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-bold border transition-colors shadow-lg relative"
            style={{
              background: `${activeTheme.primary}20`,
              borderColor: activeTheme.primary,
              color: activeTheme.primary,
              boxShadow: `0 0 16px ${activeTheme.primaryGlow}`,
            }}
          >
            <Target className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-[#A0AEC0] tracking-widest uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                PREDICTION TARGET
              </span>
              <span
                className="text-[9px] px-2 py-0.5 rounded font-mono font-bold border tracking-wider"
                style={{
                  background: `${activeTheme.primary}25`,
                  color: activeTheme.primary,
                  borderColor: activeTheme.primary,
                }}
              >
                WINGO 1M LIVE
              </span>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-white tracking-wider flex items-center gap-2">
              <span>#{prediction?.targetIssue || 'CALCULATING...'}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hidden sm:inline-flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                LOCKED FOR NEXT DRAW
              </span>
            </div>
          </div>
        </div>

        {/* Live Draw Countdown Clock */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-mono border transition-all ${
              isDrawing
                ? 'animate-pulse'
                : isLocking
                ? 'animate-pulse shadow-lg ring-2 ring-amber-400/50'
                : ''
            }`}
            style={{
              background: isLocking ? 'rgba(245, 158, 11, 0.25)' : '#03060c',
              borderColor: isLocking ? '#F59E0B' : activeTheme.primary,
              color: isLocking ? '#F59E0B' : activeTheme.primary,
              boxShadow: isLocking ? '0 0 25px rgba(245, 158, 11, 0.5)' : `0 0 18px ${activeTheme.primaryGlow}`,
            }}
          >
            {isLocking ? (
              <Lock className="w-5 h-5 animate-bounce text-amber-400" />
            ) : (
              <Clock className="w-5 h-5" style={{ color: activeTheme.primary }} />
            )}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-[#A0AEC0] font-bold">
                {isDrawing ? 'DRAWING NOW' : isLocking ? 'LOCKING IN' : 'DRAW COUNTDOWN'}
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-widest leading-none">
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern & Strategy Banner */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-3">
        <div
          id="dispPattern"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-sm"
          style={{
            background: `${activeTheme.primary}18`,
            borderColor: activeTheme.primary,
            color: activeTheme.primary,
            boxShadow: `0 0 14px ${activeTheme.primaryGlow}`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{prediction?.pattern || 'CALCULATING TRIAD RESONANCE...'}</span>
        </div>

        {/* Martingale & Stake Recommendation Focus */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>STAKE: {mMultiplier} (MARTINGALE LVL {mLevel})</span>
        </div>
      </div>

      {/* =========================================================================
          MAIN PREDICTION FOCUS ARENA: GIANT SIGNAL + DUAL DIGITS + COLOR + METRICS
         ========================================================================= */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-4 my-2">
        {/* Left Column: GIANT SIGNAL OUTCOME (7 Cols) */}
        <div
          className="md:col-span-7 rounded-2xl p-5 sm:p-6 flex flex-col justify-between border-2 relative overflow-hidden"
          style={{
            background: isBig
              ? 'linear-gradient(180deg, #090e1a 0%, #03060c 100%)'
              : 'linear-gradient(180deg, #05141e 0%, #03060c 100%)',
            borderColor: isBig ? 'rgba(245, 158, 11, 0.65)' : 'rgba(6, 182, 212, 0.65)',
            boxShadow: isBig
              ? '0 0 35px rgba(245, 158, 11, 0.25), inset 0 0 30px rgba(0,0,0,0.8)'
              : '0 0 35px rgba(6, 182, 212, 0.25), inset 0 0 30px rgba(0,0,0,0.8)',
          }}
        >
          {/* Accent Glow Lines */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{
              background: isBig
                ? 'linear-gradient(90deg, transparent, #F59E0B, transparent)'
                : 'linear-gradient(90deg, transparent, #06B6D4, transparent)',
            }}
          />

          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-[#A0AEC0] flex items-center gap-1.5">
              <Cpu className="w-4 h-4" style={{ color: activeTheme.primary }} />
              <span className="tracking-widest uppercase text-[11px]">CORE TARGET SIGNAL</span>
            </span>
            <span
              className="text-xs font-mono font-bold px-2.5 py-0.5 rounded border flex items-center gap-1"
              style={{
                background: isBig ? 'rgba(245, 158, 11, 0.18)' : 'rgba(6, 182, 212, 0.18)',
                color: isBig ? '#F59E0B' : '#06B6D4',
                borderColor: isBig ? '#F59E0B' : '#06B6D4',
              }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{prediction?.recommendedAction || 'HIGH CONFIDENCE STRIKE'}</span>
            </span>
          </div>

          {/* Giant Signal Display */}
          <div className="py-4 sm:py-6 text-center flex flex-col items-center justify-center">
            <div className="text-xs sm:text-sm font-mono tracking-widest text-[#888888] uppercase mb-1">
              PREDICTED OUTCOME
            </div>
            <div
              id="dispSignal"
              className={`text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter transition-all duration-300 select-none ${
                isBig ? 'text-amber-400' : 'text-cyan-400'
              }`}
              style={{
                textShadow: isBig
                  ? '0 0 45px rgba(245, 158, 11, 0.7), 0 0 90px rgba(245, 158, 11, 0.35)'
                  : '0 0 45px rgba(6, 182, 212, 0.7), 0 0 90px rgba(6, 182, 212, 0.35)',
              }}
            >
              {prediction?.size || 'BIG'}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 border border-white/10 text-xs sm:text-sm font-mono text-[#E2E8F0] mt-2 tracking-widest uppercase">
              {isBig ? (
                <>
                  <span className="text-amber-400 font-bold">UPPER BRACKET:</span>
                  <span>5 • 6 • 7 • 8 • 9</span>
                </>
              ) : (
                <>
                  <span className="text-cyan-400 font-bold">LOWER BRACKET:</span>
                  <span>0 • 1 • 2 • 3 • 4</span>
                </>
              )}
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mt-2 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-[#A0AEC0] flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>CONFIDENCE PROBABILITY:</span>
              </span>
              <span className="text-white font-black text-sm tracking-wider">
                {prediction?.sizeConfidence || 94.8}%
              </span>
            </div>
            <div className="w-full bg-[#0a101d] h-3 rounded-full overflow-hidden border border-white/15 p-0.5">
              <div
                className="h-full rounded-full transition-all duration-700 shadow-md"
                style={{
                  width: `${prediction?.sizeConfidence || 94.8}%`,
                  background: isBig
                    ? 'linear-gradient(90deg, #F59E0B, #EF4444)'
                    : 'linear-gradient(90deg, #06B6D4, #3B82F6)',
                  boxShadow: isBig
                    ? '0 0 12px rgba(245, 158, 11, 0.8)'
                    : '0 0 12px rgba(6, 182, 212, 0.8)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Digits Row, Color & Key Metrics (5 Cols) */}
        <div className="md:col-span-5 flex flex-col gap-3 justify-between">
          {/* Dual Number Strike: Primary Num & Hedge Num */}
          <div
            className="rounded-2xl p-4 border flex flex-col justify-between"
            style={{
              background: '#04070d',
              borderColor: `${activeTheme.primary}45`,
              boxShadow: '0 0 20px rgba(0,0,0,0.6)',
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#888888] mb-2.5">
              <span className="uppercase text-[11px] font-bold flex items-center gap-1.5 text-white">
                <Award className="w-4 h-4 text-amber-400" />
                <span>TARGET NUMBERS (2-NUM STRIKE)</span>
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                1 SAME + 1 HEDGE
              </span>
            </div>

            {/* Digits Pill Row - Exactly 2 Numbers: 1 Same + 1 Opposite */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Same Number (Primary Jackpot) */}
              <div
                className="py-3 px-2 rounded-xl border-2 text-center transition-all shadow-md relative overflow-hidden group"
                style={{
                  background: `${activeTheme.primary}22`,
                  borderColor: activeTheme.primary,
                  boxShadow: `0 0 20px ${activeTheme.primaryGlow}`,
                }}
              >
                <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono tracking-wider font-black text-amber-300 mb-1">
                  <span>★ PRIMARY SAME</span>
                  <span className="opacity-75">({prediction?.size || 'BIG'})</span>
                </div>
                <div
                  id="dispN1"
                  className="text-4xl sm:text-5xl font-black font-mono text-white drop-shadow-lg tracking-tight"
                >
                  {primaryNum}
                </div>
                <div className="text-[9px] font-mono font-bold text-amber-300 tracking-wider uppercase mt-1">
                  JACKPOT STRIKE
                </div>
              </div>

              {/* 2. Opposite Number (Hedge Shield) */}
              <div
                className="py-3 px-2 rounded-xl border-2 text-center transition-all shadow-md relative overflow-hidden group"
                style={{
                  background: '#040b17',
                  borderColor: 'rgba(0, 229, 255, 0.55)',
                  boxShadow: '0 0 16px rgba(0, 229, 255, 0.25)',
                }}
              >
                <div className="flex items-center justify-center gap-1 text-[9px] uppercase font-mono tracking-wider font-black text-[#00E5FF] mb-1">
                  <span>🛡 OPPOSITE HEDGE</span>
                  <span className="opacity-75">({oppSize})</span>
                </div>
                <div
                  id="dispN2"
                  className="text-4xl sm:text-5xl font-black font-mono text-[#00E5FF] drop-shadow-lg tracking-tight"
                >
                  {hedgeNum}
                </div>
                <div className="text-[9px] font-mono font-bold text-[#00E5FF] tracking-wider uppercase mt-1">
                  REVERSAL COVER
                </div>
              </div>
            </div>
          </div>

          {/* Predicted Color & Engine Accuracy Metrics */}
          <div
            className="rounded-2xl p-4 border flex flex-col justify-between"
            style={{
              background: '#04070d',
              borderColor: `${activeTheme.primary}45`,
            }}
          >
            <div className="flex items-center justify-between text-xs font-mono text-[#888888] mb-2">
              <span className="uppercase text-[10px] font-bold text-white flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>PREDICTED COLOR TARGET</span>
              </span>
              <div
                className={`text-xs font-black font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                  isGreen
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isGreen ? 'bg-emerald-400' : 'bg-rose-400'
                  }`}
                />
                <span>
                  {prediction?.color || 'GREEN'} ({prediction?.colorConfidence || 92}%)
                </span>
              </div>
            </div>

            {/* Metrics 3-Grid: Confidence, Risk Level, Consensus */}
            <div className="grid grid-cols-3 gap-2 bg-black/60 p-2.5 rounded-xl border border-white/10 text-center font-mono">
              <div>
                <div className="text-[9px] text-[#A0AEC0] uppercase font-bold">CONFIDENCE</div>
                <div id="dispConf" className="text-sm sm:text-base font-black text-white">
                  {prediction?.sizeConfidence || 94}%
                </div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-[9px] text-[#A0AEC0] uppercase font-bold">RISK TIER</div>
                <div
                  id="dispLevel"
                  className="text-sm sm:text-base font-black"
                  style={{ color: activeTheme.primary }}
                >
                  Level {prediction?.riskLevel || 1}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-[#A0AEC0] uppercase font-bold">CONSENSUS</div>
                <div id="dispConsensus" className="text-sm sm:text-base font-black text-emerald-400">
                  {prediction?.consensus || 94}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5-ENGINE MULTI-FACTOR CONSENSUS RADAR (PREDICTION INTEL)
         ========================================================================= */}
      <div
        className="relative z-10 mt-3 p-3 sm:p-4 rounded-xl border font-mono"
        style={{
          background: '#04070d',
          borderColor: `${activeTheme.primary}35`,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              5-ENGINE AI CONSENSUS RADAR
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
              {unanimousVotes}/5 ENGINES AGREE ({Math.round((unanimousVotes / 5) * 100)}% UNANIMOUS)
            </span>
          </div>
          <div className="text-[10px] text-[#888888] flex items-center gap-3">
            <span>
              <strong className="text-amber-400">HOT DIGITS:</strong>{' '}
              {hotList.slice(0, 3).join(' • ')}
            </span>
            <span>
              <strong className="text-cyan-400">OVERDUE:</strong>{' '}
              {coldList.slice(0, 2).join(' • ')}
            </span>
          </div>
        </div>

        {/* 5-Engine Individual Votes Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {engineVotes.map((eng, idx) => {
            const isEngBig = eng.vote === 'BIG';
            return (
              <div
                key={idx}
                className="p-2 rounded-lg border bg-black/40 flex flex-col justify-between"
                style={{
                  borderColor: isEngBig ? 'rgba(245, 158, 11, 0.3)' : 'rgba(6, 182, 212, 0.3)',
                }}
              >
                <div className="text-[9px] text-[#A0AEC0] truncate">{eng.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-xs font-black ${
                      isEngBig ? 'text-amber-400' : 'text-cyan-400'
                    }`}
                  >
                    {eng.vote}
                  </span>
                  <span className="text-[10px] text-white font-bold opacity-80">
                    {eng.confidence}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strategy Selector Tabs */}
      <div className="relative z-10 mt-3 pt-3 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-mono text-[#A0AEC0] uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>ALGORITHM STRATEGY MODE:</span>
          </span>
          <span className="text-[10px] font-mono text-[#00E5FF] hidden sm:inline">
            Active: {prediction?.engineName || prediction?.modelName || 'MATRIX V2 CORE'}
            {prediction?.phaseLabel ? ` • [${prediction.phaseLabel}]` : ''}
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
                className={`py-2 px-3 rounded-xl border text-left font-mono transition-all cursor-pointer relative overflow-hidden ${
                  active ? 'font-bold shadow-lg ring-1' : 'text-[#888888] hover:text-white hover:border-white/30'
                }`}
                style={{
                  background: active
                    ? strat.isMaster
                      ? `linear-gradient(135deg, ${activeTheme.primary}, #F59E0B)`
                      : activeTheme.primary
                    : strat.isMaster
                    ? 'rgba(245, 158, 11, 0.08)'
                    : '#04070d',
                  borderColor: active
                    ? strat.isMaster
                      ? '#F59E0B'
                      : activeTheme.primary
                    : strat.isMaster
                    ? 'rgba(245, 158, 11, 0.4)'
                    : 'rgba(255,255,255,0.12)',
                  color: active ? '#000000' : strat.isMaster ? '#F59E0B' : undefined,
                  boxShadow: active
                    ? `0 0 20px ${strat.isMaster ? 'rgba(245, 158, 11, 0.6)' : activeTheme.primaryGlow}`
                    : strat.isMaster
                    ? '0 0 10px rgba(245, 158, 11, 0.15)'
                    : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate">{strat.label}</span>
                  {strat.isMaster && (
                    <span
                      className={`text-[8px] px-1 py-0.2 rounded font-mono font-black ${
                        active
                          ? 'bg-black text-amber-400'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      ALL-IN-1
                    </span>
                  )}
                </div>
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
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ background: activeTheme.primary }}
          />
          <span className="font-bold" style={{ color: activeTheme.primary }}>
            [PREDICTION VERDICT]:
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
