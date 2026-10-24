'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Sparkles,
  Play,
  RotateCcw,
  BookmarkPlus,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Volume2,
  Calendar,
  Layers,
  Heart,
  Wind,
  Info,
  Radio,
  Eye,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import {
  QuantumDeckCard,
  MASTER_QUANTUM_DECK,
  getDailyDeck,
  getRandomDeck,
  deckCardToAffirmationResult,
} from '@/lib/quantum-deck';
import { QuantumAffirmationResult } from '@/lib/quantum-engine';
import { calculateHrvBreathTiming, calculateCoherenceScore } from '@/lib/hrv-resonance';

interface QuantumManifestationDeckProps {
  onPlayAffirmation: (affirmation: QuantumAffirmationResult) => void;
  onSaveToLibrary: (affirmation: QuantumAffirmationResult) => void;
  savedIds: string[];
  currentAffirmationId?: string;
  isPlaying?: boolean;
  onSetHrvBpm?: (bpm: number) => void;
  currentHrvBpm?: number;
}

export const QuantumManifestationDeck: React.FC<QuantumManifestationDeckProps> = ({
  onPlayAffirmation,
  onSaveToLibrary,
  savedIds,
  currentAffirmationId,
  isPlaying = false,
  onSetHrvBpm,
  currentHrvBpm = 5.5,
}) => {
  const [deckMode, setDeckMode] = useState<'daily' | 'spontaneous'>('daily');
  const [cards, setCards] = useState<QuantumDeckCard[]>(() => getDailyDeck(new Date(), 7));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  // Swipe gesture tracking
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  // Filtered cards based on focus area
  const filteredCards = activeFilter === 'All'
    ? cards
    : cards.filter((c) => c.focusArea === activeFilter);

  const safeIndex = Math.min(currentIndex, Math.max(0, filteredCards.length - 1));
  const currentCard: QuantumDeckCard | undefined = filteredCards[safeIndex] || filteredCards[0];

  const handleSelectFilter = (cat: string) => {
    setActiveFilter(cat);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length <= 1) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffleSpontaneous = () => {
    setIsFlipped(false);
    setDeckMode('spontaneous');
    setCards(getRandomDeck(7));
    setCurrentIndex(0);
  };

  const handleLoadDaily = () => {
    setIsFlipped(false);
    setDeckMode('daily');
    setCards(getDailyDeck(new Date(), 7));
    setCurrentIndex(0);
  };

  const handlePlayCard = (card: QuantumDeckCard) => {
    const affirmationResult = deckCardToAffirmationResult(card);
    if (onSetHrvBpm) {
      onSetHrvBpm(card.recommendedBpm);
    }
    onPlayAffirmation(affirmationResult);
  };

  const handleSaveCard = (card: QuantumDeckCard) => {
    const affirmationResult = deckCardToAffirmationResult(card);
    onSaveToLibrary(affirmationResult);
    setSavedNotification(card.id);
    setTimeout(() => {
      setSavedNotification(null);
    }, 2400);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIsFlipped(false);
        setCurrentIndex((prev) => (filteredCards.length > 1 ? (prev + 1) % filteredCards.length : prev));
      } else if (e.key === 'ArrowLeft') {
        setIsFlipped(false);
        setCurrentIndex((prev) => (filteredCards.length > 1 ? (prev - 1 + filteredCards.length) % filteredCards.length : prev));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCards.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchStartX(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!touchStartX || !isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - touchStartX;
    // Dampen drag
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (touchDeltaX > 50) {
      handlePrev();
    } else if (touchDeltaX < -50) {
      handleNext();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsDragging(false);
  };

  const categories = ['All', 'Abundance', 'Vitality', 'Sovereignty', 'Love', 'Intuition', 'Impact'];

  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-[#626B78]">No quantum manifestation cards found for this filter.</p>
        <button
          onClick={() => setActiveFilter('All')}
          className="mt-4 px-4 py-2 bg-[#009B87] text-white rounded-lg font-medium text-sm"
        >
          Reset Filter to All
        </button>
      </div>
    );
  }

  const hrvTiming = calculateHrvBreathTiming(currentCard.recommendedBpm);
  const coherenceScore = calculateCoherenceScore(currentCard.recommendedBpm);
  const isCurrentlyPlayingCard = isPlaying && currentAffirmationId?.includes(currentCard.id);
  const isSaved = savedNotification === currentCard.id || savedIds.some((id) => id.includes(currentCard.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAFBF5] text-[#009B87] border border-[#2DD4BF]/40 text-xs font-semibold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#009B87]" />
            <span>Quantum Manifestation Deck</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171D27] tracking-tight">
            Daily Oracle & Spontaneous Quantum Leaps
          </h1>
          <p className="text-sm text-[#626B78] mt-1 max-w-2xl">
            Swipe through curated quantum incantations tuned to your heart rate variability (HRV) resonance. Flip each card for somatic anchors and activate immediate human-voice entrainment.
          </p>
        </div>

        {/* Deck Mode Toggle & Shuffle */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="inline-flex p-1 bg-[#FFFFFF] rounded-xl border border-[#E5E9E7] shadow-xs">
            <button
              onClick={handleLoadDaily}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                deckMode === 'daily'
                  ? 'bg-[#009B87] text-white shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today&apos;s Deck (7)</span>
            </button>
            <button
              onClick={handleShuffleSpontaneous}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                deckMode === 'spontaneous'
                  ? 'bg-[#009B87] text-white shadow-xs'
                  : 'text-[#626B78] hover:text-[#171D27] hover:bg-[#F7FAF8]'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Spontaneous Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleSelectFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
              activeFilter === cat
                ? 'bg-[#009B87] text-white border-[#009B87] shadow-xs'
                : 'bg-[#FFFFFF] text-[#626B78] border-[#E5E9E7] hover:bg-[#F7FAF8] hover:text-[#171D27]'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="text-xs text-[#89919B] ml-auto shrink-0 pl-3 hidden sm:inline">
          {filteredCards.length} cards available
        </span>
      </div>

      {/* Main Interactive Card Stage */}
      <div className="relative flex flex-col items-center">
        {/* Card Counter & Dimension Badges */}
        <div className="w-full max-w-xl flex items-center justify-between text-xs font-medium text-[#626B78] mb-3 px-2">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-[#EAFBF5] text-[#009B87] font-semibold font-mono">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
            <span className="text-[#89919B]">•</span>
            <span className="text-[#171D27] font-medium">{currentCard.focusArea}</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-[#009B87] hover:text-[#007F73] font-semibold flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isFlipped ? 'View Incantation' : 'View Somatic Anchor'}</span>
            </button>
          </div>
        </div>

        {/* Swipeable 3D Card Container */}
        <div
          className="relative w-full max-w-xl min-h-[380px] sm:min-h-[420px] select-none cursor-grab active:cursor-grabbing transition-transform duration-200"
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            transform: isDragging ? `translateX(${touchDeltaX}px) rotate(${touchDeltaX * 0.04}deg)` : 'none',
          }}
        >
          {/* Card Back: Somatic Anchor & Visceral Biology Protocol */}
          {isFlipped ? (
            <div className="w-full min-h-[380px] sm:min-h-[420px] rounded-2xl bg-gradient-to-br from-[#005F58] via-[#007F73] to-[#009B87] text-white p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_32px_rgba(16,24,40,0.12)] border border-[#2DD4BF]/30 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4BF]/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-[#2DD4BF] border border-white/20">
                    <Heart className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>Somatic Resonance Anchor</span>
                  </div>
                  <span className="font-mono text-xs text-white/80">
                    {currentCard.frequencyHz}Hz Carrier Harmonic
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
                  Visceral Body Anchoring Protocol
                </h3>
                <p className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-4">
                  For: {currentCard.theme}
                </p>

                {/* Somatic instructions */}
                <div className="p-4 sm:p-5 rounded-xl bg-black/20 border border-white/15 backdrop-blur-sm mb-4">
                  <p className="text-sm sm:text-[15px] leading-relaxed text-white/95 font-medium">
                    &ldquo;{currentCard.somaticAnchor}&rdquo;
                  </p>
                </div>

                {/* Cadence & HRV Resonance Insight */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-white/10 border border-white/15">
                    <span className="text-white/70 block text-[11px]">Heart-Rate Coherence</span>
                    <span className="font-bold text-white text-sm">
                      {currentCard.recommendedBpm} BPM ({hrvTiming.totalCycleSeconds.toFixed(1)}s cycle)
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white/10 border border-white/15">
                    <span className="text-white/70 block text-[11px]">Vocal Influx Cadence</span>
                    <span className="font-bold text-white text-sm truncate" title={currentCard.cadenceNotation}>
                      {currentCard.cadenceNotation.split('•')[0] || 'Triadic Influx'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="flex items-center justify-between pt-6 border-t border-white/15 mt-4">
                <button
                  onClick={() => setIsFlipped(false)}
                  className="text-xs font-semibold text-white/80 hover:text-white flex items-center space-x-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Flip to Incantation</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePlayCard(currentCard)}
                    className="px-4 py-2 rounded-xl bg-white text-[#005F58] hover:bg-[#F3FCF8] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#005F58]" />
                    <span>Entrain Now</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Card Front: Quantum Incantation & Transmutation */
            <div className="w-full min-h-[380px] sm:min-h-[420px] rounded-2xl bg-[#FFFFFF] p-6 sm:p-8 flex flex-col justify-between shadow-[0_12px_32px_rgba(16,24,40,0.08)] border border-[#E5E9E7] relative overflow-hidden group">
              {/* Top Accent Gradient Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#009B87] via-[#2DD4BF] to-[#005F58]" />

              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#EAFBF5] text-[#009B87] text-xs font-bold font-mono border border-[#2DD4BF]/40">
                      {currentCard.frequencyHz} Hz
                    </span>
                    <span className="text-xs font-semibold text-[#626B78] uppercase tracking-wide">
                      {currentCard.archetype}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    {/* HRV sync indicator */}
                    <div
                      className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E5E9E7] text-[11px] font-medium text-[#626B78]"
                      title={`Target Breathing Rate: ${currentCard.recommendedBpm} BPM`}
                    >
                      <Wind className="w-3 h-3 text-[#009B87]" />
                      <span>{currentCard.recommendedBpm} BPM</span>
                    </div>
                  </div>
                </div>

                {/* Theme Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-[#171D27] tracking-tight mb-3">
                  {currentCard.theme}
                </h2>

                {/* The Incantation Spoken Text */}
                <div className="p-4 sm:p-5 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] my-2">
                  <p className="text-base sm:text-lg font-medium text-[#171D27] leading-relaxed italic">
                    &ldquo;{currentCard.quantumText}&rdquo;
                  </p>
                </div>

                {/* Cadence & Frequency Spec */}
                <div className="flex items-center justify-between text-xs text-[#626B78] mt-3">
                  <span className="truncate pr-2" title={currentCard.cadenceNotation}>
                    {currentCard.cadenceNotation}
                  </span>
                  <span className="shrink-0 font-semibold text-[#009B87]">
                    Coherence Index {coherenceScore}%
                  </span>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-[#EEF1EF] mt-4">
                <button
                  onClick={() => setIsFlipped(true)}
                  className="text-xs font-medium text-[#626B78] hover:text-[#009B87] flex items-center space-x-1 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Somatic Anchor</span>
                </button>

                <div className="flex items-center space-x-2">
                  {/* Save to Sanctuary Vault / Library */}
                  <button
                    onClick={() => handleSaveCard(currentCard)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all border ${
                      isSaved
                        ? 'bg-[#EAFBF5] text-[#009B87] border-[#2DD4BF]/60'
                        : 'bg-[#FAF9F6] text-[#626B78] border-[#E5E9E7] hover:text-[#171D27] hover:bg-[#FFFFFF]'
                    }`}
                    title="Save this card to your Resonance Library"
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#009B87]" />
                        <span className="hidden sm:inline text-[#009B87]">Saved</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Save</span>
                      </>
                    )}
                  </button>

                  {/* Play Immediately in Gemini 3.8 realistic human audio */}
                  <button
                    onClick={() => handlePlayCard(currentCard)}
                    className="px-4 py-2 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all transform active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isCurrentlyPlayingCard ? 'Playing Now' : 'Spontaneous Manifest'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons & Progress Dots */}
        <div className="w-full max-w-xl flex items-center justify-between mt-5 px-2">
          <button
            onClick={handlePrev}
            disabled={filteredCards.length <= 1}
            aria-label="Previous card"
            className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E9E7] text-[#171D27] hover:bg-[#F7FAF8] hover:border-[#2DD4BF]/50 disabled:opacity-40 transition-all shadow-2xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5">
            {filteredCards.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(idx);
                }}
                aria-label={`Jump to card ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-[#009B87]'
                    : 'w-2 bg-[#E5E9E7] hover:bg-[#626B78]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={filteredCards.length <= 1}
            aria-label="Next card"
            className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E5E9E7] text-[#171D27] hover:bg-[#F7FAF8] hover:border-[#2DD4BF]/50 disabled:opacity-40 transition-all shadow-2xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Instructions & Keyboard Shortcuts */}
        <div className="mt-8 text-center text-xs text-[#89919B]">
          <p className="hidden sm:block">
            Tip: Use keyboard <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E5E9E7] rounded font-mono text-[11px] text-[#171D27]">←</kbd> and <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E5E9E7] rounded font-mono text-[11px] text-[#171D27]">→</kbd> to browse, or <kbd className="px-1.5 py-0.5 bg-[#FFFFFF] border border-[#E5E9E7] rounded font-mono text-[11px] text-[#171D27]">Space</kbd> to flip between incantation and somatic anchor.
          </p>
          <p className="sm:hidden">
            Swipe left or right to browse, tap to flip between incantation and somatic anchor.
          </p>
        </div>
      </div>
    </div>
  );
};
