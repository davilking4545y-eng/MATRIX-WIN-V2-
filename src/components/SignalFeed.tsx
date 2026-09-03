import React, { useState } from 'react';
import { WinSignal } from '../types';
import { Terminal, Download, Search, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface SignalFeedProps {
  signals: WinSignal[];
  onClearFeed: () => void;
}

export const SignalFeed: React.FC<SignalFeedProps> = ({ signals, onClearFeed }) => {
  const [filter, setFilter] = useState<'all' | 'win' | 'jackpot' | 'loss'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSignals = signals.filter((sig) => {
    if (filter === 'win' && sig.type !== 'WIN' && sig.type !== 'JACKPOT' && sig.type !== 'SURGE') return false;
    if (filter === 'jackpot' && sig.type !== 'JACKPOT' && sig.multiplier < 4.0) return false;
    if (filter === 'loss' && sig.type !== 'LOSS') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const coordStr = `${String.fromCharCode(65 + sig.coordinate[1])}${sig.coordinate[0] + 1}`.toLowerCase();
      const hashMatch = sig.hash.toLowerCase().includes(q);
      const typeMatch = sig.type.toLowerCase().includes(q);
      return coordStr.includes(q) || hashMatch || typeMatch;
    }
    return true;
  });

  const exportCSV = () => {
    soundFx.playClick(1000);
    const headers = 'ID,Timestamp,Sector,Type,Stake,Multiplier,Profit,Hash\n';
    const rows = signals
      .map(
        (s) =>
          `${s.id},${new Date(s.timestamp).toISOString()},${String.fromCharCode(65 + s.coordinate[1])}${
            s.coordinate[0] + 1
          },${s.type},${s.stake},${s.multiplier},${s.profit},${s.hash}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrix-win-v2-telemetry-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="signal-feed-card"
      className="bg-[#0A0A0A] border border-[#00FF41]/20 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Feed Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs font-semibold text-[#00FF41]">
            <Terminal className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="tracking-wider uppercase text-[10px] font-bold">LIVE MATRIX AUDIT FEED</span>
          </div>
          <span className="text-xs text-[#888888] font-mono">
            COUNT: <strong className="text-white">{signals.length}</strong>
          </span>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-[#666666] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-signals-input"
              type="text"
              placeholder="Search Hash / Sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 pr-2.5 py-1 rounded bg-[#070707] border border-[#222222] text-[11px] font-mono text-[#E0E0E0] placeholder-[#555555] focus:outline-none focus:border-[#00FF41] w-36 sm:w-44"
            />
          </div>

          <button
            id="export-csv-btn"
            onClick={exportCSV}
            title="Export CSV Audit Telemetry"
            className="flex items-center gap-1 px-2.5 py-1 bg-[#0E0E0E] hover:bg-[#1A1A1A] border border-[#222222] text-[#E0E0E0] rounded text-[11px] font-mono cursor-pointer transition-colors"
          >
            <Download className="w-3 h-3 text-[#00FF41]" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-2.5 bg-[#070707] p-1 rounded-lg border border-[#1A1A1A] text-[11px] font-mono">
        {(
          [
            { id: 'all', label: 'All' },
            { id: 'win', label: 'Wins Only' },
            { id: 'jackpot', label: 'Jackpots (>4x)' },
            { id: 'loss', label: 'Misses' },
          ] as const
        ).map((f) => (
          <button
            key={f.id}
            id={`filter-feed-${f.id}-btn`}
            onClick={() => {
              soundFx.playClick(900);
              setFilter(f.id);
            }}
            className={`flex-1 py-1 px-2 rounded text-center transition-colors cursor-pointer ${
              filter === f.id
                ? 'bg-[#00FF41] text-black font-bold shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                : 'text-[#888888] hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Signals Scrollable Table */}
      <div className="relative overflow-y-auto max-h-64 sm:max-h-72 border border-[#1A1A1A] rounded-lg bg-[#070707]">
        {filteredSignals.length === 0 ? (
          <div className="p-8 text-center text-[#666666] text-xs font-mono">
            NO STRIKE TELEMETRY DETECTED. EXECUTE A STRIKE TO BEGIN AUDIT STREAM.
          </div>
        ) : (
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="sticky top-0 bg-[#0E0E0E] border-b border-[#1A1A1A] text-[#888888] text-[10px]">
              <tr>
                <th className="py-1.5 px-3">STATUS</th>
                <th className="py-1.5 px-2">SECTOR</th>
                <th className="py-1.5 px-2">MULT</th>
                <th className="py-1.5 px-2">STAKE</th>
                <th className="py-1.5 px-2">PAYOUT</th>
                <th className="py-1.5 px-3 text-right">HASH VERIFIED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {filteredSignals.map((sig) => {
                const isWin = sig.type === 'WIN' || sig.type === 'JACKPOT' || sig.type === 'SURGE';
                const sectorStr = `${String.fromCharCode(65 + sig.coordinate[1])}${sig.coordinate[0] + 1}`;

                return (
                  <tr
                    key={sig.id}
                    className="hover:bg-[#121212] transition-colors group"
                  >
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          isWin
                            ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/30'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
                        }`}
                      >
                        {isWin ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        {sig.type}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-white font-bold">{sectorStr}</td>
                    <td className="py-2 px-2 text-amber-300 font-bold">{sig.multiplier.toFixed(2)}x</td>
                    <td className="py-2 px-2 text-[#CCCCCC]">${sig.stake.toFixed(0)}</td>
                    <td className={`py-2 px-2 font-bold ${isWin ? 'text-[#00FF41]' : 'text-[#666666]'}`}>
                      {isWin ? `+$${sig.profit.toFixed(2)}` : `-$${sig.stake.toFixed(2)}`}
                    </td>
                    <td className="py-2 px-3 text-right text-[#666666] text-[10px] group-hover:text-[#CCCCCC] flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#00FF41]" />
                      <span>{sig.hash.slice(0, 8)}...{sig.hash.slice(-4)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
