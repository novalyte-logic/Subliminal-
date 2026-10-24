'use client';

import React, { useState } from 'react';
import {
  Download,
  X,
  Volume2,
  Radio,
  Sliders,
  CheckCircle2,
  Sparkles,
  Headphones,
  Repeat,
  FileAudio,
  CloudRain,
  Moon,
  Sun,
  Zap,
} from 'lucide-react';
import { QuantumAffirmationResult, SOLFEGGIO_FREQUENCIES } from '@/lib/quantum-engine';
import { renderMasterWav } from '@/lib/wav-export';
import {
  BINAURAL_BEAT_PRESETS,
  BrainwaveBand,
  getBrainwavePreset,
} from '@/lib/binaural-beats';

interface ExportWavModalProps {
  isOpen: boolean;
  onClose: () => void;
  affirmation: QuantumAffirmationResult | null;
  defaultVoiceVolume?: number;
  defaultCarrierVolume?: number;
  defaultCarrierEnabled?: boolean;
  defaultBinauralBand?: BrainwaveBand;
  defaultIncludeRain?: boolean;
  defaultRainVolume?: number;
}

export const ExportWavModal: React.FC<ExportWavModalProps> = ({
  isOpen,
  onClose,
  affirmation,
  defaultVoiceVolume = 0.95,
  defaultCarrierVolume = 0.25,
  defaultCarrierEnabled = true,
  defaultBinauralBand = 'theta',
  defaultIncludeRain = false,
  defaultRainVolume = 0.25,
}) => {
  const [includeVoice, setIncludeVoice] = useState(true);
  const [includeCarrier, setIncludeCarrier] = useState(defaultCarrierEnabled);
  const [voiceVolume, setVoiceVolume] = useState(defaultVoiceVolume);
  const [carrierVolume, setCarrierVolume] = useState(defaultCarrierVolume);
  const [binauralBand, setBinauralBand] = useState<BrainwaveBand>(defaultBinauralBand);
  const [includeRain, setIncludeRain] = useState(defaultIncludeRain);
  const [rainVolume, setRainVolume] = useState(defaultRainVolume);
  const [repeatCount, setRepeatCount] = useState<number>(3); // Default 3 cycles
  const [isRendering, setIsRendering] = useState(false);
  const [renderingStep, setRenderingStep] = useState<string>('');
  const [exportComplete, setExportComplete] = useState(false);

  if (!isOpen || !affirmation) return null;

  const freqObj =
    SOLFEGGIO_FREQUENCIES.find((f) => f.hz === affirmation.frequencyHz) ||
    SOLFEGGIO_FREQUENCIES[1];

  const handleExport = async () => {
    setIsRendering(true);
    setExportComplete(false);

    try {
      let voiceBase64 = affirmation.audioBase64;

      // 1. If voice is included and audioBase64 not yet generated, fetch it now
      if (includeVoice && !voiceBase64) {
        setRenderingStep('Synthesizing high-frequency spoken voice audio...');
        try {
          const res = await fetch('/api/affirmation/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: affirmation.quantumText,
              voiceName: affirmation.voiceName || 'Kore',
              frequencyHz: affirmation.frequencyHz,
            }),
          });
          const data = await res.json();
          if (data.audioBase64) {
            voiceBase64 = data.audioBase64;
          }
        } catch (e) {
          console.warn('Voice synthesis fetch error:', e);
        }
      }

      // 2. Render combined master audio
      const selectedBinaural = getBrainwavePreset(binauralBand);
      setRenderingStep(
        `Compositing ${affirmation.frequencyHz}Hz Solfeggio tone (${selectedBinaural.hz}Hz ${selectedBinaural.name} binaural) + ${includeRain ? 'crisp rainfall + ' : ''}spoken voice...`
      );

      const result = await renderMasterWav({
        voiceBase64Wav: voiceBase64,
        frequencyHz: affirmation.frequencyHz,
        binauralDifference: selectedBinaural.hz,
        voiceVolume: includeVoice ? voiceVolume : 0,
        carrierVolume: includeCarrier ? carrierVolume : 0,
        includeRain,
        rainVolume: includeRain ? rainVolume : 0,
        repeatCount,
        sampleRate: 44100,
        estimatedDurationSeconds: affirmation.estimatedDurationSeconds,
      });

      setRenderingStep('Encoding 16-bit Stereo PCM WAV file...');

      // 3. Trigger download
      const safeParadigm = affirmation.paradigm.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `novalyte_quantum_${affirmation.frequencyHz}Hz_${safeParadigm}_${repeatCount}x.wav`;

      const downloadUrl = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportComplete(true);
      setRenderingStep('Master WAV successfully generated and downloaded!');
      setTimeout(() => {
        setIsRendering(false);
      }, 1500);
    } catch (err) {
      console.error('WAV export error:', err);
      setRenderingStep('Export failed. Please check browser audio permissions.');
      setIsRendering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-all">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E9E7] shadow-[0_12px_32px_rgba(16,24,40,0.12)] max-w-lg w-full p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#89919B] hover:text-[#171D27] hover:bg-[#FAF9F6] transition-colors"
          aria-label="Close export dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAFBF5] border border-[#2DD4BF]/40 flex items-center justify-center text-[#009B87]">
            <FileAudio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-[#171D27]">
              Export Master Audio (.wav)
            </h2>
            <p className="text-[12px] text-[#626B78]">
              Composite Voice + {affirmation.frequencyHz}Hz Carrier Bed for offline listening
            </p>
          </div>
        </div>

        {/* Selected Affirmation Quote */}
        <div className="p-3.5 rounded-xl bg-[#F3FCF8] border border-[#2DD4BF]/30 mb-5 text-[13px] text-[#171D27] font-medium leading-relaxed">
          &ldquo;{affirmation.quantumText}&rdquo;
        </div>

        {/* Track Mixer Options */}
        <div className="space-y-4 mb-5">
          {/* Spoken Voice Track */}
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 text-[13px] font-semibold text-[#171D27] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVoice}
                  onChange={(e) => setIncludeVoice(e.target.checked)}
                  className="rounded text-[#009B87] focus:ring-[#009B87] accent-[#009B87]"
                />
                <div className="flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-[#009B87]" />
                  <span>Spoken Quantum Incantation</span>
                </div>
              </label>
              <span className="text-[11px] font-mono text-[#626B78]">
                {includeVoice ? `${Math.round(voiceVolume * 100)}%` : 'Muted'}
              </span>
            </div>
            {includeVoice && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 accent-[#009B87] cursor-pointer"
              />
            )}
          </div>

          {/* Solfeggio Carrier Tone Track */}
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 text-[13px] font-semibold text-[#171D27] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCarrier}
                  onChange={(e) => setIncludeCarrier(e.target.checked)}
                  className="rounded text-[#009B87] focus:ring-[#009B87] accent-[#009B87]"
                />
                <div className="flex items-center space-x-1.5">
                  <Radio className="w-4 h-4 text-[#2DD4BF]" />
                  <span>
                    {affirmation.frequencyHz}Hz Solfeggio Harmonic Bed
                  </span>
                </div>
              </label>
              <span className="text-[11px] font-mono text-[#009B87] font-semibold">
                {includeCarrier ? `${Math.round((carrierVolume / 0.6) * 100)}%` : 'Muted'}
              </span>
            </div>
            {includeCarrier && (
              <>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.02"
                  value={carrierVolume}
                  onChange={(e) => setCarrierVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-[#2DD4BF] cursor-pointer mb-3"
                />
                
                {/* Binaural Beat Modulation Selector */}
                <div className="pt-2 border-t border-[#EEF1EF]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-[#171D27] flex items-center space-x-1">
                      <Headphones className="w-3.5 h-3.5 text-[#009B87]" />
                      <span>Binaural Brainwave Entrainment</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.5 rounded">
                      +{getBrainwavePreset(binauralBand).hz}Hz Detune
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {BINAURAL_BEAT_PRESETS.map((preset) => {
                      const isSelected = binauralBand === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => setBinauralBand(preset.id)}
                          className={`p-2 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-[#EAFBF5] border-[#009B87] text-[#009B87] shadow-2xs font-bold'
                              : 'bg-white border-[#EEF1EF] text-[#626B78] hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{preset.name}</div>
                          <div className="text-[9px] text-[#89919B] mt-0.5">{preset.hz}Hz • {preset.state.split(' ')[0]}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Crisp Rainfall Sound Bed Track */}
          <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-2 text-[13px] font-semibold text-[#171D27] cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeRain}
                  onChange={(e) => setIncludeRain(e.target.checked)}
                  className="rounded text-[#009B87] focus:ring-[#009B87] accent-[#009B87]"
                />
                <div className="flex items-center space-x-1.5">
                  <CloudRain className="w-4 h-4 text-[#009B87]" />
                  <span>Crisp Rainfall Nature Sound Bed</span>
                </div>
              </label>
              <span className="text-[11px] font-mono text-[#009B87] font-semibold">
                {includeRain ? `${Math.round(rainVolume * 100)}%` : 'Muted'}
              </span>
            </div>
            {includeRain && (
              <>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={rainVolume}
                  onChange={(e) => setRainVolume(parseFloat(e.target.value))}
                  className="w-full h-1.5 accent-[#009B87] cursor-pointer mb-2"
                />
                <p className="text-[10px] text-[#626B78]">
                  Algorithmic stereo pink noise with micro-droplet transients to mask ambient auditory distractions
                </p>
              </>
            )}
          </div>

          {/* Repetition / Length Selector */}
          <div>
            <label className="block text-[12px] font-semibold text-[#171D27] mb-2 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <Repeat className="w-3.5 h-3.5 text-[#009B87]" />
                <span>Meditation Repetition Loops</span>
              </span>
              <span className="text-[11px] text-[#89919B]">
                {repeatCount === 1 ? '~15s' : repeatCount === 3 ? '~45s' : '~2 min'}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 1, label: '1 Loop', sub: 'Quick Anchor' },
                { count: 3, label: '3 Loops', sub: 'Priming' },
                { count: 7, label: '7 Loops', sub: 'Deep Hypnosis' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setRepeatCount(item.count)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    repeatCount === item.count
                      ? 'bg-[#EAFBF5] border-[#009B87] text-[#009B87] shadow-xs'
                      : 'bg-[#FAF9F6] border-[#EEF1EF] text-[#626B78] hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="text-[12px] font-bold">{item.label}</div>
                  <div className="text-[10px] text-[#89919B] mt-0.5">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Rendering Status */}
        {isRendering && (
          <div className="mb-4 p-3 rounded-xl bg-[#F3FCF8] border border-[#2DD4BF]/40 flex items-center space-x-2.5">
            <div className="w-4 h-4 border-2 border-[#009B87] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-[12px] font-medium text-[#005F58]">
              {renderingStep}
            </span>
          </div>
        )}

        {exportComplete && !isRendering && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-800 text-[12px] font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Master WAV downloaded successfully!</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5E9E7] text-[#626B78] hover:bg-[#FAF9F6] text-[13px] font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isRendering || (!includeVoice && !includeCarrier)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[13px] font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isRendering ? 'Rendering Mix...' : 'Download Master .wav'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
