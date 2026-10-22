'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Repeat,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { QuantumAffirmationResult } from '@/lib/quantum-engine';
import { globalSolfeggioSynth } from '@/lib/audio-player';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { ExportWavModal } from './ExportWavModal';
import { ReactiveAmplitudeVisualizer } from './ReactiveAmplitudeVisualizer';

interface AudioPlayerBarProps {
  currentAffirmation: QuantumAffirmationResult | null;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  voiceVolume: number;
  setVoiceVolume: (v: number) => void;
  carrierVolume: number;
  setCarrierVolume: (v: number) => void;
  carrierEnabled: boolean;
  setCarrierEnabled: (enabled: boolean) => void;
  loopMode: boolean;
  setLoopMode: (loop: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  onRequestSpeechGen?: () => Promise<void>;
  isGeneratingAudio?: boolean;
}

const formatTime = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${mins}:${s < 10 ? '0' : ''}${s}`;
};

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentAffirmation,
  isPlaying,
  setIsPlaying,
  voiceVolume,
  setVoiceVolume,
  carrierVolume,
  setCarrierVolume,
  carrierEnabled,
  setCarrierEnabled,
  loopMode,
  setLoopMode,
  playbackSpeed,
  setPlaybackSpeed,
  onRequestSpeechGen,
  isGeneratingAudio = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('0:00');
  const [durationFormatted, setDurationFormatted] = useState('0:00');
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize or update HTML audio element if audioBase64 exists
  useEffect(() => {
    if (!currentAffirmation) return;

    if (currentAffirmation.audioBase64) {
      if (speechUtteranceRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      const audioUrl = `data:audio/wav;base64,${currentAffirmation.audioBase64}`;
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
      } else {
        audioRef.current.src = audioUrl;
      }
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = voiceVolume;
      audioRef.current.loop = loopMode;

      audioRef.current.ontimeupdate = () => {
        if (!audioRef.current) return;
        const cur = audioRef.current.currentTime;
        const dur = audioRef.current.duration || 1;
        setProgress((cur / dur) * 100);
        setCurrentTimeFormatted(formatTime(cur));
        setDurationFormatted(formatTime(dur));
      };

      audioRef.current.onended = () => {
        if (!loopMode) {
          setIsPlaying(false);
          setProgress(0);
        }
      };
    }
  }, [currentAffirmation, loopMode, playbackSpeed, setIsPlaying, voiceVolume]);

  // Sync volume, speed, and loop mode to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = voiceVolume;
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.loop = loopMode;
    }
  }, [voiceVolume, playbackSpeed, loopMode]);

  // Handle play / pause logic
  const togglePlay = async () => {
    if (!currentAffirmation) return;

    if (isPlaying) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      globalSolfeggioSynth.stopTone();
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);

      // Start Solfeggio carrier tone if enabled
      if (carrierEnabled) {
        globalSolfeggioSynth.startTone(currentAffirmation.frequencyHz, 7.83, carrierVolume);
      } else {
        globalSolfeggioSynth.resumeContext();
      }

      // If we have Gemini WAV audio, play it
      if (currentAffirmation.audioBase64 && audioRef.current) {
        try {
          globalSolfeggioSynth.attachAudioElement(audioRef.current);
          await audioRef.current.play();
        } catch (e) {
          console.warn('Audio play interrupted:', e);
        }
      } else if (onRequestSpeechGen && !currentAffirmation.audioBase64) {
        // Fallback: use Web Speech API immediately so there is zero delay, while optionally requesting Gemini TTS
        playWithWebSpeech(currentAffirmation.quantumText);
      } else {
        playWithWebSpeech(currentAffirmation.quantumText);
      }
    }
  };

  const playWithWebSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    speechUtteranceRef.current = utterance;
    utterance.rate = playbackSpeed * 0.92; // deliberate, rhythmic pace
    utterance.pitch = 0.95; // warm, grounded tone
    utterance.volume = voiceVolume;

    // Pick best available natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) ||
      voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      if (loopMode) {
        setTimeout(() => playWithWebSpeech(text), 1500);
      } else {
        setIsPlaying(false);
        if (!carrierEnabled) globalSolfeggioSynth.stopTone();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleDownloadWav = () => {
    if (!currentAffirmation) return;
    setIsExportModalOpen(true);
  };

  if (!currentAffirmation) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#FFFFFF] border-t border-[#E5E9E7] shadow-[0_-4px_24px_rgba(16,24,40,0.08)] transition-all">
      {/* Visualizer & Accordion Area */}
      {expanded && (
        <div className="max-w-7xl mx-auto px-4 pt-3 pb-1 border-b border-[#EEF1EF] bg-[#F7FAF8]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#171D27] uppercase tracking-wider">
                Quantum Harmonic Oscilloscope
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#EAFBF5] text-[#009B87] font-mono">
                {currentAffirmation.frequencyHz} Hz • {currentAffirmation.paradigm}
              </span>
            </div>
            <div className="text-xs text-[#626B78] font-mono">
              Binaural Beat: 7.83Hz Schumann Alpha
            </div>
          </div>
          <AudioVisualizerCanvas
            isPlaying={isPlaying}
            frequencyHz={currentAffirmation.frequencyHz}
            height={68}
          />
        </div>
      )}

      {/* Real-time audio playback progress bar */}
      <div className="w-full bg-[#EEF1EF] h-1 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#009B87] via-[#2DD4BF] to-[#009B87] h-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Control Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Current Affirmation Info */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-[#EAFBF5] border border-[#2DD4BF]/40 flex items-center justify-center text-[#009B87] shrink-0">
              <Sparkles className="w-5 h-5 text-[#009B87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.5 rounded">
                  {currentAffirmation.frequencyHz}Hz High-Frequency Spoken Audio
                </span>
                {currentAffirmation.audioBase64 ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                    Gemini 24kHz Spoken WAV
                  </span>
                ) : (
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded font-medium">
                    Dynamic Spoken Audio
                  </span>
                )}
              </div>
              <p className="text-[13px] font-medium text-[#171D27] truncate mt-0.5">
                &ldquo;{currentAffirmation.quantumText}&rdquo;
              </p>
              {/* Mobile reactive amplitude visualizer */}
              <ReactiveAmplitudeVisualizer
                isPlaying={isPlaying}
                barCount={10}
                height={16}
                showDecibels={false}
                className="flex md:hidden mt-1.5 py-0.5 w-fit"
              />
            </div>
          </div>

          {/* Desktop Reactive Audio Amplitude Visualizer */}
          <div className="hidden md:flex items-center shrink-0">
            <ReactiveAmplitudeVisualizer
              isPlaying={isPlaying}
              barCount={16}
              height={26}
              showDecibels={true}
            />
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center justify-center space-x-3 shrink-0">
            {/* Loop Toggle */}
            <button
              onClick={() => setLoopMode(!loopMode)}
              aria-label="Toggle Loop Mode"
              className={`p-2 rounded-lg text-xs font-semibold transition-colors ${
                loopMode
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/50'
                  : 'text-[#626B78] hover:bg-[#F7FAF8]'
              }`}
              title={loopMode ? 'Loop active (continuous subconscious entrainment)' : 'Loop off'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isGeneratingAudio}
              aria-label={isPlaying ? 'Pause affirmation audio' : 'Play affirmation audio'}
              className="w-12 h-12 rounded-full bg-[#009B87] hover:bg-[#007F73] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAudio ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Replay */}
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play();
                  setIsPlaying(true);
                } else {
                  playWithWebSpeech(currentAffirmation.quantumText);
                }
              }}
              aria-label="Replay affirmation"
              className="p-2 rounded-lg text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8] transition-colors"
              title="Replay from beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center space-x-1 bg-[#FAF9F6] border border-[#E5E9E7] p-0.5 rounded-lg text-[11px] font-semibold text-[#626B78]">
              {[0.8, 1.0, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1.5 py-0.5 rounded ${
                    playbackSpeed === s
                      ? 'bg-white text-[#009B87] shadow-2xs font-bold'
                      : 'hover:text-[#171D27]'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Right Volume & Frequency Mixer */}
          <div className="flex items-center justify-end space-x-3 shrink-0">
            {/* Voice Volume */}
            <div className="hidden sm:flex items-center space-x-1.5">
              <span className="text-[11px] font-semibold text-[#626B78]">Voice:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 accent-[#009B87] cursor-pointer"
                title={`Spoken Voice Volume: ${Math.round(voiceVolume * 100)}%`}
              />
            </div>

            {/* Carrier Bed Volume & Switch */}
            <div className="flex items-center space-x-1.5 bg-[#FAF9F6] px-2 py-1 rounded-lg border border-[#E5E9E7]">
              <button
                onClick={() => {
                  const next = !carrierEnabled;
                  setCarrierEnabled(next);
                  if (next && isPlaying) {
                    globalSolfeggioSynth.startTone(currentAffirmation.frequencyHz, 7.83, carrierVolume);
                  } else {
                    globalSolfeggioSynth.stopTone();
                  }
                }}
                className={`p-1 rounded ${
                  carrierEnabled ? 'text-[#009B87]' : 'text-[#89919B]'
                }`}
                title={carrierEnabled ? 'Carrier Frequency Bed Active' : 'Carrier Frequency Bed Muted'}
              >
                {carrierEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[11px] font-medium text-[#171D27]">{currentAffirmation.frequencyHz}Hz</span>
              <input
                type="range"
                min="0"
                max="0.6"
                step="0.02"
                value={carrierVolume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setCarrierVolume(v);
                  globalSolfeggioSynth.setVolume(v);
                }}
                className="w-14 h-1.5 accent-[#2DD4BF] cursor-pointer"
                title={`Carrier Bed: ${Math.round((carrierVolume / 0.6) * 100)}%`}
              />
            </div>

            {/* Download WAV button */}
            <button
              onClick={handleDownloadWav}
              aria-label="Export Master WAV audio file"
              className="p-2 rounded-lg text-[#626B78] hover:text-[#009B87] hover:bg-[#EAFBF5] transition-colors border border-transparent hover:border-[#2DD4BF]/40"
              title="Export Master WAV (Voice + Carrier Bed)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Expand / Visualizer Accordion */}
            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Hide visualizer' : 'Show visualizer'}
              className="p-2 rounded-lg text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8] transition-colors flex items-center space-x-1"
              title="Toggle Oscilloscope & Audio Frequency Visualizer"
            >
              <Sliders className="w-4 h-4" />
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Master WAV Export Modal */}
      <ExportWavModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        affirmation={currentAffirmation}
        defaultVoiceVolume={voiceVolume}
        defaultCarrierVolume={carrierVolume}
        defaultCarrierEnabled={carrierEnabled}
      />
    </div>
  );
};
