import React from 'react';
import {
  Terminal,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Layers,
  Zap,
  Radio,
  Palette,
  LogOut,
  Crown,
  Key,
  Users,
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ThemeConfig, AuthSession } from '../types';

interface HeaderProps {
  latestIssue: string;
  nextIssue: string;
  countdownSeconds: number;
  isFetching: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  rainEnabled: boolean;
  onToggleRain: () => void;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  apiLatencyMs: number;
  onRefreshApi: () => void;
  activeTheme: ThemeConfig;
  onOpenThemeModal: () => void;
  authSession?: AuthSession | null;
  activeUsersCount?: number;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  latestIssue,
  nextIssue,
  countdownSeconds,
  isFetching,
  soundEnabled,
  onToggleSound,
  rainEnabled,
  onToggleRain,
  scanlinesEnabled,
  onToggleScanlines,
  apiLatencyMs,
  onRefreshApi,
  activeTheme,
  onOpenThemeModal,
  authSession,
  activeUsersCount,
  onLogout,
}) => {
  const mm = String(Math.floor(countdownSeconds / 60)).padStart(2, '0');
  const ss = String(countdownSeconds % 60).padStart(2, '0');
  const isLocking = countdownSeconds <= 5 && countdownSeconds > 0;

  return (
    <header
      id="matrix-win-header"
      className="w-full px-3 sm:px-6 py-2.5 backdrop-blur-md sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_25px_rgba(0,0,0,0.9)] border-b transition-colors duration-300"
      style={{
        background: activeTheme.cardBg,
        borderColor: activeTheme.border,
      }}
    >
      {/* Brand & Matrix Win V2 Identity */}
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-black font-mono font-black text-sm shadow-md transition-colors"
          style={{
            background: activeTheme.primary,
            boxShadow: `0 0 15px ${activeTheme.primaryGlow}`,
          }}
        >
          <Terminal className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <h1
              className="text-base sm:text-lg font-black tracking-wider font-mono flex items-center gap-1.5"
              style={{ color: activeTheme.primary }}
            >
              <span>MATRIX WIN V2</span>
              <span className="text-white drop-shadow-sm">CORE</span>
            </h1>

            {/* OWNER EXCLUSIVE: Top Left Active Users Count - ONLY visible when logged in with Owner Key */}
            {authSession?.role === 'owner' && (
              <div
                id="owner-live-users-badge"
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] sm:text-[11px] font-mono font-bold bg-[#041d13] border-emerald-500/60 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all"
                title="Real-time Active Users (Owner Exclusive Radar)"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="tracking-wide">
                  <strong className="text-white text-xs">{activeUsersCount ?? 1}</strong> ONLINE
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-semibold">
                  OWNER
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-[#888888] font-mono hidden sm:flex items-center gap-2">
            <span>WinGo 1M Triad & N-Gram Prediction Engine</span>
            <span className="text-[#444444]">•</span>
            <span style={{ color: activeTheme.secondary }}>draw.ar-lottery01.com API</span>
          </p>
        </div>
      </div>

      {/* Center Live Period & Countdown Status */}
      <div
        className="flex items-center gap-2 sm:gap-4 px-3 py-1.5 rounded-lg text-xs font-mono border"
        style={{
          background: '#04070e',
          borderColor: activeTheme.border,
        }}
      >
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: activeTheme.primary }} />
          <span className="text-[#888888] hidden md:inline">LATEST:</span>
          <span className="text-white font-bold text-[11px] sm:text-xs">
            {latestIssue ? `#${latestIssue.slice(-5)}` : 'SYNCING...'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/10" />

        <div className="flex items-center gap-1.5">
          <span className="text-[#888888] hidden sm:inline">NEXT TARGET:</span>
          <span className="font-bold text-[11px] sm:text-xs" style={{ color: activeTheme.primary }}>
            {nextIssue ? `#${nextIssue.slice(-5)}` : 'CALC...'}
          </span>
        </div>

        <div className="h-3.5 w-px bg-white/10" />

        {/* Live Draw Countdown Clock */}
        <div className="flex items-center gap-1.5">
          <span className="text-[#888888] hidden lg:inline">DRAW IN:</span>
          <span
            className={`font-mono font-bold text-xs sm:text-sm px-2 py-0.5 rounded border ${
              isLocking
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 animate-pulse'
                : 'border-transparent'
            }`}
            style={{
              color: isLocking ? '#F59E0B' : activeTheme.primary,
              background: isLocking ? 'rgba(245, 158, 11, 0.15)' : `${activeTheme.primary}15`,
              borderColor: isLocking ? '#F59E0B' : `${activeTheme.primary}40`,
            }}
          >
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* Controls & Theme Switcher */}
      <div className="flex items-center gap-2">
        {/* Theme Switcher Button */}
        <button
          id="header-theme-selector-btn"
          onClick={() => {
            soundFx.playClick(1000);
            onOpenThemeModal();
          }}
          title="Switch Color Theme (5 Options)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer hover:scale-102"
          style={{
            background: `${activeTheme.primary}15`,
            borderColor: activeTheme.border,
            color: activeTheme.primary,
          }}
        >
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{activeTheme.name.split(' ')[0]}</span>
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-white/30"
            style={{ background: activeTheme.primary }}
          />
        </button>

        {/* API Latency */}
        <div className="hidden xl:flex items-center gap-1.5 bg-[#03060c] border border-white/10 px-2.5 py-1 rounded-lg text-[11px] font-mono text-[#888888]">
          <Zap className="w-3 h-3" style={{ color: activeTheme.primary }} />
          <span>API:</span>
          <span className="text-white font-semibold">{apiLatencyMs}ms</span>
        </div>

        {/* Manual Sync Button */}
        <button
          id="refresh-wingo-api-btn"
          title="Fetch latest WinGo 1M draw data from API"
          onClick={() => {
            soundFx.playClick(900);
            onRefreshApi();
          }}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer disabled:opacity-50"
          style={{
            background: `${activeTheme.primary}15`,
            borderColor: activeTheme.border,
            color: activeTheme.primary,
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">SYNC</span>
        </button>

        {/* Toggles Group */}
        <div className="flex items-center bg-[#040810] border border-white/10 rounded-lg p-0.5">
          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            title={soundEnabled ? 'Mute Audio FX' : 'Enable Audio FX'}
            onClick={onToggleSound}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              soundEnabled ? 'hover:bg-white/10' : 'text-[#666666] hover:text-white'
            }`}
            style={{ color: soundEnabled ? activeTheme.primary : undefined }}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Matrix Rain Canvas Toggle */}
          <button
            id="toggle-matrix-rain-btn"
            title={rainEnabled ? 'Disable Matrix Rain' : 'Enable Matrix Rain'}
            onClick={() => {
              soundFx.playClick();
              onToggleRain();
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              rainEnabled ? 'hover:bg-white/10' : 'text-[#666666] hover:text-white'
            }`}
            style={{ color: rainEnabled ? activeTheme.primary : undefined }}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Scanlines Toggle */}
          <button
            id="toggle-scanlines-btn"
            title={scanlinesEnabled ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
            onClick={() => {
              soundFx.playClick();
              onToggleScanlines();
            }}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              scanlinesEnabled ? 'hover:bg-white/10' : 'text-[#666666] hover:text-white'
            }`}
            style={{ color: scanlinesEnabled ? activeTheme.secondary : undefined }}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Session Status & Logout */}
        {authSession && (
          <div className="flex items-center gap-1.5 pl-1 sm:pl-2 border-l border-white/10">
            {authSession.role === 'owner' ? (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-bold uppercase border bg-amber-950/40 border-amber-500/50 text-amber-400"
                title="Master Key Authorized - Owner Mode"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">OWNER</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono font-semibold uppercase border bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                title={`Key: ${authSession.accessKey}`}
              >
                <Key className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">LICENSED</span>
              </div>
            )}

            {onLogout && (
              <button
                id="header-logout-btn"
                onClick={() => {
                  soundFx.playClick(650);
                  onLogout();
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors bg-red-950/30 hover:bg-red-950/70 border border-red-500/30 hover:border-red-500/60 text-red-300 hover:text-white cursor-pointer"
                title="Lock Terminal & Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">EXIT</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
