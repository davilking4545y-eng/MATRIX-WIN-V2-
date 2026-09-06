import React, { useEffect, useState } from 'react';
import {
  Trophy,
  Crown,
  CheckCircle2,
  XCircle,
  Volume2,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { PredictionHistoryRecord, ThemeConfig } from '../types';
import { soundFx, speakOutcomeAnnouncement } from '../utils/audio';

interface OutcomeModalProps {
  record: PredictionHistoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  activeTheme: ThemeConfig;
  currentStreak?: number;
}

export const OutcomeModal: React.FC<OutcomeModalProps> = ({
  record,
  isOpen,
  onClose,
  activeTheme,
  currentStreak = 0,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(7);

  useEffect(() => {
    if (!isOpen || !record) return;

    setSecondsLeft(7);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, record, onClose]);

  if (!isOpen || !record) return null;

  const num = record.actualNumber;
  const isJackpot = num === record.primaryNum || num === record.hedgeNum || record.status === 'JACKPOT';
  const isWin = !isJackpot && (record.actualSize === record.predictedSize || record.status === 'WIN');
  const isLoss = !isJackpot && !isWin;
  const effectiveStatus: 'JACKPOT' | 'WIN' | 'LOSS' = isJackpot ? 'JACKPOT' : isWin ? 'WIN' : 'LOSS';

  // Modal Theme Colors based on outcome
  const themeColor = isJackpot ? '#F59E0B' : isWin ? '#10B981' : '#EF4444';
  const bgColor = isJackpot
    ? 'rgba(245, 158, 11, 0.12)'
    : isWin
    ? 'rgba(16, 185, 129, 0.12)'
    : 'rgba(239, 68, 68, 0.12)';

  const handleReplayVoice = () => {
    soundFx.playClick(850);
    speakOutcomeAnnouncement(
      effectiveStatus,
      record.issueNumber,
      record.actualNumber,
      record.actualSize
    );
  };

  const shortIssue = record.issueNumber ? record.issueNumber.slice(-5) : '-----';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      {/* Background radial glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: themeColor }}
      />

      {/* Main Modal Container */}
      <div
        id="matrix-outcome-modal"
        className="relative w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.9)] border transition-all duration-300"
        style={{
          background: 'linear-gradient(165deg, rgba(13, 20, 36, 0.98) 0%, rgba(5, 8, 18, 0.99) 100%)',
          borderColor: `${themeColor}80`,
          boxShadow: `0 0 35px ${themeColor}35, inset 0 0 20px ${themeColor}10`,
        }}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-3 mb-5">
          {/* Status Badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border"
            style={{
              background: bgColor,
              borderColor: `${themeColor}60`,
              color: themeColor,
            }}
          >
            {isJackpot ? (
              <>
                <Crown className="w-4 h-4 animate-bounce text-amber-400" />
                <span>JACKPOT CONFIRMED</span>
              </>
            ) : isWin ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PREDICTION WON</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                <span>ROUND LOSS</span>
              </>
            )}
          </div>

          {/* Close & Auto-timer */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">
              Auto close in <strong className="text-white">{secondsLeft}s</strong>
            </span>
            <button
              id="outcome-modal-close-btn"
              onClick={() => {
                soundFx.playClick(600);
                onClose();
              }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-white/10"
              title="Close Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Visual Icon & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center border shadow-xl animate-pulse"
              style={{
                background: bgColor,
                borderColor: themeColor,
                boxShadow: `0 0 30px ${themeColor}50`,
              }}
            >
              {isJackpot ? (
                <Trophy className="w-10 h-10 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
              ) : isWin ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
              ) : (
                <XCircle className="w-10 h-10 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
              )}
            </div>
          </div>

          <h2
            className="text-2xl sm:text-3xl font-black uppercase tracking-wider font-sans mb-1"
            style={{ color: themeColor }}
          >
            {isJackpot ? 'JACKPOT HIT!' : isWin ? 'WINNER!' : 'ROUND LOSS'}
          </h2>
          <p className="text-xs font-mono text-slate-300">
            {isJackpot
              ? 'Direct number hit detected in high-probability cluster!'
              : isWin
              ? 'Quantum probability matched the drawn outcome!'
              : 'Drawn variance deviated. Matrix Martingale activated.'}
          </p>
        </div>

        {/* Outcome Details Card */}
        <div className="bg-[#050914] border border-white/10 rounded-2xl p-4 mb-5 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs font-mono">
            <span className="text-slate-400">PERIOD DRAWN</span>
            <span className="font-bold text-white tracking-wider">#{shortIssue}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Predicted Box */}
            <div className="bg-[#0b1222] border border-white/10 rounded-xl p-3 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                PREDICTED
              </span>
              <div className="font-mono font-bold text-base text-white mb-0.5">
                {record.predictedSize}
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Nums: [{record.primaryNum}, {record.hedgeNum}]
              </div>
            </div>

            {/* Actual Result Box */}
            <div
              className="border rounded-xl p-3 text-center"
              style={{
                background: bgColor,
                borderColor: `${themeColor}60`,
              }}
            >
              <span className="text-[10px] font-mono uppercase block mb-1" style={{ color: themeColor }}>
                DRAWN RESULT
              </span>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <span className="text-xl font-mono font-black text-white">{record.actualNumber}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-white border border-white/20">
                  {record.actualSize}
                </span>
              </div>
              <div
                className="text-[11px] font-mono font-bold uppercase"
                style={{
                  color:
                    record.actualColor === 'GREEN'
                      ? '#10B981'
                      : record.actualColor === 'RED'
                      ? '#EF4444'
                      : '#A855F7',
                }}
              >
                {record.actualColor}
              </div>
            </div>
          </div>

          {/* Additional telemetry stats */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono">
            <div className="flex items-center gap-1 text-slate-400">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span>LEVEL: {record.levelMultiplier || 'L1 (1X)'}</span>
            </div>

            {currentStreak > 0 && isWin && (
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{currentStreak}X STREAK 🔥</span>
              </div>
            )}

            {isJackpot && (
              <div className="flex items-center gap-1 font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>9.0X MULTIPLIER</span>
              </div>
            )}
          </div>
        </div>

        {/* Voice Announcement Replay & Dismiss Controls */}
        <div className="flex items-center gap-3">
          <button
            id="replay-voice-announcement-btn"
            type="button"
            onClick={handleReplayVoice}
            className="flex-1 py-3 px-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-white/10 hover:bg-white/15 border border-white/20 text-white"
          >
            <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>REPLAY VOICE</span>
          </button>

          <button
            id="dismiss-outcome-modal-btn"
            type="button"
            onClick={() => {
              soundFx.playClick(650);
              onClose();
            }}
            className="flex-1 py-3 px-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-white shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, ${themeColor}CC 100%)`,
              color: isJackpot ? '#000000' : '#FFFFFF',
              boxShadow: `0 4px 15px ${themeColor}40`,
            }}
          >
            <Zap className="w-4 h-4" />
            <span>CONTINUE</span>
          </button>
        </div>

        {/* Bottom Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-linear rounded-full"
            style={{
              width: `${(secondsLeft / 7) * 100}%`,
              background: themeColor,
            }}
          />
        </div>
      </div>
    </div>
  );
};
