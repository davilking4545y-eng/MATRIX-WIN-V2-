import React, { useState } from 'react';
import { StrategyMode, UserPreferences } from '../types';
import { Zap, Play, Square, Settings, ShieldAlert, DollarSign } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ExecutionTerminalProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onExecuteStrike: () => void;
  isExecuting: boolean;
  balance: number;
}

export const ExecutionTerminal: React.FC<ExecutionTerminalProps> = ({
  preferences,
  onUpdatePreferences,
  onExecuteStrike,
  isExecuting,
  balance,
}) => {
  const [showSafeguards, setShowSafeguards] = useState(false);

  const potentialPayout = preferences.stake * preferences.targetMultiplier;
  const potentialProfit = potentialPayout - preferences.stake;

  const quickStakes = [10, 25, 50, 100, 250, 500];
  const quickMultipliers = [1.25, 1.5, 2.0, 3.0, 5.0, 10.0];

  const handleStrategyChange = (mode: StrategyMode) => {
    soundFx.playClick(850);
    let targetMult = 2.0;
    if (mode === 'conservative') targetMult = 1.35;
    if (mode === 'balanced') targetMult = 2.0;
    if (mode === 'aggressive') targetMult = 5.0;
    if (mode === 'hyper_matrix') targetMult = 8.5;

    onUpdatePreferences({ strategy: mode, targetMultiplier: targetMult });
  };

  return (
    <div
      id="execution-terminal-card"
      className="bg-[#0A0A0A] border border-[#00FF41]/20 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs font-semibold text-[#00FF41]">
          <Zap className="w-3.5 h-3.5 text-[#00FF41]" />
          <span className="tracking-wider uppercase text-[10px] font-bold">STRIKE EXECUTION TERMINAL</span>
        </div>
        <button
          id="toggle-safeguards-btn"
          onClick={() => {
            soundFx.playClick(900);
            setShowSafeguards(!showSafeguards);
          }}
          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded border font-mono transition-colors cursor-pointer ${
            showSafeguards
              ? 'bg-[#00FF41]/15 border-[#00FF41]/40 text-[#00FF41]'
              : 'bg-[#0E0E0E] border-[#222222] text-[#888888] hover:text-white'
          }`}
        >
          <Settings className="w-3 h-3" />
          <span>Config</span>
        </button>
      </div>

      {/* Strategy Preset Switcher */}
      <div className="grid grid-cols-4 gap-1.5 mb-3 bg-[#070707] p-1 rounded-lg border border-[#1A1A1A]">
        {(
          [
            { id: 'conservative', label: 'SAFE', sub: '1.35x' },
            { id: 'balanced', label: 'NORMAL', sub: '2.0x' },
            { id: 'aggressive', label: 'TURBO', sub: '5.0x' },
            { id: 'hyper_matrix', label: 'HYPER', sub: '8.5x' },
          ] as const
        ).map((strat) => (
          <button
            key={strat.id}
            id={`strategy-${strat.id}-btn`}
            onClick={() => handleStrategyChange(strat.id)}
            className={`py-1.5 px-1 rounded text-center transition-all cursor-pointer ${
              preferences.strategy === strat.id
                ? 'bg-[#00FF41] text-black font-bold shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                : 'text-[#888888] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <div className="text-[11px] font-mono leading-none">{strat.label}</div>
            <div className="text-[9px] opacity-80 font-mono mt-0.5">{strat.sub}</div>
          </button>
        ))}
      </div>

      {/* Stake Selection & Multiplier Selection */}
      <div className="space-y-3">
        {/* Stake Input */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-[#00FF41]" />
              <span className="tracking-wider text-[10px] uppercase font-bold text-[#00FF41]/80">STAKE AMOUNT</span>
            </span>
            <span className="text-[11px] text-[#888888]">
              Max: ${balance.toFixed(0)}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] font-mono text-sm">
                $
              </span>
              <input
                id="stake-amount-input"
                type="number"
                min="1"
                max={balance}
                value={preferences.stake}
                onChange={(e) => {
                  const val = Math.max(1, Number(e.target.value) || 1);
                  onUpdatePreferences({ stake: Math.min(val, balance) });
                }}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#070707] border border-[#222222] text-white font-mono text-sm focus:outline-none focus:border-[#00FF41]"
              />
            </div>
            {/* Quick Stake Modifiers */}
            <button
              id="stake-half-btn"
              onClick={() => {
                soundFx.playClick();
                onUpdatePreferences({ stake: Math.max(1, Math.floor(preferences.stake / 2)) });
              }}
              className="px-2.5 py-1.5 bg-[#0E0E0E] hover:bg-[#1A1A1A] border border-[#222222] text-[#E0E0E0] font-mono text-xs rounded-lg cursor-pointer"
            >
              1/2
            </button>
            <button
              id="stake-double-btn"
              onClick={() => {
                soundFx.playClick();
                onUpdatePreferences({ stake: Math.min(balance, preferences.stake * 2) });
              }}
              className="px-2.5 py-1.5 bg-[#0E0E0E] hover:bg-[#1A1A1A] border border-[#222222] text-[#E0E0E0] font-mono text-xs rounded-lg cursor-pointer"
            >
              2x
            </button>
            <button
              id="stake-max-btn"
              onClick={() => {
                soundFx.playClick(950);
                onUpdatePreferences({ stake: Math.min(balance, 1000) });
              }}
              className="px-2.5 py-1.5 bg-[#00FF41]/15 hover:bg-[#00FF41]/25 border border-[#00FF41]/40 text-[#00FF41] font-mono text-xs font-bold rounded-lg cursor-pointer"
            >
              MAX
            </button>
          </div>

          {/* Quick Stake Pills */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5">
            {quickStakes.map((amt) => (
              <button
                key={amt}
                id={`quick-stake-${amt}-btn`}
                onClick={() => {
                  soundFx.playClick(800 + amt);
                  onUpdatePreferences({ stake: amt });
                }}
                className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-colors cursor-pointer ${
                  preferences.stake === amt
                    ? 'bg-[#00FF41]/20 border-[#00FF41] text-[#00FF41] font-bold'
                    : 'bg-[#0E0E0E] border-[#222222] text-[#888888] hover:text-white'
                }`}
              >
                ${amt}
              </button>
            ))}
          </div>
        </div>

        {/* Target Multiplier */}
        <div>
          <div className="flex items-center justify-between text-xs text-[#888888] font-mono mb-1">
            <span className="tracking-wider text-[10px] uppercase font-bold text-amber-400/80">TARGET MULTIPLIER</span>
            <span className="text-amber-400 font-bold font-mono">
              {preferences.targetMultiplier.toFixed(2)}x
            </span>
          </div>

          <div className="flex items-center gap-1 mb-1.5">
            {quickMultipliers.map((m) => (
              <button
                key={m}
                id={`target-multiplier-${m}-btn`}
                onClick={() => {
                  soundFx.playClick(900 + m * 50);
                  onUpdatePreferences({ targetMultiplier: m });
                }}
                className={`flex-1 text-[11px] py-1 rounded font-mono border transition-colors cursor-pointer ${
                  preferences.targetMultiplier === m
                    ? 'bg-amber-500 text-black font-bold border-amber-400'
                    : 'bg-[#0E0E0E] border-[#222222] text-[#888888] hover:text-white'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>

          <input
            id="target-multiplier-slider"
            type="range"
            min="1.1"
            max="20"
            step="0.1"
            value={preferences.targetMultiplier}
            onChange={(e) => onUpdatePreferences({ targetMultiplier: parseFloat(e.target.value) })}
            className="w-full accent-[#00FF41] bg-[#141414] cursor-pointer"
          />
        </div>

        {/* Projected Payout Bar */}
        <div className="bg-[#070707] border border-[#00FF41]/20 rounded-lg p-2.5 flex items-center justify-between font-mono text-xs">
          <div>
            <span className="text-[#888888] block text-[10px]">PROJECTED RETURN:</span>
            <span className="text-[#00FF41] font-bold text-sm">
              ${potentialPayout.toFixed(2)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[#888888] block text-[10px]">NET PROFIT:</span>
            <span className="text-amber-300 font-bold text-sm">
              +${potentialProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Safeguard Options Toggle */}
        {showSafeguards && (
          <div className="p-2.5 rounded-lg bg-[#0E0E0E] border border-[#222222] space-y-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Autopilot Strike Frequency</span>
            </div>
            <div className="flex items-center gap-1">
              {[250, 500, 1000].map((speed) => (
                <button
                  key={speed}
                  id={`runner-speed-${speed}-btn`}
                  onClick={() => onUpdatePreferences({ autoRunnerSpeedMs: speed })}
                  className={`flex-1 py-1 rounded text-center border font-mono text-xs cursor-pointer ${
                    preferences.autoRunnerSpeedMs === speed
                      ? 'bg-sky-950 border-sky-600 text-sky-300 font-bold'
                      : 'border-[#222222] bg-[#070707] text-[#888888]'
                  }`}
                >
                  {speed}ms
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Execution Buttons */}
        <div className="pt-1 flex items-center gap-2">
          {/* Main Strike Button */}
          <button
            id="execute-matrix-strike-btn"
            disabled={isExecuting || balance < preferences.stake}
            onClick={() => {
              soundFx.playClick(1200);
              onExecuteStrike();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00FF41] hover:bg-[#00e63a] text-black font-mono font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,65,0.4)] active:scale-98 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <Zap className={`w-4 h-4 ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'PROCESSING...' : 'EXECUTE STRIKE'}</span>
          </button>

          {/* Autopilot Runner Toggle */}
          <button
            id="toggle-autopilot-btn"
            onClick={() => {
              soundFx.playClick(preferences.autoRunner ? 700 : 1300);
              onUpdatePreferences({ autoRunner: !preferences.autoRunner });
            }}
            className={`py-3 px-3.5 rounded-xl border font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              preferences.autoRunner
                ? 'bg-rose-950 border-rose-700 text-rose-300 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-[#0E0E0E] border-[#00FF41]/40 text-[#00FF41] hover:bg-[#00FF41]/10'
            }`}
          >
            {preferences.autoRunner ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{preferences.autoRunner ? 'STOP' : 'AUTO'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
