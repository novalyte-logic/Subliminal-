'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  BookmarkPlus,
  Check,
  Copy,
  Download,
  Info,
  Radio,
  Volume2,
  Activity,
  HeartHandshake,
  Compass,
  Flame,
  ArrowRight,
  ShieldCheck,
  Headphones,
  CloudRain,
  Moon,
  Sun,
} from 'lucide-react';
import {
  QuantumAffirmationResult,
  SOLFEGGIO_FREQUENCIES,
  QUANTUM_PARADIGMS,
  PRESET_AFFIRMATIONS,
  QuantumParadigmId,
} from '@/lib/quantum-engine';
import { ExportWavModal } from './ExportWavModal';
import { VoiceAffirmationUploader } from './VoiceAffirmationUploader';
import {
  BINAURAL_BEAT_PRESETS,
  BrainwaveBand,
  getBrainwavePreset,
} from '@/lib/binaural-beats';

interface TransmuterStudioProps {
  onAffirmationGenerated: (affirmation: QuantumAffirmationResult) => void;
  onSaveToLibrary: (affirmation: QuantumAffirmationResult) => void;
  onPlayAffirmation: (affirmation: QuantumAffirmationResult) => void;
  currentResult: QuantumAffirmationResult | null;
  savedIds: string[];
  binauralBand?: BrainwaveBand;
  onSelectBinauralBand?: (band: BrainwaveBand) => void;
  isRainEnabled?: boolean;
  onToggleRain?: (enabled: boolean) => void;
  rainVolume?: number;
  onChangeRainVolume?: (vol: number) => void;
}

export const TransmuterStudio: React.FC<TransmuterStudioProps> = ({
  onAffirmationGenerated,
  onSaveToLibrary,
  onPlayAffirmation,
  currentResult,
  savedIds,
  binauralBand = 'theta',
  onSelectBinauralBand,
  isRainEnabled = false,
  onToggleRain,
  rainVolume = 0.25,
  onChangeRainVolume,
}) => {
  const [inputText, setInputText] = useState(
    'I want to stop stressing about finances and attract huge abundance and financial freedom.'
  );
  const [selectedParadigm, setSelectedParadigm] = useState<QuantumParadigmId>('timeline-collapse');
  const [selectedFrequency, setSelectedFrequency] = useState<number>(888);
  const [selectedVoice, setSelectedVoice] = useState<string>('Fenrir');
  const [selectedIntensity, setSelectedIntensity] = useState<string>('moderate');
  const [selectedMood, setSelectedMood] = useState<string>('motivated');
  const [isAmplifiedAudio, setIsAmplifiedAudio] = useState<boolean>(false);
  const [emotionalMultiplier, setEmotionalMultiplier] = useState<string>('Sovereign Inevitability');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingWav, setIsGeneratingWav] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleTransmute = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/affirmation/transmute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: inputText.trim(),
          paradigm: selectedParadigm,
          frequencyHz: selectedFrequency,
          emotionalMultiplier,
          mood: selectedMood,
          intensity: selectedIntensity,
        }),
      });

      if (!res.ok) throw new Error('Failed to transmute affirmation');

      const data: QuantumAffirmationResult = await res.json();
      onAffirmationGenerated(data);
      onSaveToLibrary(data); // Auto-save to library

      // Automatically synthesize realistic Gemini 3.8 human voice immediately
      setIsGeneratingWav(true);
      try {
        const speechRes = await fetch('/api/affirmation/speech', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: data.quantumText,
            voiceName: selectedVoice,
            frequencyHz: data.frequencyHz,
            style: `Warm, deeply authentic human voice, realistic breathing cadence, calm soothing tone, and deep ${emotionalMultiplier.toLowerCase()}`,
          }),
        });
        if (speechRes.ok) {
          const speechData = await speechRes.json();
          if (speechData.audioBase64) {
            const withAudio = {
              ...data,
              audioBase64: speechData.audioBase64,
              voiceName: speechData.voice || selectedVoice,
            };
            onAffirmationGenerated(withAudio);
            onPlayAffirmation(withAudio); // Automatically play after generation
          }
        }
      } catch (speechErr) {
        console.warn('Auto Gemini 3.8 voice generation:', speechErr);
      } finally {
        setIsGeneratingWav(false);
      }
    } catch (err) {
      console.error('Error generating affirmation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceTranscribeComplete = async (
    text: string,
    recommendedParadigm?: QuantumParadigmId,
    autoTransmute: boolean = false
  ) => {
    if (!text.trim()) return;
    setInputText(text);

    const paradigmToUse = recommendedParadigm || selectedParadigm;
    if (recommendedParadigm) {
      setSelectedParadigm(recommendedParadigm);
    }

    if (autoTransmute) {
      setIsLoading(true);
      try {
        const res = await fetch('/api/affirmation/transmute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originalText: text.trim(),
            paradigm: paradigmToUse,
            frequencyHz: selectedFrequency,
            emotionalMultiplier,
            mood: selectedMood,
            intensity: selectedIntensity,
          }),
        });

        if (res.ok) {
          const transmutedData: QuantumAffirmationResult = await res.json();
          onAffirmationGenerated(transmutedData);
          onSaveToLibrary(transmutedData); // Auto-save

          // Now synthesize spoken TTS immediately
          setIsGeneratingWav(true);
          try {
            const speechRes = await fetch('/api/affirmation/speech', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: transmutedData.quantumText,
                voiceName: selectedVoice,
                frequencyHz: transmutedData.frequencyHz,
                style: `Rhythmic, steady, high-frequency quantum incantation with deliberate breath cadence and deep ${emotionalMultiplier.toLowerCase()}`,
                amplified: isAmplifiedAudio,
              }),
            });

            if (speechRes.ok) {
              const speechData = await speechRes.json();
              if (speechData.audioBase64) {
                const withAudio = {
                  ...transmutedData,
                  audioBase64: speechData.audioBase64,
                  voiceName: speechData.voice || selectedVoice,
                };
                onAffirmationGenerated(withAudio);
                onPlayAffirmation(withAudio);
                return;
              }
            }
          } catch (speechErr) {
            console.warn('Auto TTS error:', speechErr);
          } finally {
            setIsGeneratingWav(false);
          }

          onPlayAffirmation(transmutedData);
        }
      } catch (err) {
        console.error('Error auto transmuting voice:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenerateVoiceWav = async () => {
    if (!currentResult) return;
    setIsGeneratingWav(true);

    try {
      const res = await fetch('/api/affirmation/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentResult.quantumText,
          voiceName: selectedVoice,
          frequencyHz: currentResult.frequencyHz,
          style: `Rhythmic, steady, high-frequency quantum incantation with deliberate breath cadence and deep ${emotionalMultiplier.toLowerCase()}`,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const updated = {
          ...currentResult,
          audioBase64: data.audioBase64,
          voiceName: data.voice || selectedVoice,
        };
        onAffirmationGenerated(updated);
        onPlayAffirmation(updated);
      } else {
        // Fallback: play immediately using Web Audio + Speech
        onPlayAffirmation(currentResult);
      }
    } catch (e) {
      console.warn('Voice WAV generation:', e);
      onPlayAffirmation(currentResult);
    } finally {
      setIsGeneratingWav(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentResult) return;
    navigator.clipboard.writeText(currentResult.quantumText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activeFreqObj =
    SOLFEGGIO_FREQUENCIES.find((f) => f.hz === selectedFrequency) || SOLFEGGIO_FREQUENCIES[1];

  const isSaved = currentResult ? savedIds.includes(currentResult.id) : false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAFBF5] border border-[#2DD4BF]/40 text-[#009B87] text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Subconscious Quantum Collapse Engine</span>
        </div>
        <h1 className="text-[30px] font-bold text-[#171D27] tracking-tight leading-tight">
          Transmute Affirmations into Quantum Leap Language
        </h1>
        <p className="text-[14px] text-[#626B78] mt-2 max-w-3xl leading-relaxed">
          Traditional affirmations create subconscious resistance (&ldquo;No you&apos;re not&rdquo;). Quantum Leap language
          collapses the wave function into instant cellular coordinate reality, paired with rhythmic high-frequency
          spoken audio and Solfeggio carrier frequencies.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Input & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Personal Voice Audio Ingestion & Transcription */}
          <VoiceAffirmationUploader onTranscribeComplete={handleVoiceTranscribeComplete} />

          {/* Affirmation Input Card */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <label htmlFor="raw-affirmation-input" className="text-[14px] font-semibold text-[#171D27]">
                Paste Your Raw Affirmation or Desire
              </label>
              <span className="text-[12px] text-[#89919B]">
                {inputText.length} characters
              </span>
            </div>

            <textarea
              id="raw-affirmation-input"
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. I want to be wealthy and free, or I hope to heal my chronic fatigue..."
              className="w-full p-4 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[#171D27] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#009B87]/30 focus:border-[#009B87] transition-all resize-none"
            />

            {/* Presets */}
            <div className="mt-4">
              <div className="text-[12px] font-medium text-[#626B78] mb-2 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-[#009B87]" />
                <span>Or load an exemplar high-frequency vector:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_AFFIRMATIONS.map((preset) => (
                  <button
                    key={preset.category}
                    onClick={() => {
                      setInputText(preset.raw);
                      setSelectedFrequency(preset.targetFrequency);
                      setSelectedParadigm(preset.targetParadigm);
                    }}
                    className="px-2.5 py-1 rounded-lg text-[12px] bg-[#FAF9F6] hover:bg-[#EAFBF5] text-[#626B78] hover:text-[#009B87] border border-[#EEF1EF] transition-all"
                  >
                    {preset.category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quantum Paradigm Selector */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-[16px] font-semibold text-[#171D27]">
                  Select Quantum Leap Paradigm
                </h3>
                <p className="text-[12px] text-[#626B78]">
                  How the linguistic structure bypasses the subconscious barrier
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EAFBF5] text-[#009B87]">
                4 Modalities
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(Object.keys(QUANTUM_PARADIGMS) as QuantumParadigmId[]).map((key) => {
                const paradigm = QUANTUM_PARADIGMS[key];
                const isSelected = selectedParadigm === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedParadigm(key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#009B87] bg-[#EAFBF5]/60 ring-2 ring-[#009B87]/20 shadow-xs'
                        : 'border-[#EEF1EF] bg-[#FFFFFF] hover:bg-[#F7FAF8]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-[#171D27]">
                        {paradigm.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#009B87]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#626B78] line-clamp-2 leading-relaxed">
                      {paradigm.tagline}
                    </p>
                    <div className="mt-2 text-[10px] font-semibold text-[#009B87] bg-white/70 px-1.5 py-0.5 rounded border border-[#2DD4BF]/20 inline-block">
                      {paradigm.powerMultiplier}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tuning & Audio Modality Grid */}
          <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
            <h3 className="text-[16px] font-semibold text-[#171D27] mb-4">
              Harmonic Frequency & Spoken Audio Engine
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Solfeggio Frequency */}
              <div>
                <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5 flex items-center justify-between">
                  <span>Solfeggio Carrier Tone</span>
                  <span className="text-[#009B87] font-mono">{selectedFrequency} Hz</span>
                </label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[13px] text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
                >
                  {SOLFEGGIO_FREQUENCIES.map((freq) => (
                    <option key={freq.hz} value={freq.hz}>
                      {freq.hz} Hz • {freq.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#626B78] mt-1">
                  {activeFreqObj.harmonicPurpose}
                </p>
              </div>

              {/* Spoken Voice Persona */}
              <div>
                <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5 flex items-center justify-between">
                  <span>Gemini 3.8 Realistic Human Voice</span>
                  <span className="text-[10px] font-bold text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.5 rounded">
                    Flagship 3.8 TTS
                  </span>
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[13px] text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
                >
                  <option value="Kore">Kore • Warm, Soothing Natural Female</option>
                  <option value="Zephyr">Zephyr • Grounded, Conversational Male</option>
                  <option value="Fenrir">Fenrir • Deep Resonant Baritone</option>
                  <option value="Puck">Puck • Dynamic, Expressive & Inspiring</option>
                  <option value="Charon">Charon • Meditative Ancient Gravitas</option>
                </select>
                <p className="text-[11px] text-[#626B78] mt-1">
                  Realistic human prosody with natural diaphragmatic breathing and warm acoustic presence
                </p>
              </div>

              {/* Intensity & Mood Selection */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5">
                    Quantum Language Intensity
                  </label>
                  <select
                    value={selectedIntensity}
                    onChange={(e) => setSelectedIntensity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[13px] text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
                  >
                    <option value="subtle">Subtle</option>
                    <option value="moderate">Moderate</option>
                    <option value="intense">Intense</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5">
                    Current Mood / Desired State
                  </label>
                  <select
                    value={selectedMood}
                    onChange={(e) => setSelectedMood(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[13px] text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
                  >
                    <option value="happy">Happy / Uplifted</option>
                    <option value="stressed">Stressed / Needing Calm</option>
                    <option value="motivated">Motivated / Focused</option>
                    <option value="peaceful">Peaceful / Grounded</option>
                  </select>
                </div>
              </div>

              {/* Audio Amplification Toggle */}
              <div className="sm:col-span-2 pt-2 border-t border-[#EEF1EF]">
                <label className="flex items-center space-x-2 text-[12px] font-semibold text-[#171D27]">
                  <input
                    type="checkbox"
                    checked={isAmplifiedAudio}
                    onChange={(e) => setIsAmplifiedAudio(e.target.checked)}
                    className="w-4 h-4 accent-[#009B87]"
                  />
                  <span>Amplify High-Frequency Audio (Higher Impact)</span>
                </label>
              </div>

              {/* Emotional Multiplier */}
              <div className="sm:col-span-2">
                <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5">
                  Emotional Intensity Multiplier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    'Sovereign Inevitability',
                    'High-Intensity Transcendence',
                    'Calm Absolute Certainty',
                  ].map((intensity) => (
                    <button
                      key={intensity}
                      type="button"
                      onClick={() => setEmotionalMultiplier(intensity)}
                      className={`p-2 rounded-xl text-[12px] font-medium border text-center transition-all ${
                        emotionalMultiplier === intensity
                          ? 'bg-[#EAFBF5] border-[#009B87] text-[#009B87] font-semibold'
                          : 'bg-[#FAF9F6] border-[#EEF1EF] text-[#626B78] hover:bg-[#FFFFFF]'
                      }`}
                    >
                      {intensity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Binaural Beat Modulation Preset Selector */}
              <div className="sm:col-span-2 pt-2 border-t border-[#EEF1EF]">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-semibold text-[#171D27] flex items-center space-x-1.5">
                    <Headphones className="w-3.5 h-3.5 text-[#009B87]" />
                    <span>Binaural Beat Entrainment Mode</span>
                  </label>
                  <span className="text-[10px] font-mono font-bold text-[#009B87] bg-[#EAFBF5] px-2 py-0.5 rounded">
                    +{getBrainwavePreset(binauralBand).hz} Hz Detune
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BINAURAL_BEAT_PRESETS.map((preset) => {
                    const isSelected = binauralBand === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelectBinauralBand?.(preset.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#EAFBF5] border-[#009B87] text-[#009B87] shadow-2xs font-bold'
                            : 'bg-[#FAF9F6] border-[#EEF1EF] text-[#626B78] hover:bg-[#FFFFFF]'
                        }`}
                      >
                        <div className="text-[11px] font-bold text-[#171D27] flex items-center justify-between">
                          <span>{preset.name}</span>
                          <span className="text-[10px] text-[#009B87] font-mono">{preset.hz}Hz</span>
                        </div>
                        <div className="text-[10px] text-[#89919B] mt-0.5">{preset.state.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Crisp Rainfall Sound Bed Option */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isRainEnabled ? 'bg-[#EAFBF5] text-[#009B87]' : 'bg-white text-[#89919B] border border-[#EEF1EF]'
                  }`}>
                    <CloudRain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[12px] font-semibold text-[#171D27]">
                      Crisp Rainfall Sound Bed
                    </div>
                    <div className="text-[10px] text-[#626B78]">
                      Algorithmic high-frequency rain texture for subconscious focus
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleRain?.(!isRainEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    isRainEnabled
                      ? 'bg-[#009B87] text-white shadow-xs'
                      : 'bg-white text-[#626B78] border border-[#E5E9E7] hover:bg-[#FAF9F6]'
                  }`}
                >
                  {isRainEnabled ? 'Active' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="mt-6 pt-4 border-t border-[#EEF1EF]">
              <button
                onClick={handleTransmute}
                disabled={isLoading || !inputText.trim()}
                className="w-full py-3.5 px-6 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[14px] font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Collapsing Wave Function...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current text-[#2DD4BF]" />
                    <span>Transmute into Quantum Affirmation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Output: Transmuted Quantum Result (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {currentResult ? (
            <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#009B87]/40 shadow-[0_4px_16px_rgba(0,155,135,0.08)] ring-1 ring-[#2DD4BF]/20 relative overflow-hidden transition-all">
              {/* Top Meta Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EEF1EF] mb-4">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#009B87] animate-pulse" />
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#009B87]">
                    Quantum Leap Crystallized
                  </span>
                </div>
                <div className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FAF9F6] text-[#626B78] border border-[#E5E9E7]">
                  {currentResult.frequencyHz} Hz • {currentResult.paradigm}
                </div>
              </div>

              {/* Main Transmuted Quote */}
              <div className="bg-[#F3FCF8] p-5 rounded-xl border border-[#2DD4BF]/30 mb-5 relative">
                <span className="text-3xl text-[#009B87]/40 font-serif absolute top-1 left-2">“</span>
                <p className="text-[16px] font-semibold text-[#171D27] leading-relaxed relative z-10 pl-3">
                  {currentResult.quantumText}
                </p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#626B78] pt-2 border-t border-[#2DD4BF]/20">
                  <span className="font-mono text-[#005F58] font-medium">
                    {currentResult.cadenceNotation}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 text-[#009B87] hover:underline"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Somatic Anchor Card */}
              <div className="mb-4 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E9E7]">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-[#009B87]" />
                  <h4 className="text-[13px] font-bold text-[#171D27]">
                    Somatic Resonance & Breath Anchor
                  </h4>
                </div>
                <p className="text-[13px] text-[#626B78] leading-relaxed">
                  {currentResult.somaticAnchor}
                </p>
              </div>

              {/* Linguistic Shift Analysis */}
              <div className="mb-6 bg-[#FAF9F6] p-4 rounded-xl border border-[#E5E9E7]">
                <div className="flex items-center space-x-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#005F58]" />
                  <h4 className="text-[13px] font-bold text-[#171D27]">
                    Subconscious Resistance Neutralized
                  </h4>
                </div>
                <p className="text-[12px] text-[#626B78] leading-relaxed">
                  {currentResult.linguisticShiftAnalysis}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={async () => {
                    if (!currentResult.audioBase64) {
                      await handleGenerateVoiceWav();
                    } else {
                      onPlayAffirmation(currentResult);
                    }
                  }}
                  disabled={isGeneratingWav}
                  className="w-full py-3 px-4 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[13px] font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all disabled:opacity-75"
                >
                  {isGeneratingWav ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing Gemini 3.8 Human Voice...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Realistic Spoken Audio ({currentResult.frequencyHz}Hz Bed)</span>
                    </>
                  )}
                </button>

                {!currentResult.audioBase64 && (
                  <button
                    onClick={handleGenerateVoiceWav}
                    disabled={isGeneratingWav}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#EAFBF5] hover:bg-[#def7ee] text-[#009B87] border border-[#2DD4BF]/50 text-[13px] font-semibold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
                  >
                    {isGeneratingWav ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#009B87] border-t-transparent rounded-full animate-spin" />
                        <span>Synthesizing Realistic Gemini 3.8 Voice...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Generate Gemini 3.8 Realistic Human Voice WAV</span>
                      </>
                    )}
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => onSaveToLibrary(currentResult)}
                    className={`py-2 px-3 rounded-xl border text-[12px] font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      isSaved
                        ? 'bg-[#EAFBF5] text-[#009B87] border-[#009B87]'
                        : 'bg-[#FAF9F6] text-[#626B78] hover:text-[#171D27] border-[#E5E9E7]'
                    }`}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                    <span>{isSaved ? 'Saved in Library' : 'Save to Library'}</span>
                  </button>

                  <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="py-2 px-3 rounded-xl bg-[#FAF9F6] hover:bg-[#EAFBF5] text-[#626B78] hover:text-[#009B87] border border-[#E5E9E7] text-[12px] font-semibold flex items-center justify-center space-x-1.5 transition-all"
                    title="Export Master WAV (Voice + Carrier Bed)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Master WAV</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-dashed border-[#E5E9E7] text-center flex flex-col items-center justify-center min-h-[460px]">
              <div className="w-16 h-16 rounded-2xl bg-[#F3FCF8] border border-[#2DD4BF]/30 flex items-center justify-center text-[#009B87] mb-4">
                <Sparkles className="w-8 h-8 text-[#009B87]" />
              </div>
              <h3 className="text-[18px] font-bold text-[#171D27]">
                Awaiting Quantum Transmutation
              </h3>
              <p className="text-[13px] text-[#626B78] max-w-sm mt-2 leading-relaxed">
                Paste any standard affirmation or personal manifestation goal on the left, then click
                &ldquo;Transmute&rdquo; to collapse the wave function into rhythmic high-frequency audio.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#EEF1EF] text-[#626B78]">
                  528Hz DNA Repair
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#EEF1EF] text-[#626B78]">
                  888Hz Wealth Vortex
                </span>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[#EEF1EF] text-[#626B78]">
                  Somatic Anchoring
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Master WAV Export Modal */}
      <ExportWavModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        affirmation={currentResult}
        defaultCarrierEnabled={true}
        defaultBinauralBand={binauralBand}
        defaultIncludeRain={isRainEnabled}
        defaultRainVolume={rainVolume}
      />
    </div>
  );
};
