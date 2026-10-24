'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  Wind,
  Sparkles,
  X,
  Activity,
  Heart,
  Sliders,
  Check,
  Zap,
} from 'lucide-react';
import {
  getHrvLiveState,
  calculateHrvBreathTiming,
  calculateCoherenceScore,
  HRV_PRESETS,
  HrvLiveState,
} from '@/lib/hrv-resonance';
import { globalSolfeggioSynth } from '@/lib/audio-player';

interface QuantumBreathingOrbProps {
  isPlaying: boolean;
  frequencyHz?: number;
  className?: string;
  showText?: boolean;
  compact?: boolean;
  showLabel?: boolean;
  hrvBpm?: number;
  setHrvBpm?: (bpm: number) => void;
  hrvSyncEnabled?: boolean;
  setHrvSyncEnabled?: (enabled: boolean) => void;
}

export const QuantumBreathingOrb: React.FC<QuantumBreathingOrbProps> = ({
  isPlaying,
  frequencyHz = 528,
  className = '',
  showText = true,
  compact = false,
  showLabel = true,
  hrvBpm = 5.5,
  setHrvBpm,
  hrvSyncEnabled = true,
  setHrvSyncEnabled,
}) => {
  const [liveState, setLiveState] = useState<HrvLiveState>(() => getHrvLiveState(0, hrvBpm));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const startTimestampRef = useRef<number | null>(null);
  const lastCycleIndexRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const timing = calculateHrvBreathTiming(hrvBpm);
  const coherenceScore = calculateCoherenceScore(hrvBpm);

  useEffect(() => {
    let active = true;

    const animate = (timestamp: number) => {
      if (!active) return;

      if (!startTimestampRef.current) {
        startTimestampRef.current = timestamp;
      }

      const elapsed = timestamp - startTimestampRef.current;
      const state = getHrvLiveState(isPlaying ? elapsed : 0, hrvBpm);
      setLiveState(state);

      // Track completed cycles based on dynamic cycle duration
      const currentCycle = Math.floor(elapsed / timing.totalCycleMs);
      if (currentCycle > lastCycleIndexRef.current) {
        lastCycleIndexRef.current = currentCycle;
        setCycleCount((prev) => prev + 1);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, hrvBpm, timing.totalCycleMs]);

  const handleBpmChange = (newBpm: number) => {
    setHrvBpm?.(newBpm);
    globalSolfeggioSynth.setHrvBpm(newBpm);
  };

  const handleToggleSync = (enabled: boolean) => {
    setHrvSyncEnabled?.(enabled);
    globalSolfeggioSynth.setHrvSync(enabled, hrvBpm);
  };

  return (
    <>
      {/* Compact Inline Breathing Orb for AudioPlayerBar */}
      <div
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] hover:border-[#2DD4BF]/50 cursor-pointer transition-all group ${className}`}
        title={`HRV Breathing Sync: ${hrvBpm} BPM (${timing.totalCycleSeconds.toFixed(1)}s breath cycle). Click to adjust.`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsModalOpen(true);
          }
        }}
        aria-label="Open heart rate variability and breathing resonance tuner"
      >
        {/* Pulsing Orb Graphic */}
        <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
          {/* Outer Breathing Aura Ring */}
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#009B87] to-[#2DD4BF] transition-transform duration-200"
            style={{
              transform: `scale(${isPlaying ? liveState.orbScale : 0.85})`,
              opacity: isPlaying ? liveState.glowOpacity * 0.45 : 0.2,
              filter: 'blur(3px)',
            }}
          />

          {/* Secondary Harmonic Wave Ring */}
          <div
            className="absolute inset-0.5 rounded-full border border-[#2DD4BF]/60 transition-transform duration-200"
            style={{
              transform: `scale(${isPlaying ? liveState.orbScale * 0.95 : 0.85})`,
              opacity: isPlaying ? 0.7 : 0.25,
            }}
          />

          {/* Core Luminous Orb */}
          <div
            className="relative w-3.5 h-3.5 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#009B87] shadow-[0_0_8px_rgba(45,212,191,0.6)] transition-transform duration-150 flex items-center justify-center"
            style={{
              transform: `scale(${isPlaying ? 0.9 + (liveState.orbScale - 0.8) * 0.4 : 0.9})`,
            }}
          >
            <div className="w-1 h-1 rounded-full bg-white opacity-80" />
          </div>
        </div>

        {/* Text Guidance */}
        {showText && showLabel && (
          <div className={`flex flex-col ${compact ? 'min-w-[50px]' : 'min-w-[70px]'}`}>
            <div className="flex items-center space-x-1">
              <span className="text-[11px] font-bold text-[#171D27] tracking-tight group-hover:text-[#009B87] transition-colors leading-none">
                {isPlaying ? liveState.label : 'HRV Sync'}
              </span>
            </div>
            {!compact && (
              <span className="text-[9px] font-mono text-[#009B87] font-semibold mt-0.5">
                {hrvBpm} BPM • {timing.totalCycleSeconds.toFixed(1)}s
              </span>
            )}
          </div>
        )}
      </div>

      {/* Full Modal Immersive HRV & Breathing Resonance Studio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-[#FFFFFF] rounded-3xl border border-[#E5E9E7] shadow-[0_20px_60px_rgba(16,24,40,0.18)] max-w-lg w-full p-6 sm:p-8 relative overflow-hidden text-center max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hrv-modal-title"
          >
            {/* Close */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-[#89919B] hover:text-[#171D27] hover:bg-[#FAF9F6] transition-colors"
              aria-label="Close breathing modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#EAFBF5] border border-[#2DD4BF]/40 text-[#009B87] text-xs font-semibold mb-2 mx-auto">
              <Heart className="w-3.5 h-3.5 text-[#009B87] fill-[#009B87]/20" />
              <span>Heart Rate Variability (HRV) Resonance Sync</span>
            </div>

            <h3 id="hrv-modal-title" className="text-[22px] font-bold text-[#171D27] tracking-tight mb-1">
              Cardiac Coherence & Breath Resonance
            </h3>
            <p className="text-[12px] text-[#626B78] mb-4">
              Dynamically calibrate the pulsing orb and {frequencyHz}Hz Solfeggio carrier tone to your baroreflex frequency.
            </p>

            <div className="overflow-y-auto pr-1 space-y-5 flex-1">
              {/* Large Interactive Pulsing Orb */}
              <div className="relative w-52 h-52 mx-auto my-3 flex items-center justify-center">
                {/* Diffuse Outer Ambient Field */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#009B87] via-[#2DD4BF] to-[#005F58] transition-transform duration-300"
                  style={{
                    transform: `scale(${liveState.orbScale * 1.08})`,
                    opacity: liveState.glowOpacity * 0.35,
                    filter: 'blur(28px)',
                  }}
                />

                {/* Concentric Harmonic Wave Rings */}
                <div
                  className="absolute inset-4 rounded-full border border-[#2DD4BF]/30 transition-transform duration-300"
                  style={{
                    transform: `scale(${liveState.orbScale})`,
                  }}
                />
                <div
                  className="absolute inset-10 rounded-full border border-[#009B87]/40 transition-transform duration-300"
                  style={{
                    transform: `scale(${liveState.orbScale * 0.9})`,
                  }}
                />

                {/* Central Glowing Orb Core */}
                <div
                  className="relative w-28 h-28 rounded-full bg-gradient-to-br from-[#2DD4BF] via-[#009B87] to-[#005F58] shadow-[0_0_35px_rgba(0,155,135,0.45)] flex flex-col items-center justify-center text-white transition-transform duration-200"
                  style={{
                    transform: `scale(${liveState.orbScale})`,
                  }}
                >
                  <Wind className="w-6 h-6 mb-1 opacity-90 drop-shadow-sm" />
                  <span className="text-[14px] font-black tracking-wider uppercase drop-shadow-sm">
                    {liveState.phase}
                  </span>
                  <span className="text-[10px] font-mono text-white/80 mt-0.5">
                    {Math.round(liveState.phaseProgress * 100)}%
                  </span>
                </div>
              </div>

              {/* Dynamic Breath Instruction */}
              <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#EEF1EF]">
                <div className="text-[14px] font-bold text-[#171D27] mb-0.5">
                  {liveState.label}
                </div>
                <p className="text-[12px] text-[#626B78] leading-relaxed">
                  {liveState.guidanceText}
                </p>
              </div>

              {/* Interactive Target Breathing Rate Tuner */}
              <div className="bg-white p-4 rounded-2xl border border-[#E5E9E7] text-left space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#009B87]" />
                    <span className="text-[13px] font-bold text-[#171D27]">
                      Target Breathing Rate
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[14px] font-extrabold text-[#009B87] bg-[#EAFBF5] px-2 py-0.5 rounded-lg border border-[#2DD4BF]/40">
                      {hrvBpm.toFixed(1)} BPM
                    </span>
                    <span className="text-[11px] font-mono text-[#626B78]">
                      ({timing.totalCycleSeconds.toFixed(1)}s / breath)
                    </span>
                  </div>
                </div>

                {/* Range Slider */}
                <div>
                  <input
                    type="range"
                    min="3.5"
                    max="10.0"
                    step="0.1"
                    value={hrvBpm}
                    onChange={(e) => handleBpmChange(parseFloat(e.target.value))}
                    className="w-full h-2 accent-[#009B87] bg-[#EEF1EF] rounded-lg cursor-pointer"
                    aria-label="Adjust target breathing rate in breaths per minute"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-[#89919B] mt-1">
                    <span>3.5 BPM (Deep Slow)</span>
                    <span className="text-[#009B87] font-bold">5.5 BPM (Peak Coherence)</span>
                    <span>10.0 BPM (Active)</span>
                  </div>
                </div>

                {/* Presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {HRV_PRESETS.map((preset) => {
                    const isSelected = Math.abs(hrvBpm - preset.bpm) < 0.1;
                    return (
                      <button
                        key={preset.bpm}
                        type="button"
                        onClick={() => handleBpmChange(preset.bpm)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-[#EAFBF5] border-[#009B87] text-[#009B87] shadow-2xs font-bold'
                            : 'bg-[#FAF9F6] border-[#EEF1EF] text-[#626B78] hover:bg-[#FFFFFF]'
                        }`}
                      >
                        <div className="text-[11px] font-bold flex items-center justify-between">
                          <span>{preset.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#009B87]" />}
                        </div>
                        <div className="text-[9px] text-[#89919B] mt-0.5 leading-tight truncate">
                          {preset.subtext}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Solfeggio Carrier Pulse Frequency Info */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EEF1EF] text-[11px]">
                  <span className="text-[#626B78] flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#009B87]" />
                    <span>Solfeggio LFO Carrier Pulse:</span>
                  </span>
                  <span className="font-mono font-bold text-[#005F58]">
                    {timing.lfoFrequencyHz.toFixed(4)} Hz
                  </span>
                </div>
              </div>

              {/* Coherence & Rhythm Status */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[#F3FCF8] border border-[#2DD4BF]/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#009B87] mb-0.5">
                    Coherence Index
                  </div>
                  <div className="text-[18px] font-extrabold text-[#171D27]">
                    {coherenceScore}%
                  </div>
                  <div className="text-[10px] text-[#626B78] mt-0.5">
                    Baroreflex RSA alignment
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#626B78] mb-0.5">
                    Resonance Cycles
                  </div>
                  <div className="text-[18px] font-extrabold text-[#171D27]">
                    #{cycleCount + 1}
                  </div>
                  <div className="text-[10px] text-[#626B78] mt-0.5">
                    Continuous quantum flow
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-4 mt-2 border-t border-[#EEF1EF] flex items-center justify-between">
              <label className="flex items-center space-x-2 text-[12px] font-semibold text-[#171D27] cursor-pointer">
                <input
                  type="checkbox"
                  checked={hrvSyncEnabled}
                  onChange={(e) => handleToggleSync(e.target.checked)}
                  className="rounded text-[#009B87] focus:ring-[#009B87] accent-[#009B87]"
                />
                <span>Sync Solfeggio Audio Modulation</span>
              </label>

              <button
                onClick={() => setIsModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[12px] font-semibold transition-all shadow-xs"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
