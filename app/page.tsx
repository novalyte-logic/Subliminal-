'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { TransmuterStudio } from '@/components/TransmuterStudio';
import { ResonanceLibrary } from '@/components/ResonanceLibrary';
import { FrequencyMatrixView } from '@/components/FrequencyMatrixView';
import { LinguisticGuideView } from '@/components/LinguisticGuideView';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import {
  QuantumAffirmationResult,
  transmuteDeterministically,
  PRESET_AFFIRMATIONS,
} from '@/lib/quantum-engine';
import { globalSolfeggioSynth } from '@/lib/audio-player';

// Curated default library exemplars
const INITIAL_LIBRARY: QuantumAffirmationResult[] = [
  transmuteDeterministically(
    'I want to attract boundless financial prosperity and sovereign abundance',
    'timeline-collapse',
    888
  ),
  transmuteDeterministically(
    'I hope my body heals completely and my vitality radiates at maximum strength',
    'bio-electric-somatic',
    528
  ),
  transmuteDeterministically(
    'I wish to be an unshakeable visionary founder with absolute clarity of command',
    'observer-sovereignty',
    741
  ),
  transmuteDeterministically(
    'I want to connect deeply with my soulmate and experience magnetic unconditional love',
    'multiverse-convergence',
    639
  ),
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'studio' | 'library' | 'frequencies' | 'science'>('studio');
  const [library, setLibrary] = useState<QuantumAffirmationResult[]>(INITIAL_LIBRARY);
  const [currentAffirmation, setCurrentAffirmation] = useState<QuantumAffirmationResult | null>(INITIAL_LIBRARY[0]);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [carrierEnabled, setCarrierEnabled] = useState<boolean>(true);
  const [carrierVolume, setCarrierVolume] = useState<number>(0.22);
  const [voiceVolume, setVoiceVolume] = useState<number>(0.95);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [loopMode, setLoopMode] = useState<boolean>(true);
  const [activeHz, setActiveHz] = useState<number>(888);
  const [isPlayingContinuous, setIsPlayingContinuous] = useState<boolean>(false);
  const [continuousIndex, setContinuousIndex] = useState<number>(0);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);

  const handleAffirmationGenerated = (affirmation: QuantumAffirmationResult) => {
    setCurrentAffirmation(affirmation);
    setActiveHz(affirmation.frequencyHz);
  };

  const handleSaveToLibrary = (affirmation: QuantumAffirmationResult) => {
    if (!library.some((item) => item.id === affirmation.id)) {
      setLibrary((prev) => [affirmation, ...prev]);
    }
  };

  const handleDeleteAffirmation = (id: string) => {
    setLibrary((prev) => prev.filter((item) => item.id !== id));
    if (currentAffirmation?.id === id) {
      const remaining = library.filter((item) => item.id !== id);
      setCurrentAffirmation(remaining[0] || null);
    }
  };

  const handlePlayAffirmation = (affirmation: QuantumAffirmationResult) => {
    setCurrentAffirmation(affirmation);
    setActiveHz(affirmation.frequencyHz);
    setIsPlaying(true);
    setIsPlayingContinuous(false);

    if (carrierEnabled) {
      globalSolfeggioSynth.startTone(affirmation.frequencyHz, 7.83, carrierVolume);
    }
  };

  const toggleCarrier = () => {
    const next = !carrierEnabled;
    setCarrierEnabled(next);
    if (next && isPlaying && currentAffirmation) {
      globalSolfeggioSynth.startTone(currentAffirmation.frequencyHz, 7.83, carrierVolume);
    } else {
      globalSolfeggioSynth.stopTone();
    }
  };

  const handlePlayContinuous = () => {
    if (library.length === 0) return;
    setIsPlayingContinuous(true);
    setContinuousIndex(0);
    const first = library[0];
    handlePlayAffirmation(first);
  };

  const handleRequestSpeechGen = async () => {
    if (!currentAffirmation) return;
    setIsGeneratingAudio(true);
    try {
      const res = await fetch('/api/affirmation/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentAffirmation.quantumText,
          voiceName: currentAffirmation.voiceName || 'Kore',
          frequencyHz: currentAffirmation.frequencyHz,
        }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        const updated = {
          ...currentAffirmation,
          audioBase64: data.audioBase64,
        };
        setCurrentAffirmation(updated);
        setLibrary((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      }
    } catch (e) {
      console.warn('Speech request error:', e);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#171D27] flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        carrierActive={carrierEnabled && isPlaying}
        toggleCarrier={toggleCarrier}
        activeHz={activeHz}
        libraryCount={library.length}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-32 sm:pb-36">
        {activeTab === 'studio' && (
          <TransmuterStudio
            onAffirmationGenerated={handleAffirmationGenerated}
            onSaveToLibrary={handleSaveToLibrary}
            onPlayAffirmation={handlePlayAffirmation}
            currentResult={currentAffirmation}
            savedIds={library.map((l) => l.id)}
          />
        )}

        {activeTab === 'library' && (
          <ResonanceLibrary
            library={library}
            onPlayAffirmation={handlePlayAffirmation}
            onDeleteAffirmation={handleDeleteAffirmation}
            onPlayContinuous={handlePlayContinuous}
            isPlayingContinuous={isPlayingContinuous}
            activeId={currentAffirmation?.id}
          />
        )}

        {activeTab === 'frequencies' && (
          <FrequencyMatrixView
            activeHz={activeHz}
            setActiveHz={(hz) => {
              setActiveHz(hz);
              if (currentAffirmation) {
                setCurrentAffirmation({ ...currentAffirmation, frequencyHz: hz });
              }
            }}
            carrierActive={carrierEnabled && isPlaying}
            toggleCarrier={toggleCarrier}
          />
        )}

        {activeTab === 'science' && <LinguisticGuideView />}
      </main>

      {/* Persistent Audio Player Console at Bottom */}
      <AudioPlayerBar
        currentAffirmation={currentAffirmation}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        voiceVolume={voiceVolume}
        setVoiceVolume={setVoiceVolume}
        carrierVolume={carrierVolume}
        setCarrierVolume={setCarrierVolume}
        carrierEnabled={carrierEnabled}
        setCarrierEnabled={setCarrierEnabled}
        loopMode={loopMode}
        setLoopMode={setLoopMode}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
        onRequestSpeechGen={handleRequestSpeechGen}
        isGeneratingAudio={isGeneratingAudio}
      />
    </div>
  );
}
