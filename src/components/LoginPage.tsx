import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  Cpu,
  Copy,
  Check,
  ArrowRight,
  Eye,
  EyeOff,
  Terminal,
  Lock,
  Sparkles,
  Zap,
  Activity,
  AlertTriangle,
  Crown,
} from 'lucide-react';
import { authenticateKey, getOrCreateDeviceId, MASTER_KEY } from '../services/authService';
import { AuthSession, ThemeConfig } from '../types';
import { soundFx, speakWelcomeMatrix } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface LoginPageProps {
  activeTheme: ThemeConfig;
  onLoginSuccess: (session: AuthSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ activeTheme, onLoginSuccess }) => {
  const [accessKey, setAccessKey] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isOwnerKeyDetected, setIsOwnerKeyDetected] = useState(false);

  useEffect(() => {
    const id = getOrCreateDeviceId();
    setDeviceId(id);
  }, []);

  useEffect(() => {
    // Detect if user typed or pasted the master key
    if (accessKey.trim().toUpperCase() === MASTER_KEY) {
      setIsOwnerKeyDetected(true);
    } else {
      setIsOwnerKeyDetected(false);
    }
  }, [accessKey]);

  const handleCopyDeviceId = async () => {
    if (!deviceId) return;
    try {
      await navigator.clipboard.writeText(deviceId);
      soundFx.playClick(950);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const executeLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (loading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    const key = accessKey.trim();
    if (!key) {
      soundFx.playLoss();
      setErrorMsg('Please enter an Access Key or Owner Master Key');
      return;
    }

    setLoading(true);
    soundFx.playClick(750);

    try {
      const result = await authenticateKey(key);

      if (result.success && result.session) {
        soundFx.playAccessGranted();
        // Trigger voice announcement: special for Owner vs Member
        const isOwner = result.session.role === 'owner';
        speakWelcomeMatrix(isOwner);

        // Celebration confetti burst
        triggerConfetti({
          particleCount: 110,
          spread: 80,
          origin: { y: 0.55 },
          colors: [activeTheme.primary, '#00FF41', '#00E5FF', '#F59E0B', '#FFFFFF'],
        });

        setSuccessMsg(result.message);

        // Transition smoothly into application
        setTimeout(() => {
          if (result.session) {
            onLoginSuccess(result.session);
          }
        }, 900);
      } else {
        soundFx.playLoss();
        setErrorMsg(result.message || 'Authentication failed. Please verify your credentials.');
        setLoading(false);
      }
    } catch (err: unknown) {
      soundFx.playLoss();
      setErrorMsg(err instanceof Error ? err.message : 'Server connection failed. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#030712] text-white select-none">
      {/* Dynamic Matrix Cyber Background Lines */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Horizontal Laser Lines */}
        <div
          className="absolute w-full h-[1px] opacity-40 animate-[pulse_6s_ease-in-out_infinite]"
          style={{
            top: '18%',
            background: `linear-gradient(90deg, transparent, ${activeTheme.primary}40, ${activeTheme.primary}, ${activeTheme.primary}40, transparent)`,
          }}
        />
        <div
          className="absolute w-full h-[1px] opacity-30 animate-[pulse_8s_ease-in-out_infinite]"
          style={{
            top: '48%',
            background: `linear-gradient(90deg, transparent, ${activeTheme.secondary}40, ${activeTheme.secondary}, ${activeTheme.secondary}40, transparent)`,
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute w-full h-[1px] opacity-35 animate-[pulse_7s_ease-in-out_infinite]"
          style={{
            top: '82%',
            background: `linear-gradient(90deg, transparent, ${activeTheme.primary}30, ${activeTheme.primary}, ${activeTheme.primary}30, transparent)`,
            animationDelay: '4s',
          }}
        />

        {/* Vertical Scan Laser Lines */}
        <div
          className="absolute h-full w-[1px] opacity-25"
          style={{
            left: '15%',
            background: `linear-gradient(180deg, transparent, ${activeTheme.primary}50, transparent)`,
          }}
        />
        <div
          className="absolute h-full w-[1px] opacity-25"
          style={{
            left: '50%',
            background: `linear-gradient(180deg, transparent, ${activeTheme.secondary}50, transparent)`,
          }}
        />
        <div
          className="absolute h-full w-[1px] opacity-25"
          style={{
            left: '85%',
            background: `linear-gradient(180deg, transparent, ${activeTheme.primary}50, transparent)`,
          }}
        />

        {/* Ambient radial glows */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-25"
          style={{ background: activeTheme.primary }}
        />
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        <div
          id="matrix-login-card"
          className="relative backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] border transition-all duration-300"
          style={{
            background: 'linear-gradient(165deg, rgba(13, 20, 36, 0.95) 0%, rgba(5, 8, 18, 0.98) 100%)',
            borderColor: isOwnerKeyDetected ? '#EAB308' : `${activeTheme.primary}40`,
            boxShadow: isOwnerKeyDetected
              ? '0 0 35px rgba(234, 179, 8, 0.25), inset 0 0 20px rgba(234, 179, 8, 0.08)'
              : `0 0 35px ${activeTheme.primary}18, inset 0 0 15px rgba(255,255,255,0.02)`,
          }}
        >
          {/* Top Badge */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase border transition-colors"
              style={{
                background: isOwnerKeyDetected ? 'rgba(234, 179, 8, 0.15)' : `${activeTheme.primary}18`,
                borderColor: isOwnerKeyDetected ? '#EAB308' : `${activeTheme.primary}50`,
                color: isOwnerKeyDetected ? '#FACC15' : activeTheme.primary,
              }}
            >
              {isOwnerKeyDetected ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>MASTER OVERRIDE</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>SECURE GATEWAY</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>ONLINE</span>
            </div>
          </div>

          {/* Title Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border font-mono font-black text-sm"
                style={{
                  background: `${activeTheme.primary}20`,
                  borderColor: `${activeTheme.primary}60`,
                  color: activeTheme.primary,
                }}
              >
                <Terminal className="w-4 h-4" />
              </div>
              <h1 className="text-2xl sm:text-[26px] font-black tracking-wider uppercase text-white font-sans">
                MATRIX WIN <span style={{ color: activeTheme.primary }}>V2</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono tracking-tight">
              Predictive Telemetry & Real-Time Matrix Terminal
            </p>
          </div>

          {/* Device Identifier Box */}
          <div className="bg-[#0b1222]/90 border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-5 shadow-inner">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
                <span>Device Identifier</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Hardware Locked</span>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[#050914] border border-white/10 rounded-xl px-3 py-2">
              <span
                id="matrix-device-id-display"
                className="font-mono text-xs sm:text-sm font-semibold text-emerald-400 tracking-wider truncate"
              >
                {deviceId || 'INITIALIZING...'}
              </span>
              <button
                id="copy-device-id-btn"
                type="button"
                onClick={handleCopyDeviceId}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white"
                title="Copy Device ID"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={executeLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="access-key-input"
                  className="flex items-center gap-1.5 text-xs font-mono font-semibold tracking-wider text-slate-300 uppercase"
                >
                  <KeyRound className="w-3.5 h-3.5" style={{ color: activeTheme.primary }} />
                  <span>Access Key / Master Key</span>
                </label>
                {isOwnerKeyDetected && (
                  <span className="text-[10px] font-mono font-bold text-amber-400 animate-pulse">
                    OWNER KEY RECOGNIZED
                  </span>
                )}
              </div>

              <div
                className="flex items-center bg-[#050914] border rounded-2xl px-3 py-1 transition-all focus-within:ring-2"
                style={{
                  borderColor: isOwnerKeyDetected ? '#EAB308' : 'rgba(255, 255, 255, 0.15)',
                }}
              >
                <Lock className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" />
                <input
                  id="access-key-input"
                  type={showKey ? 'text' : 'password'}
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter 16-digit access key or master key"
                  className="w-full bg-transparent border-none py-3 text-sm font-mono tracking-wider text-white placeholder:text-slate-600 outline-none"
                  autoComplete="off"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-950/50 border border-red-500/40 text-red-200 p-3 rounded-xl text-xs font-mono animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-tight">{errorMsg}</span>
              </div>
            )}

            {/* Success Message Display */}
            {successMsg && (
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 p-3 rounded-xl text-xs font-mono animate-fadeIn">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Authenticate Action Button */}
            <button
              id="authenticate-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden py-3.5 px-6 rounded-2xl font-mono font-bold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-lg"
              style={{
                background: isOwnerKeyDetected
                  ? 'linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)'
                  : `linear-gradient(135deg, ${activeTheme.primary} 0%, #16a34a 100%)`,
                color: isOwnerKeyDetected ? '#000000' : '#ffffff',
                boxShadow: isOwnerKeyDetected
                  ? '0 6px 20px rgba(234, 179, 8, 0.4)'
                  : `0 6px 20px ${activeTheme.primary}40`,
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>VERIFYING CREDENTIALS...</span>
                </>
              ) : (
                <>
                  <span>AUTHENTICATE</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Activity className="w-3 h-3 text-slate-400" />
              <span>Firebase RTDB Sync</span>
            </div>
          </div>
        </div>

        {/* Quick Hint Card */}
        <div className="mt-4 text-center">
          <p className="text-[11px] font-mono text-slate-500">
            MATRIX WIN V2 • Quantitative License Gateway • Single-Device Binding
          </p>
        </div>
      </div>
    </div>
  );
};
