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
} from 'lucide-react';
import {
  QuantumAffirmationResult,
  SOLFEGGIO_FREQUENCIES,
  QUANTUM_PARADIGMS,
  PRESET_AFFIRMATIONS,
  QuantumParadigmId,
} from '@/lib/quantum-engine';
import { ExportWavModal } from './ExportWavModal';

interface TransmuterStudioProps {
  onAffirmationGenerated: (affirmation: QuantumAffirmationResult) => void;
  onSaveToLibrary: (affirmation: QuantumAffirmationResult) => void;
  onPlayAffirmation: (affirmation: QuantumAffirmationResult) => void;
  currentResult: QuantumAffirmationResult | null;
  savedIds: string[];
}

export const TransmuterStudio: React.FC<TransmuterStudioProps> = ({
  onAffirmationGenerated,
  onSaveToLibrary,
  onPlayAffirmation,
  currentResult,
  savedIds,
}) => {
  const [inputText, setInputText] = useState(
    'I want to stop stressing about finances and attract huge abundance and financial freedom.'
  );
  const [selectedParadigm, setSelectedParadigm] = useState<QuantumParadigmId>('timeline-collapse');
  const [selectedFrequency, setSelectedFrequency] = useState<number>(888);
  const [selectedVoice, setSelectedVoice] = useState<string>('Kore');
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
        }),
      });

      if (!res.ok) throw new Error('Failed to transmute affirmation');

      const data = await res.json();
      onAffirmationGenerated(data);
    } catch (err) {
      console.error('Error generating affirmation:', err);
    } finally {
      setIsLoading(false);
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
                <label className="block text-[12px] font-semibold text-[#171D27] mb-1.5">
                  Spoken Incantation Voice
                </label>
                <select
                  value={selectedVoice}
                  onChange={(e) => setSelectedVoice(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E5E9E7] bg-[#FAF9F6] text-[13px] text-[#171D27] focus:outline-none focus:ring-2 focus:ring-[#009B87]/20"
                >
                  <option value="Kore">Kore • Harmonic & Serene</option>
                  <option value="Zephyr">Zephyr • Clear & Sovereign</option>
                  <option value="Fenrir">Fenrir • Deep Resonant Authority</option>
                  <option value="Puck">Puck • Inspiring & Dynamic</option>
                  <option value="Charon">Charon • Grounded Ancient Gravitas</option>
                </select>
                <p className="text-[11px] text-[#626B78] mt-1">
                  High-frequency rhythmic meter for sleep & morning priming
                </p>
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
                  onClick={() => onPlayAffirmation(currentResult)}
                  className="w-full py-3 px-4 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[13px] font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play Rhythmic Spoken Audio ({currentResult.frequencyHz}Hz Bed)</span>
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
                        <span>Synthesizing 24kHz Spoken WAV...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>Synthesize High-Res Gemini Voice WAV</span>
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
      />
    </div>
  );
};
