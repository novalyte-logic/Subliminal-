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
  Moon,
  Headphones,
  CloudRain,
} from 'lucide-react';
import { QuantumAffirmationResult } from '@/lib/quantum-engine';
import { globalSolfeggioSynth } from '@/lib/audio-player';
import { AudioVisualizerCanvas } from './AudioVisualizerCanvas';
import { ExportWavModal } from './ExportWavModal';
import { ReactiveAmplitudeVisualizer } from './ReactiveAmplitudeVisualizer';
import { QuantumBreathingOrb } from './QuantumBreathingOrb';
import { QuantumSleepTimerModal } from './QuantumSleepTimerModal';
import { AudioSettingsModal } from './AudioSettingsModal';
import { formatSleepCountdown, calculateFadeVolumeFactor } from '@/lib/sleep-timer';
import { BrainwaveBand, getBrainwavePreset } from '@/lib/binaural-beats';

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
  binauralBand?: BrainwaveBand;
  setBinauralBand?: (band: BrainwaveBand) => void;
  isRainEnabled?: boolean;
  setIsRainEnabled?: (enabled: boolean) => void;
  rainVolume?: number;
  setRainVolume?: (vol: number) => void;
  onRequestSpeechGen?: () => Promise<void>;
  isGeneratingAudio?: boolean;
  hrvBpm?: number;
  setHrvBpm?: (bpm: number) => void;
  hrvSyncEnabled?: boolean;
  setHrvSyncEnabled?: (enabled: boolean) => void;
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
  binauralBand = 'theta',
  setBinauralBand = () => {},
  isRainEnabled = false,
  setIsRainEnabled = () => {},
  rainVolume = 0.25,
  setRainVolume = () => {},
  onRequestSpeechGen,
  isGeneratingAudio = false,
  hrvBpm = 5.5,
  setHrvBpm,
  hrvSyncEnabled = true,
  setHrvSyncEnabled,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [sleepRemainingSeconds, setSleepRemainingSeconds] = useState<number | null>(null);
  const [sleepFadeEnabled, setSleepFadeEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('0:00');
  const [durationFormatted, setDurationFormatted] = useState('0:00');
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSleepActive = sleepRemainingSeconds !== null;

  // Handle Quantum Sleep Timer countdown & gentle fadeout
  useEffect(() => {
    if (!isSleepActive) return;

    const interval = setInterval(() => {
      setSleepRemainingSeconds((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          // Timer finished: stop audio & restore volumes
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = voiceVolume;
          }
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          globalSolfeggioSynth.stopTone();
          globalSolfeggioSynth.stopRain();
          globalSolfeggioSynth.setVolume(carrierVolume);
          globalSolfeggioSynth.setRainVolume(rainVolume);
          setIsPlaying(false);
          return null;
        }

        const next = prev - 1;
        // Apply gentle S-curve cosine fadeout during last 60 seconds
        if (sleepFadeEnabled && next <= 60) {
          const factor = calculateFadeVolumeFactor(next, 60);
          if (audioRef.current) {
            audioRef.current.volume = voiceVolume * factor;
          }
          globalSolfeggioSynth.setVolume(carrierVolume * factor);
          if (isRainEnabled) {
            globalSolfeggioSynth.setRainVolume(rainVolume * factor);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSleepActive, sleepFadeEnabled, voiceVolume, carrierVolume, rainVolume, isRainEnabled, setIsPlaying]);

  const handleStartSleepTimer = (minutes: number, enableFade: boolean) => {
    setSleepRemainingSeconds(minutes * 60);
    setSleepFadeEnabled(enableFade);
  };

  const handleCancelSleepTimer = () => {
    setSleepRemainingSeconds(null);
    if (audioRef.current) audioRef.current.volume = voiceVolume;
    globalSolfeggioSynth.setVolume(carrierVolume);
    globalSolfeggioSynth.setRainVolume(rainVolume);
  };

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
          globalSolfeggioSynth.stopRain();
        }
      };

      // If user had initiated playback, start real audio element immediately upon arrival
      if (isPlaying) {
        audioRef.current.play().then(() => {
          if (audioRef.current) {
            globalSolfeggioSynth.attachAudioElement(audioRef.current);
          }
        }).catch((err) => {
          console.warn('Play after Gemini 3.8 synthesis:', err);
        });
      }
    }
  }, [currentAffirmation, loopMode, playbackSpeed, isPlaying, setIsPlaying, voiceVolume]);

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
      globalSolfeggioSynth.stopRain();
      setIsPlaying(false);
    } else {
      // Play
      setIsPlaying(true);

      const bPreset = getBrainwavePreset(binauralBand);
      // Start Solfeggio carrier tone if enabled with selected binaural beat
      if (carrierEnabled) {
        globalSolfeggioSynth.startTone(currentAffirmation.frequencyHz, bPreset.hz, carrierVolume);
      } else {
        globalSolfeggioSynth.resumeContext();
      }

      // Start crisp rainfall sound bed if enabled
      if (isRainEnabled) {
        globalSolfeggioSynth.startRain(rainVolume);
      }

      // If we have Gemini 3.8 WAV audio, play it directly
      if (currentAffirmation.audioBase64 && audioRef.current) {
        try {
          globalSolfeggioSynth.attachAudioElement(audioRef.current);
          await audioRef.current.play();
        } catch (e) {
          console.warn('Audio play interrupted:', e);
        }
      } else if (!currentAffirmation.audioBase64 && onRequestSpeechGen) {
        // Synthesize Gemini 3.8 realistic human audio immediately
        try {
          await onRequestSpeechGen();
        } catch (err) {
          console.warn('Fallback to client voice if offline:', err);
          playWithWebSpeech(currentAffirmation.quantumText);
        }
      } else if (!currentAffirmation.audioBase64) {
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
        globalSolfeggioSynth.stopRain();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-5">
          {/* Current Affirmation Info */}
          <div className="flex items-center space-x-3 min-w-[240px] md:min-w-[300px] lg:min-w-[340px] flex-1">
            <div className="w-10 h-10 rounded-xl bg-[#EAFBF5] border border-[#2DD4BF]/40 flex items-center justify-center text-[#009B87] shrink-0">
              <Sparkles className="w-5 h-5 text-[#009B87]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 whitespace-nowrap overflow-hidden">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#009B87] bg-[#EAFBF5] px-2 py-0.5 rounded shrink-0">
                  {currentAffirmation.frequencyHz}Hz High-Frequency Spoken Audio
                </span>
                {currentAffirmation.audioBase64 ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold shrink-0 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Gemini 3.8 Realistic Human Voice (24kHz)</span>
                  </span>
                ) : isGeneratingAudio ? (
                  <span className="text-[10px] bg-[#EAFBF5] text-[#009B87] px-2 py-0.5 rounded font-bold shrink-0 flex items-center space-x-1 animate-pulse border border-[#2DD4BF]/50">
                    <div className="w-2.5 h-2.5 border-2 border-[#009B87] border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing Gemini 3.8 Human Voice...</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#FAF9F6] border border-[#E5E9E7] text-[#626B78] px-2 py-0.5 rounded font-medium shrink-0">
                    Gemini 3.8 Voice Ready
                  </span>
                )}
              </div>
              <p
                className="text-[13px] font-medium text-[#171D27] truncate mt-1"
                title={currentAffirmation.quantumText}
              >
                &ldquo;{currentAffirmation.quantumText}&rdquo;
              </p>
            </div>

            {/* Mobile Breathing Orb right in header */}
            <div className="flex md:hidden shrink-0">
              <QuantumBreathingOrb
                isPlaying={isPlaying}
                frequencyHz={currentAffirmation.frequencyHz}
                compact={true}
                showLabel={false}
                hrvBpm={hrvBpm}
                setHrvBpm={setHrvBpm}
                hrvSyncEnabled={hrvSyncEnabled}
                setHrvSyncEnabled={setHrvSyncEnabled}
              />
            </div>
          </div>

        {/* Desktop Middle Visualizer & Breathing Orb */}
        <div className="hidden xl:flex items-center space-x-2.5 shrink-0">
          <ReactiveAmplitudeVisualizer
            isPlaying={isPlaying}
            barCount={10}
            height={22}
            showDecibels={false}
            className="py-1 px-2.5"
          />
          <div className="h-5 w-px bg-[#EEF1EF]" />
          <QuantumBreathingOrb
            isPlaying={isPlaying}
            frequencyHz={currentAffirmation.frequencyHz}
            compact={false}
            showLabel={true}
            hrvBpm={hrvBpm}
            setHrvBpm={setHrvBpm}
            hrvSyncEnabled={hrvSyncEnabled}
            setHrvSyncEnabled={setHrvSyncEnabled}
          />
        </div>

        {/* Controls & Mixer Group */}
        <div className="flex items-center justify-between lg:justify-end gap-2 sm:gap-3 shrink-0 pt-2 lg:pt-0 border-t border-[#EEF1EF] lg:border-t-0">
          {/* Center Playback Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Loop Toggle */}
            <button
              onClick={() => setLoopMode(!loopMode)}
              aria-label="Toggle Loop Mode"
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-colors ${
                loopMode
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/50'
                  : 'text-[#626B78] hover:bg-[#F7FAF8]'
              }`}
              title={loopMode ? 'Loop active (continuous subconscious entrainment)' : 'Loop off'}
            >
              <Repeat className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Quantum Sleep Timer button */}
            <button
              onClick={() => setIsSleepModalOpen(true)}
              aria-label="Quantum Sleep Timer"
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                sleepRemainingSeconds !== null
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/60 shadow-2xs font-bold'
                  : 'text-[#626B78] hover:bg-[#F7FAF8]'
              }`}
              title={
                sleepRemainingSeconds !== null
                  ? `Quantum Sleep Timer: ${formatSleepCountdown(sleepRemainingSeconds)} remaining (Click to adjust)`
                  : 'Quantum Sleep Timer (Schedule playback stop)'
              }
            >
              <Moon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${sleepRemainingSeconds !== null ? 'text-[#009B87] fill-[#009B87]/20 animate-pulse' : ''}`} />
              {sleepRemainingSeconds !== null && (
                <span className="font-mono text-[10px] sm:text-[11px] text-[#009B87]">
                  {formatSleepCountdown(sleepRemainingSeconds)}
                </span>
              )}
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              disabled={isGeneratingAudio}
              aria-label={isPlaying ? 'Pause affirmation audio' : 'Play affirmation audio'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#009B87] hover:bg-[#007F73] text-white flex items-center justify-center shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isGeneratingAudio ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              ) : (
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
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
              className="p-1.5 sm:p-2 rounded-lg text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8] transition-colors"
              title="Replay from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center space-x-0.5 sm:space-x-1 bg-[#FAF9F6] border border-[#E5E9E7] p-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-[#626B78]">
              {[0.8, 1.0, 1.2].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`px-1 sm:px-1.5 py-0.5 rounded ${
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
                    const preset = getBrainwavePreset(binauralBand);
                    globalSolfeggioSynth.startTone(currentAffirmation.frequencyHz, preset.hz, carrierVolume);
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

            {/* Quick Rain Toggle */}
            <button
              onClick={() => {
                const next = !isRainEnabled;
                setIsRainEnabled(next);
                if (next && isPlaying) {
                  globalSolfeggioSynth.startRain(rainVolume);
                } else if (!next) {
                  globalSolfeggioSynth.stopRain();
                }
              }}
              aria-label="Toggle crisp rainfall sound bed"
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                isRainEnabled
                  ? 'bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/60 shadow-2xs font-bold'
                  : 'text-[#626B78] hover:bg-[#F7FAF8] border border-transparent'
              }`}
              title={
                isRainEnabled
                  ? `Crisp Rainfall Active (${Math.round(rainVolume * 100)}%) - Click to mute`
                  : 'Crisp Rainfall Sound Bed (Click to enable)'
              }
            >
              <CloudRain className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRainEnabled ? 'text-[#009B87]' : ''}`} />
            </button>

            {/* Neuro-Acoustic Audio Settings (Binaural Beats & Rain) */}
            <button
              onClick={() => setIsAudioSettingsOpen(true)}
              aria-label="Open Neuro-Acoustic Audio Settings"
              className="p-1.5 sm:p-2 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 bg-[#FAF9F6] border border-[#E5E9E7] hover:border-[#2DD4BF]/60 text-[#171D27] hover:bg-[#FFFFFF]"
              title="Open Neuro-Acoustic Audio Settings: Binaural Beat & Rainfall Bed"
            >
              <Headphones className="w-3.5 h-3.5 text-[#009B87]" />
              <span className="hidden xl:inline text-[11px] font-semibold text-[#005F58]">
                {getBrainwavePreset(binauralBand).name} {getBrainwavePreset(binauralBand).hz}Hz
              </span>
            </button>

            {/* Download WAV button */}
            <button
              onClick={handleDownloadWav}
              aria-label="Export Master WAV audio file"
              className="p-2 rounded-lg text-[#626B78] hover:text-[#009B87] hover:bg-[#EAFBF5] transition-colors border border-transparent hover:border-[#2DD4BF]/40"
              title="Export Master WAV (Voice + Carrier Bed + Rain)"
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
    </div>

      {/* Neuro-Acoustic Audio Settings Modal */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
        activeCarrierHz={currentAffirmation?.frequencyHz || 888}
        currentBinauralBand={binauralBand}
        onSelectBinauralBand={(band) => {
          setBinauralBand(band);
          const p = getBrainwavePreset(band);
          globalSolfeggioSynth.setBinauralBeat(p.hz);
        }}
        isRainEnabled={isRainEnabled}
        onToggleRain={(enabled) => {
          setIsRainEnabled(enabled);
          if (enabled && isPlaying) {
            globalSolfeggioSynth.startRain(rainVolume);
          } else if (!enabled) {
            globalSolfeggioSynth.stopRain();
          }
        }}
        rainVolume={rainVolume}
        onChangeRainVolume={(vol) => {
          setRainVolume(vol);
          globalSolfeggioSynth.setRainVolume(vol);
        }}
        playbackSpeed={playbackSpeed}
        onChangeSpeed={setPlaybackSpeed}
      />

      {/* Master WAV Export Modal */}
      <ExportWavModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        affirmation={currentAffirmation}
        defaultVoiceVolume={voiceVolume}
        defaultCarrierVolume={carrierVolume}
        defaultCarrierEnabled={carrierEnabled}
        defaultBinauralBand={binauralBand}
        defaultIncludeRain={isRainEnabled}
        defaultRainVolume={rainVolume}
      />

      {/* Quantum Sleep Timer Modal */}
      <QuantumSleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        remainingSeconds={sleepRemainingSeconds}
        onStartTimer={handleStartSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
        initialFadeoutEnabled={sleepFadeEnabled}
      />
    </div>
  );
};
