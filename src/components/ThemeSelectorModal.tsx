import React, { useEffect } from 'react';
import { AppThemeId } from '../types';
import { THEMES } from '../utils/themes';
import { Palette, Check, X, Sparkles, ArrowLeft } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: AppThemeId;
  onSelectTheme: (themeId: AppThemeId) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playClick(800);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentTheme = THEMES[currentThemeId] || THEMES.matrix;

  const handleClose = () => {
    soundFx.playClick(800);
    onClose();
  };

  return (
    <div
      id="theme-selector-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Theme Selector"
      onClick={(e) => {
        // Close when clicking directly on the backdrop/overlay outside the modal card
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        id="theme-selector-modal-content"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl p-4 sm:p-6 relative border shadow-2xl transition-all font-sans cursor-default max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          background: currentTheme.cardBg,
          borderColor: currentTheme.primary,
          boxShadow: `0 0 35px ${currentTheme.primaryGlow}`,
        }}
      >
        {/* Top Action Bar: Back button and Close X button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <button
            id="theme-modal-back-btn"
            onClick={handleClose}
            title="Go back to Terminal (ESC)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all cursor-pointer hover:scale-102"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span>← BACK</span>
          </button>

          <span className="text-[11px] font-mono text-[#888888] hidden sm:inline">
            Press ESC or click outside to close
          </span>

          <button
            id="theme-modal-close-x-btn"
            onClick={handleClose}
            aria-label="Close theme modal"
            title="Close"
            className="w-8 h-8 rounded-lg text-[#888888] hover:text-white hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-black font-black shadow-lg shrink-0"
            style={{ background: currentTheme.primary }}
          >
            <Palette className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <h2
              className="text-base sm:text-lg font-black font-mono tracking-wider flex items-center gap-2"
              style={{ color: currentTheme.primary }}
            >
              <span>CHOOSE TERMINAL THEME</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-white/10 text-white font-mono font-normal">
                5 PRESETS
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#9CA3AF] font-mono">
              Changes background gradients, rain particles, cyber borders, and signal neon accents.
            </p>
          </div>
        </div>

        {/* Scrollable Themes Grid */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3 mb-4">
          {(Object.keys(THEMES) as AppThemeId[]).map((themeKey) => {
            const theme = THEMES[themeKey];
            const isSelected = themeKey === currentThemeId;

            return (
              <button
                key={themeKey}
                id={`theme-option-${themeKey}`}
                onClick={() => {
                  soundFx.playClick(1100);
                  onSelectTheme(themeKey);
                }}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
                  isSelected
                    ? 'ring-2 scale-102 shadow-lg'
                    : 'hover:border-white/40 hover:scale-101'
                }`}
                style={{
                  background: theme.cardBg,
                  borderColor: isSelected ? theme.primary : 'rgba(255,255,255,0.12)',
                  boxShadow: isSelected ? `0 0 20px ${theme.primaryGlow}` : 'none',
                }}
              >
                {/* Top preview swatch */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm inline-block"
                      style={{ background: theme.primary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm inline-block"
                      style={{ background: theme.secondary }}
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-white/20 shadow-sm inline-block"
                      style={{ background: theme.gold }}
                    />
                  </div>

                  {isSelected && (
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 text-black"
                      style={{ background: theme.primary }}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>ACTIVE</span>
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-mono font-bold text-sm text-white group-hover:text-opacity-100 flex items-center justify-between">
                    <span>{theme.name}</span>
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF] font-mono mt-0.5 line-clamp-1">
                    {theme.tagline}
                  </p>
                </div>

                {/* Subtle gradient strip at bottom */}
                <div
                  className="w-full h-1 rounded-full mt-2.5 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Footer with Back / Close Button */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs font-mono text-[#888888] shrink-0">
          <span className="flex items-center gap-1 text-[11px] sm:text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Preference saved automatically</span>
          </span>
          <button
            id="theme-modal-done-btn"
            onClick={handleClose}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-black font-mono text-xs font-black transition-all cursor-pointer hover:scale-105 shadow-lg"
            style={{
              background: currentTheme.primary,
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>BACK TO TERMINAL</span>
          </button>
        </div>
      </div>
    </div>
  );
};
