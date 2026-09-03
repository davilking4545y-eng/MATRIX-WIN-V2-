import React, { useState } from 'react';
import { MatrixCell } from '../types';
import { Grid, Sparkles, Flame, Target, Info } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface MatrixHeatmapGridProps {
  cells: MatrixCell[];
  selectedCell: MatrixCell | null;
  onSelectCell: (cell: MatrixCell) => void;
  onStrikeCell: (cell: MatrixCell) => void;
  lastStruckCellLabel?: string;
  isExecuting: boolean;
}

export const MatrixHeatmapGrid: React.FC<MatrixHeatmapGridProps> = ({
  cells,
  selectedCell,
  onSelectCell,
  onStrikeCell,
  lastStruckCellLabel,
  isExecuting,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'hot' | 'high_multiplier'>('all');
  const [hoveredCell, setHoveredCell] = useState<MatrixCell | null>(null);

  const filteredCells = cells.filter((c) => {
    if (filterMode === 'hot') return c.entropy > 70 || c.status === 'hot';
    if (filterMode === 'high_multiplier') return c.baseMultiplier >= 4.0;
    return true;
  });

  const getCellBg = (cell: MatrixCell) => {
    const isSelected = selectedCell && selectedCell.x === cell.x && selectedCell.y === cell.y;
    const isLastStruck = lastStruckCellLabel === cell.label;

    if (isLastStruck) {
      if (cell.status === 'win') return 'bg-[#00FF41] text-black ring-2 ring-white shadow-[0_0_15px_#00FF41] font-bold';
      if (cell.status === 'loss') return 'bg-[#DC2626] text-white ring-2 ring-red-400 font-bold';
    }

    if (isSelected) {
      return 'bg-[#00FF41]/20 border border-[#00FF41] text-[#00FF41] ring-2 ring-[#00FF41] shadow-[0_0_12px_rgba(0,255,65,0.4)]';
    }

    // Heat based styling
    if (cell.entropy > 85) {
      return 'bg-[#291708] border border-amber-600/50 text-amber-300 hover:bg-[#3d240d]';
    }
    if (cell.winProbability > 65) {
      return 'bg-[#00FF41]/10 border border-[#00FF41]/30 text-[#00FF41] hover:bg-[#00FF41]/20';
    }
    if (cell.baseMultiplier > 10) {
      return 'bg-[#0c1f30] border border-sky-600/40 text-sky-300 hover:bg-[#132d44]';
    }

    return 'bg-[#0E0E0E] border border-[#1A1A1A] text-[#888888] hover:border-[#00FF41]/40 hover:text-white';
  };

  return (
    <div
      id="matrix-heatmap-grid-card"
      className="bg-[#0A0A0A] border border-[#00FF41]/20 rounded-xl p-4 backdrop-blur-md flex flex-col justify-between shadow-[0_4px_25px_rgba(0,0,0,0.8)]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#00FF41]/10 border border-[#00FF41]/30 text-xs font-semibold text-[#00FF41]">
            <Grid className="w-3.5 h-3.5 text-[#00FF41]" />
            <span className="tracking-wider uppercase text-[10px] font-bold">64-NODE WIN PROBABILITY MATRIX</span>
          </div>
          <span className="text-[11px] text-[#888888] font-mono hidden sm:inline">
            SECTOR: <strong className="text-[#00FF41]">{selectedCell?.label || 'A1'}</strong>
          </span>
        </div>

        {/* Filter modes */}
        <div className="flex items-center gap-1 bg-[#0E0E0E] border border-[#222222] rounded p-0.5 text-[11px]">
          <button
            id="filter-all-sectors-btn"
            onClick={() => {
              soundFx.playClick(900);
              setFilterMode('all');
            }}
            className={`px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
              filterMode === 'all' ? 'bg-[#00FF41] text-black font-bold' : 'text-[#888888] hover:text-white'
            }`}
          >
            All (64)
          </button>
          <button
            id="filter-hot-sectors-btn"
            onClick={() => {
              soundFx.playClick(950);
              setFilterMode('hot');
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
              filterMode === 'hot' ? 'bg-amber-500 text-black font-bold' : 'text-[#888888] hover:text-amber-300'
            }`}
          >
            <Flame className="w-2.5 h-2.5" />
            Hot
          </button>
          <button
            id="filter-high-mult-btn"
            onClick={() => {
              soundFx.playClick(1000);
              setFilterMode('high_multiplier');
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono transition-colors cursor-pointer ${
              filterMode === 'high_multiplier'
                ? 'bg-sky-500 text-black font-bold'
                : 'text-[#888888] hover:text-sky-300'
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" />
            &gt;4x
          </button>
        </div>
      </div>

      {/* The 8x8 Grid */}
      <div className="relative overflow-x-auto pb-2">
        <div className="grid grid-cols-8 gap-1.5 min-w-[280px]">
          {cells.map((cell) => {
            const isDimmed =
              filterMode === 'hot' && cell.entropy <= 70 && cell.status !== 'hot'
                ? 'opacity-20 scale-95'
                : filterMode === 'high_multiplier' && cell.baseMultiplier < 4.0
                ? 'opacity-20 scale-95'
                : 'opacity-100';

            return (
              <button
                key={`${cell.x}-${cell.y}`}
                id={`matrix-cell-${cell.label}`}
                onClick={() => {
                  soundFx.playClick(1100);
                  onSelectCell(cell);
                }}
                onDoubleClick={() => {
                  if (!isExecuting) {
                    onStrikeCell(cell);
                  }
                }}
                onMouseEnter={() => setHoveredCell(cell)}
                onMouseLeave={() => setHoveredCell(null)}
                className={`group relative h-10 sm:h-12 border rounded flex flex-col items-center justify-center p-1 transition-all duration-150 select-none cursor-pointer ${getCellBg(
                  cell
                )} ${isDimmed}`}
              >
                {/* Cell Label */}
                <span className="text-[10px] sm:text-[11px] font-mono font-bold leading-tight">
                  {cell.label}
                </span>
                {/* Multiplier / Win Chance */}
                <span className="text-[9px] sm:text-[10px] font-mono opacity-80 leading-none mt-0.5">
                  {cell.baseMultiplier.toFixed(1)}x
                </span>

                {/* Hot marker dot */}
                {cell.entropy > 80 && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Inspector HUD */}
      <div className="mt-3 p-2.5 rounded-lg bg-[#070707] border border-[#00FF41]/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        {selectedCell ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#00FF41]">
                <Target className="w-3.5 h-3.5" />
                <span className="font-bold">SECTOR {selectedCell.label}</span>
              </div>
              <div className="text-[#888888]">
                Win Prob: <strong className="text-white">{selectedCell.winProbability}%</strong>
              </div>
              <div className="text-[#888888]">
                Multiplier: <strong className="text-amber-400">{selectedCell.baseMultiplier.toFixed(2)}x</strong>
              </div>
              <div className="hidden sm:block text-[#888888]">
                Entropy: <strong className="text-[#38bdf8]">{selectedCell.entropy.toFixed(1)}%</strong>
              </div>
            </div>

            <button
              id="strike-selected-sector-btn"
              disabled={isExecuting}
              onClick={() => onStrikeCell(selectedCell)}
              className="px-3.5 py-1.5 rounded bg-[#00FF41] hover:bg-[#00e63a] text-black font-bold font-mono text-xs uppercase tracking-wider active:scale-95 disabled:opacity-50 transition-transform cursor-pointer shadow-[0_0_10px_rgba(0,255,65,0.4)]"
            >
              {isExecuting ? 'STRIKING...' : `STRIKE ${selectedCell.label}`}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-[#888888]">
            <Info className="w-3.5 h-3.5 text-[#666666]" />
            <span>Select any coordinate to inspect odds and initiate target strikes</span>
          </div>
        )}
      </div>
    </div>
  );
};
