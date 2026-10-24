'use client';

import React, { useState } from 'react';
import {
  Moon,
  Clock,
  X,
  CheckCircle2,
  Sparkles,
  Volume2,
  StopCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  SLEEP_TIMER_PRESETS,
  formatSleepCountdown,
} from '@/lib/sleep-timer';

interface QuantumSleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRemainingSeconds?: number | null;
  remainingSeconds?: number | null;
  onStartTimer: (minutes: number, enableFade: boolean) => void;
  onCancelTimer: () => void;
  initialFadeoutEnabled?: boolean;
}

export const QuantumSleepTimerModal: React.FC<QuantumSleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeRemainingSeconds,
  remainingSeconds,
  onStartTimer,
  onCancelTimer,
  initialFadeoutEnabled = true,
}) => {
  const currentRemaining = activeRemainingSeconds !== undefined ? activeRemainingSeconds : (remainingSeconds ?? null);
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [enableFade, setEnableFade] = useState<boolean>(initialFadeoutEnabled);

  if (!isOpen) return null;

  const isTimerRunning = currentRemaining !== null && currentRemaining > 0;

  const handleStart = () => {
    let finalMinutes = selectedMinutes;
    if (customMinutes.trim()) {
      const parsed = parseInt(customMinutes, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 360) {
        finalMinutes = parsed;
      }
    }
    onStartTimer(finalMinutes, enableFade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E9E7] shadow-[0_12px_32px_rgba(16,24,40,0.12)] max-w-lg w-full p-6 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#89919B] hover:text-[#171D27] hover:bg-[#FAF9F6] transition-colors"
          aria-label="Close sleep timer modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAFBF5] border border-[#2DD4BF]/40 flex items-center justify-center text-[#009B87]">
            <Moon className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#171D27]">
              Quantum Sleep Timer
            </h2>
            <p className="text-[12px] text-[#626B78]">
              Automate nightly manifestation loops with gentle fadeout
            </p>
          </div>
        </div>

        {/* Active Countdown Banner if running */}
        {isTimerRunning && (
          <div className="mb-5 p-4 rounded-xl bg-[#F3FCF8] border border-[#2DD4BF]/40 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#009B87] text-white flex items-center justify-center animate-pulse">
                <Moon className="w-4 h-4 fill-current" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#009B87] block">
                  Sleep Loop Active
                </span>
                <span className="text-[20px] font-bold text-[#171D27] font-mono">
                  {formatSleepCountdown(currentRemaining)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onCancelTimer();
                onClose();
              }}
              className="py-1.5 px-3 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Turn Off Timer</span>
            </button>
          </div>
        )}

        {/* Preset Selectors */}
        <div className="mb-4">
          <label className="block text-[12px] font-semibold text-[#171D27] mb-2 flex items-center justify-between">
            <span>Select Sleep Duration Preset</span>
            <span className="text-[11px] text-[#89919B]">Optimal for brainwave entrainment</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SLEEP_TIMER_PRESETS.map((preset) => {
              const isSelected = selectedMinutes === preset.minutes && !customMinutes;
              return (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => {
                    setSelectedMinutes(preset.minutes);
                    setCustomMinutes('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#EAFBF5] border-[#009B87] ring-2 ring-[#009B87]/20 shadow-xs'
                      : 'bg-[#FAF9F6] border-[#EEF1EF] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[13px] font-bold text-[#171D27]">
                      {preset.label}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#009B87]" />}
                  </div>
                  <div className="text-[11px] font-medium text-[#009B87]">
                    {preset.subtext}
                  </div>
                  <div className="text-[10px] text-[#89919B] mt-1 line-clamp-1">
                    {preset.recommendedFor}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Minutes Input */}
        <div className="mb-4 p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] flex items-center justify-between">
          <label htmlFor="custom-minutes-input" className="text-[12px] font-semibold text-[#171D27]">
            Or enter custom duration (minutes):
          </label>
          <div className="flex items-center space-x-2">
            <input
              id="custom-minutes-input"
              type="number"
              min="1"
              max="360"
              placeholder="e.g. 20"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
              }}
              className="w-20 p-1.5 text-center rounded-lg border border-[#E5E9E7] bg-white text-[13px] font-mono text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/30"
            />
            <span className="text-[12px] text-[#626B78] font-medium">min</span>
          </div>
        </div>

        {/* Soft Fade Checkbox */}
        <div className="mb-6 p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
          <label className="flex items-center space-x-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={enableFade}
              onChange={(e) => setEnableFade(e.target.checked)}
              className="rounded text-[#009B87] focus:ring-[#009B87] accent-[#009B87]"
            />
            <div>
              <span className="text-[13px] font-semibold text-[#171D27] block">
                Gentle S-Curve Fadeout
              </span>
              <span className="text-[11px] text-[#626B78]">
                Smoothly reduces voice and Solfeggio volume over final 60s to prevent abrupt waking.
              </span>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E9E7] text-[#626B78] hover:bg-[#FAF9F6] text-[13px] font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[13px] font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <Moon className="w-4 h-4 fill-current" />
            <span>
              {isTimerRunning ? 'Update Sleep Timer' : 'Start Quantum Sleep'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
