'use client';

import React from 'react';
import {
  X,
  Headphones,
  CloudRain,
  Sliders,
  Sparkles,
  Zap,
  Moon,
  Sun,
  Activity,
  Check,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BINAURAL_BEAT_PRESETS,
  BrainwaveBand,
  getBrainwavePreset,
  calculateBinauralFrequencies,
} from '@/lib/binaural-beats';
import { globalSolfeggioSynth } from '@/lib/audio-player';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCarrierHz: number;
  currentBinauralBand: BrainwaveBand;
  onSelectBinauralBand: (band: BrainwaveBand) => void;
  isRainEnabled: boolean;
  onToggleRain: (enabled: boolean) => void;
  rainVolume: number;
  onChangeRainVolume: (volume: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({
  isOpen,
  onClose,
  activeCarrierHz,
  currentBinauralBand,
  onSelectBinauralBand,
  isRainEnabled,
  onToggleRain,
  rainVolume,
  onChangeRainVolume,
  playbackSpeed,
  onChangeSpeed,
}) => {
  if (!isOpen) return null;

  const activePreset = getBrainwavePreset(currentBinauralBand);
  const frequencies = calculateBinauralFrequencies(activeCarrierHz, activePreset.hz);

  const getBandIcon = (band: BrainwaveBand) => {
    switch (band) {
      case 'delta':
        return <Moon className="w-4 h-4 text-[#005F58]" />;
      case 'theta':
        return <Sparkles className="w-4 h-4 text-[#009B87]" />;
      case 'alpha':
        return <Sun className="w-4 h-4 text-[#2DD4BF]" />;
      case 'gamma':
        return <Zap className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl border border-[#E5E9E7] shadow-[0_12px_32px_rgba(16,24,40,0.12)] max-w-xl w-full p-6 sm:p-7 overflow-hidden relative max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-settings-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF1EF]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAFBF5] border border-[#2DD4BF]/50 flex items-center justify-center text-[#009B87]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 id="audio-settings-modal-title" className="text-[18px] font-bold text-[#171D27]">
                Neuro-Acoustic Audio Settings
              </h3>
              <p className="text-[12px] text-[#626B78]">
                Binaural brainwave modulation & crisp rainfall nature sound bed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close audio settings modal"
            className="p-2 rounded-xl text-[#89919B] hover:text-[#171D27] hover:bg-[#F7FAF8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* SECTION 1: BINAURAL BEAT BRAINWAVE MODULATION */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Headphones className="w-4 h-4 text-[#009B87]" />
                <h4 className="text-[14px] font-bold text-[#171D27]">
                  Binaural Beat Entrainment Mode
                </h4>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EAFBF5] text-[#005F58]">
                {activePreset.hz} Hz Difference
              </span>
            </div>
            <p className="text-[12px] text-[#626B78] mb-3 leading-relaxed">
              Modulates the Solfeggio carrier tone frequency with a stereo micro-detuning. For best entrainment, listen with stereo headphones so each ear receives its respective frequency.
            </p>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BINAURAL_BEAT_PRESETS.map((preset) => {
                const isSelected = currentBinauralBand === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      onSelectBinauralBand(preset.id);
                      globalSolfeggioSynth.setBinauralBeat(preset.hz);
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all relative ${
                      isSelected
                        ? 'bg-[#F3FCF8] border-[#009B87] shadow-sm ring-1 ring-[#009B87]/30'
                        : 'bg-white border-[#E5E9E7] hover:border-[#2DD4BF]/60 hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        {getBandIcon(preset.id)}
                        <span className="text-[13px] font-bold text-[#171D27]">
                          {preset.name}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.2 rounded">
                        {preset.hz} Hz
                      </span>
                    </div>

                    <p className="text-[11px] font-medium text-[#005F58] mb-1">
                      {preset.state}
                    </p>

                    <p className="text-[11px] text-[#626B78] line-clamp-2">
                      {preset.targetMechanism}
                    </p>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#009B87]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stereo Channel Math Inspector */}
            <div className="mt-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] text-[11px] text-[#626B78] flex items-center justify-between">
              <span className="font-medium text-[#171D27]">
                Live Stereo Modulation:
              </span>
              <span className="font-mono text-[#005F58]">
                Left: {frequencies.leftHz}Hz &bull; Right: {frequencies.rightHz}Hz &bull; Beat: {frequencies.beatHz}Hz
              </span>
            </div>
          </div>

          {/* SECTION 2: CRISP RAINFALL SOUND BED */}
          <div className="pt-2 border-t border-[#EEF1EF]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CloudRain className="w-4 h-4 text-[#009B87]" />
                <h4 className="text-[14px] font-bold text-[#171D27]">
                  Crisp Rainfall Nature Sound Bed
                </h4>
              </div>

              {/* Rain Switch Toggle */}
              <button
                onClick={() => {
                  const next = !isRainEnabled;
                  onToggleRain(next);
                  if (next) {
                    globalSolfeggioSynth.startRain(rainVolume);
                  } else {
                    globalSolfeggioSynth.stopRain();
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isRainEnabled ? 'bg-[#009B87]' : 'bg-[#E5E9E7]'
                }`}
                role="switch"
                aria-checked={isRainEnabled}
                aria-label="Toggle crisp rainfall sound"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isRainEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-[12px] text-[#626B78] mb-3 leading-relaxed">
              Algorithmic high-fidelity pink noise rainfall with delicate micro-droplets. Blends seamlessly underneath the spoken voice and Solfeggio carrier tone to dissolve mental chatter.
            </p>

            {/* Rain Volume Slider */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#EEF1EF] flex items-center justify-between gap-4">
              <div className="flex items-center space-x-2 shrink-0">
                {isRainEnabled && rainVolume > 0 ? (
                  <Volume2 className="w-4 h-4 text-[#009B87]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-[#89919B]" />
                )}
                <span className="text-[12px] font-semibold text-[#171D27]">
                  Rain Volume:
                </span>
                <span className="text-[12px] font-mono text-[#009B87] font-bold">
                  {Math.round(rainVolume * 100)}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="0.8"
                step="0.02"
                value={rainVolume}
                disabled={!isRainEnabled}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onChangeRainVolume(val);
                  globalSolfeggioSynth.setRainVolume(val);
                }}
                aria-label="Rainfall volume slider"
                className="w-40 sm:w-56 h-2 accent-[#009B87] cursor-pointer disabled:opacity-40"
              />
            </div>
          </div>

          {/* SECTION 3: PLAYBACK SPEED */}
          <div className="pt-2 border-t border-[#EEF1EF]">
            <h4 className="text-[14px] font-bold text-[#171D27] mb-3">Playback Speed</h4>
            <div className="grid grid-cols-5 gap-2">
              {[0.5, 1, 2, 5, 10].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`p-2 rounded-xl text-[12px] font-bold transition-all ${
                    playbackSpeed === s
                      ? 'bg-[#009B87] text-white shadow-sm'
                      : 'bg-[#FAF9F6] text-[#626B78] hover:bg-[#FFFFFF] border border-[#EEF1EF]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#EEF1EF] flex items-center justify-between">
          <span className="text-[11px] text-[#89919B] hidden sm:inline">
            Novalyte AI Neuro-Acoustic Calibration
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white font-semibold text-[13px] shadow-sm transition-all transform active:scale-95 ml-auto"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
