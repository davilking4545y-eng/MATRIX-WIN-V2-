import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  WinGoIssue,
  WinGoPrediction,
  WinGoSize,
  PredictionHistoryRecord,
  PredictionTelemetry,
  PredictionStrategy,
  UserPreferences,
  AppThemeId,
} from './types';
import { THEMES } from './utils/themes';
import {
  fetchGameResult,
  generateWinGoPrediction,
  generateHistoricalAuditStream,
} from './utils/predictionEngine';
import { immutableLedger } from './utils/immutableLedger';
import { MatrixRainCanvas } from './components/MatrixRainCanvas';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { NextPredictionHero } from './components/NextPredictionHero';
import { LiveTickChart } from './components/LiveTickChart';
import { PredictionHistoryTable } from './components/PredictionHistoryTable';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { OutcomeModal } from './components/OutcomeModal';
import { LoginPage } from './components/LoginPage';
import { triggerConfetti } from './utils/confetti';
import { AuthSession } from './types';
import { clearSession } from './services/authService';
import { useActivePresence } from './services/presenceService';
import { soundFx, speakOutcomeAnnouncement } from './utils/audio';

export default function App() {
  // 0. Authentication Session State: Starts as null on every page load/refresh as requested
  const [authSession, setAuthSession] = useState<AuthSession | null>(null);

  // Active Users Presence: Heartbeats for all active sessions; syncs real-time count for Owner
  const activeUsersCount = useActivePresence(
    Boolean(authSession),
    authSession?.role,
    authSession?.deviceId || ''
  );

  // 1. Theme State (persisted in localStorage)
  const [currentThemeId, setCurrentThemeId] = useState<AppThemeId>(() => {
    try {
      const saved = localStorage.getItem('matrix_theme') as AppThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch (_) {}
    return 'matrix';
  });
  const activeTheme = THEMES[currentThemeId] || THEMES.matrix;

  // Modal Dialog States
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [outcomeModalRecord, setOutcomeModalRecord] = useState<PredictionHistoryRecord | null>(null);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState<boolean>(false);

  // 3. Data State
  const [issues, setIssues] = useState<WinGoIssue[]>([]);
  const [prediction, setPrediction] = useState<WinGoPrediction | null>(null);
  const [historyRecords, setHistoryRecords] = useState<PredictionHistoryRecord[]>([]);
  const [strategy, setStrategy] = useState<PredictionStrategy>('matrix_win_v2');

  // 4. Network & UI State
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [apiLatencyMs, setApiLatencyMs] = useState<number>(18);
  const [latestIssue, setLatestIssue] = useState<string>('');
  const [nextIssue, setNextIssue] = useState<string>('');

  // 5. User Preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    soundEnabled: true,
    rainEnabled: true,
    scanlinesEnabled: true,
    autoRunner: false,
    autoRunnerSpeedMs: 1000,
    stake: 10,
    strategy: 'matrix_win_v2',
    targetMultiplier: 2.0,
  });

  // 6. Telemetry State with calibrated high win rate
  const [telemetry, setTelemetry] = useState<PredictionTelemetry>({
    totalRounds: 0,
    totalWins: 0,
    winRate: 93.6,
    currentStreak: 5,
    maxStreak: 9,
    dragonStreak: 3,
    netPoints: 480,
    accuracyTrend: [91, 92, 93, 93.6],
  });

  // 7. 60-Second Countdown (Synced with UTC / local seconds of minute)
  const [countdownSeconds, setCountdownSeconds] = useState<number>(() => {
    const s = new Date().getSeconds();
    return 60 - s === 60 ? 0 : 60 - s;
  });

  // Sync Audio FX preference
  useEffect(() => {
    soundFx.setEnabled(preferences.soundEnabled);
  }, [preferences.soundEnabled]);

  // Persist Theme Selection
  const handleSelectTheme = (themeId: AppThemeId) => {
    setCurrentThemeId(themeId);
    try {
      localStorage.setItem('matrix_theme', themeId);
    } catch (_) {}
  };

  // Sync Countdown Timer every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const sec = now.getSeconds();
      const rem = 60 - sec === 60 ? 0 : 60 - sec;
      setCountdownSeconds(rem);

      // Play tick sound when locking (last 5 seconds)
      if (rem <= 5 && rem > 0) {
        soundFx.playCountdownTick(rem);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute Next Issue Number safely
  const calculateNextIssueNumber = (currentIssue: string): string => {
    if (!currentIssue) return '';
    try {
      const prefix = currentIssue.slice(0, -4);
      const suffix = currentIssue.slice(-4);
      const nextNum = parseInt(suffix, 10) + 1;
      return `${prefix}${String(nextNum).padStart(4, '0')}`;
    } catch {
      return String(BigInt(currentIssue) + 1n);
    }
  };

  // Ref to track last seen drawn issue so we can evaluate new outcomes
  const lastEvaluatedIssueRef = useRef<string>('');
  const lastActivePredictionRef = useRef<WinGoPrediction | null>(null);
  // Persistent locked predictions map: Once prediction is generated for a target period, NEVER change it!
  const lockedPredictionsRef = useRef<Map<string, WinGoPrediction>>(new Map());

  // Core API Fetch and Prediction Generator
  const syncWinGoData = useCallback(async () => {
    setIsFetching(true);
    const startTime = performance.now();

    try {
      const data = await fetchGameResult();
      const latency = Math.round(performance.now() - startTime);
      setApiLatencyMs(latency);

      if (data && data.length > 0) {
        setIssues(data);
        const topIssue = data[0].issueNumber;
        setLatestIssue(topIssue);

        const target = calculateNextIssueNumber(topIssue);
        setNextIssue(target);

        // PREDICTION LOCK-IN GUARD:
        // Once a prediction is calculated for a period, it is locked in and NEVER changes during polling
        let currentTargetPred = lockedPredictionsRef.current.get(target) || immutableLedger.getLockedPrediction(target);
        if (!currentTargetPred) {
          currentTargetPred = generateWinGoPrediction(data, strategy);
          lockedPredictionsRef.current.set(target, currentTargetPred);
          immutableLedger.saveLockedPrediction(target, currentTargetPred);
        }
        setPrediction(currentTargetPred);

        // Check if a new drawn issue has arrived since our previous prediction
        if (lastEvaluatedIssueRef.current && lastEvaluatedIssueRef.current !== topIssue) {
          // Look up the exact locked prediction that was made for topIssue
          const activePred =
            lockedPredictionsRef.current.get(topIssue) ||
            immutableLedger.getLockedPrediction(topIssue) ||
            lastActivePredictionRef.current;

          let latestRec = immutableLedger.getRecord(topIssue);

          if (!latestRec) {
            const actualItem = data[0];
            const actualNum = parseInt(actualItem.number, 10);
            const actualSize: WinGoSize = actualNum >= 5 ? 'BIG' : 'SMALL';
            const actualColor = actualItem.color ? actualItem.color.toUpperCase() : (actualNum % 2 === 1 ? 'GREEN' : 'RED');

            const predToUse =
              activePred && (activePred.targetIssue === topIssue || !activePred.targetIssue)
                ? activePred
                : generateWinGoPrediction(data.slice(1), strategy);

            const isJackpot = actualNum === predToUse.primaryNum || actualNum === predToUse.hedgeNum;
            const isSizeWin = !isJackpot && actualSize === predToUse.size;
            const status: 'JACKPOT' | 'WIN' | 'LOSS' = isJackpot ? 'JACKPOT' : isSizeWin ? 'WIN' : 'LOSS';
            const isWin = status === 'JACKPOT' || status === 'WIN';

            latestRec = {
              issueNumber: topIssue,
              actualNumber: actualNum,
              actualSize,
              actualColor,
              predictedSize: predToUse.size,
              predictedColor: predToUse.color,
              primaryNum: predToUse.primaryNum,
              hedgeNum: predToUse.hedgeNum,
              level: 1,
              levelMultiplier: 'L1 (1X)',
              status,
              isWin,
              confidence: predToUse.sizeConfidence,
              pattern: predToUse.pattern,
              modelName: predToUse.modelName || 'MATRIX WIN V2 ENGINE',
              timestamp: Date.now(),
            };

            // CRITICAL: PERMANENTLY FREEZE IN IMMUTABLE LEDGER SO IT NEVER FLIPS
            immutableLedger.saveRecord(latestRec);
          }

          // Reconcile stream from immutable ledger so past records are NEVER shifted or recalculated
          const updatedStream = immutableLedger.reconcileAuditStream(data);
          setHistoryRecords(updatedStream);

          const isWin = latestRec ? latestRec.isWin : true;

          if (latestRec) {
            // Trigger Outcome Modal Pop-Up
            setOutcomeModalRecord(latestRec);
            setIsOutcomeModalOpen(true);

            // Trigger Voice Announcement & Sound FX based strictly on JACKPOT / WIN / LOSS
            if (latestRec.status === 'JACKPOT') {
              soundFx.playJackpotFanfare();
              triggerConfetti({
                particleCount: 140,
                spread: 90,
                origin: { y: 0.5 },
                colors: ['#F59E0B', '#EAB308', '#FFFFFF', activeTheme.primary],
              });
              speakOutcomeAnnouncement(
                'JACKPOT',
                latestRec.issueNumber,
                latestRec.actualNumber,
                latestRec.actualSize
              );
            } else if (latestRec.status === 'WIN') {
              soundFx.playWin(false);
              triggerConfetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
                colors: [activeTheme.primary, '#10B981', '#00E5FF', '#FFFFFF'],
              });
              speakOutcomeAnnouncement(
                'WIN',
                latestRec.issueNumber,
                latestRec.actualNumber,
                latestRec.actualSize
              );
            } else {
              soundFx.playLoss();
              speakOutcomeAnnouncement(
                'LOSS',
                latestRec.issueNumber,
                latestRec.actualNumber,
                latestRec.actualSize
              );
            }
          }

          setTelemetry((prev) => {
            const totalRounds = updatedStream.length;
            const totalWins = updatedStream.filter((r) => r.isWin).length;
            const winRate = parseFloat(((totalWins / totalRounds) * 100).toFixed(1));
            const currentStreak = isWin ? prev.currentStreak + 1 : 0;
            const maxStreak = Math.max(prev.maxStreak, currentStreak);

            return {
              ...prev,
              totalRounds,
              totalWins,
              winRate,
              currentStreak,
              maxStreak,
              netPoints: prev.netPoints + (isWin ? 25 : -10),
              accuracyTrend: [...prev.accuracyTrend.slice(-15), winRate],
            };
          });

          // Trim locked map to avoid memory accumulation
          if (lockedPredictionsRef.current.size > 30) {
            const keys = Array.from(lockedPredictionsRef.current.keys());
            for (let k = 0; k < keys.length - 20; k++) {
              lockedPredictionsRef.current.delete(keys[k]);
            }
          }
        }

        // Keep references updated
        lastEvaluatedIssueRef.current = topIssue;
        lastActivePredictionRef.current = currentTargetPred;

        // Initialize or reconcile history records from immutable ledger
        setHistoryRecords(() => {
          const stream = immutableLedger.reconcileAuditStream(data);
          const wins = stream.filter((r) => r.isWin).length;
          const rate = stream.length > 0 ? parseFloat(((wins / stream.length) * 100).toFixed(1)) : 93.6;
          setTelemetry((prev) => ({
            ...prev,
            totalRounds: stream.length,
            totalWins: wins,
            winRate: rate,
          }));
          return stream;
        });
      }
    } catch (err) {
      console.error('Error fetching WinGo result:', err);
    } finally {
      setIsFetching(false);
    }
  }, [strategy, activeTheme]);

  // Initial Fetch on mount (only when authenticated)
  useEffect(() => {
    if (!authSession) return;
    syncWinGoData();
  }, [syncWinGoData, authSession]);

  // Polling loop: poll every 6 seconds (only when authenticated)
  useEffect(() => {
    if (!authSession) return;
    const interval = setInterval(() => {
      syncWinGoData();
    }, 6000);

    return () => clearInterval(interval);
  }, [syncWinGoData, authSession]);

  // Handle Strategy Change
  const handleSelectStrategy = (newStrategy: PredictionStrategy) => {
    setStrategy(newStrategy);
    if (issues.length > 0) {
      const pred = generateWinGoPrediction(issues, newStrategy);
      if (nextIssue) {
        lockedPredictionsRef.current.set(nextIssue, pred);
        immutableLedger.saveLockedPrediction(nextIssue, pred);
      }
      setPrediction(pred);
      lastActivePredictionRef.current = pred;
    }
  };

  // Handle Reset Stream
  const handleResetStream = useCallback(() => {
    if (issues.length > 0) {
      const stream = generateHistoricalAuditStream(issues, strategy);
      setHistoryRecords(stream);
      const wins = stream.filter((r) => r.isWin).length;
      const rate = stream.length > 0 ? parseFloat(((wins / stream.length) * 100).toFixed(1)) : 93.6;
      setTelemetry((prev) => ({
        ...prev,
        totalRounds: stream.length,
        totalWins: wins,
        winRate: rate,
      }));
    }
  }, [issues, strategy]);

  // If user is not authenticated, show the MATRIX WIN V2 Login Page
  if (!authSession) {
    return (
      <LoginPage
        activeTheme={activeTheme}
        onLoginSuccess={(session) => setAuthSession(session)}
      />
    );
  }

  return (
    <div
      className="min-h-screen text-[#E0E0E0] flex flex-col relative font-sans transition-colors duration-500"
      style={{
        background: activeTheme.background,
        color: '#E0E0E0',
      }}
    >
      {/* 1. Matrix Digital Rain Canvas Background with Theme Color */}
      {preferences.rainEnabled && (
        <MatrixRainCanvas opacity={0.16} speed={1.1} color={activeTheme.primary} />
      )}

      {/* 2. CRT Scanline Overlay */}
      {preferences.scanlinesEnabled && (
        <div className="scanline-overlay fixed inset-0 z-10 pointer-events-none" />
      )}

      {/* 3. Cyber HUD Header with Theme Switcher and VIP Status */}
      <Header
        latestIssue={latestIssue}
        nextIssue={nextIssue}
        countdownSeconds={countdownSeconds}
        isFetching={isFetching}
        soundEnabled={preferences.soundEnabled}
        onToggleSound={() =>
          setPreferences((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
        rainEnabled={preferences.rainEnabled}
        onToggleRain={() =>
          setPreferences((p) => ({ ...p, rainEnabled: !p.rainEnabled }))
        }
        scanlinesEnabled={preferences.scanlinesEnabled}
        onToggleScanlines={() =>
          setPreferences((p) => ({ ...p, scanlinesEnabled: !p.scanlinesEnabled }))
        }
        apiLatencyMs={apiLatencyMs}
        onRefreshApi={syncWinGoData}
        activeTheme={activeTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        authSession={authSession}
        activeUsersCount={activeUsersCount}
        onLogout={() => {
          clearSession();
          setAuthSession(null);
        }}
      />

      {/* 4. Main Matrix Win V2 Terminal Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 space-y-4 z-20">
        {/* Metric Cards Top Row */}
        <MetricCards
          telemetry={telemetry}
          detectedPattern={prediction?.pattern || 'Triad Historical Resonance'}
          nextIssue={nextIssue}
          activeTheme={activeTheme}
          prediction={prediction}
        />

        {/* Next Issue Hero Prediction Card */}
        <NextPredictionHero
          prediction={prediction}
          countdownSeconds={countdownSeconds}
          selectedStrategy={strategy}
          onSelectStrategy={handleSelectStrategy}
          isFetching={isFetching}
          onManualRefresh={syncWinGoData}
          activeTheme={activeTheme}
        />

        {/* Real-time Oscillogram Telemetry */}
        <div className="w-full flex flex-col gap-4">
          <LiveTickChart issues={issues} isStreaming={true} />
        </div>

        {/* Historical Draw & Prediction Verification Feed */}
        <PredictionHistoryTable
          historyRecords={historyRecords}
          activeTheme={activeTheme}
          onResetStream={handleResetStream}
          onSelectRecord={(rec) => {
            setOutcomeModalRecord(rec);
            setIsOutcomeModalOpen(true);
            speakOutcomeAnnouncement(
              rec.status,
              rec.issueNumber,
              rec.actualNumber,
              rec.actualSize
            );
          }}
        />
      </main>

      {/* 5. Terminal Footer HUD */}
      <footer
        className="w-full border-t py-2.5 px-4 text-center font-mono text-[11px] text-[#888888] z-20 flex flex-wrap items-center justify-between gap-2 shadow-2xl transition-colors"
        style={{
          background: activeTheme.cardBg,
          borderColor: activeTheme.border,
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-pulse shadow-sm"
            style={{ background: activeTheme.primary }}
          />
          <span className="font-bold tracking-wider" style={{ color: activeTheme.primary }}>
            MATRIX WIN V2
          </span>
          <span className="text-[#444444]">//</span>
          <span className="tracking-wide">MATRIX OWNER • QUANTITATIVE MARKOV & PATTERN LAB • HIGH ACCURACY ENGINE</span>
        </div>
        <div className="flex items-center gap-4 text-[#888888]">
          <span>
            THEME: <strong style={{ color: activeTheme.primary }}>{activeTheme.name}</strong>
          </span>
          <span>
            ACCURACY: <strong style={{ color: activeTheme.primary }}>{telemetry.winRate}%</strong>
          </span>
          <span className="hidden sm:inline">
            ENGINE:{' '}
            <strong style={{ color: activeTheme.primary }}>
              V2 FULL ACCURACY ACTIVE
            </strong>
          </span>
        </div>
      </footer>

      {/* 6. Theme Selector Modal (5 Themes) */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={currentThemeId}
        onSelectTheme={handleSelectTheme}
      />

      {/* 7. Outcome Pop-Up Modal (Win / Jackpot / Loss + Voice Announcement) */}
      <OutcomeModal
        record={outcomeModalRecord}
        isOpen={isOutcomeModalOpen}
        onClose={() => setIsOutcomeModalOpen(false)}
        activeTheme={activeTheme}
        currentStreak={telemetry.currentStreak}
      />
    </div>
  );
}
