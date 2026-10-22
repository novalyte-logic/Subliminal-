'use client';

import React, { useEffect, useRef, useState } from 'react';
import { globalSolfeggioSynth } from '@/lib/audio-player';
import {
  calculateRms,
  calculatePeak,
  smoothAmplitude,
  generateBarHeights,
  amplitudeToDecibels,
} from '@/lib/amplitude';
import { Activity } from 'lucide-react';

interface ReactiveAmplitudeVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  className?: string;
  showDecibels?: boolean;
}

export const ReactiveAmplitudeVisualizer: React.FC<ReactiveAmplitudeVisualizerProps> = ({
  isPlaying,
  barCount = 18,
  height = 28,
  className = '',
  showDecibels = true,
}) => {
  const [rms, setRms] = useState<number>(0);
  const [decibels, setDecibels] = useState<number>(-60);
  const [bars, setBars] = useState<number[]>(() => new Array(barCount).fill(0.08));

  const animRef = useRef<number | null>(null);
  const smoothedRmsRef = useRef<number>(0);
  const simulatedPhaseRef = useRef<number>(0);

  useEffect(() => {
    let active = true;

    const updateLoop = () => {
      if (!active) return;

      const analyser = globalSolfeggioSynth.getAnalyser();
      let rawRms = 0;
      let rawFreqs: Uint8Array | null = null;

      if (isPlaying) {
        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const measuredRms = calculateRms(dataArray);
          if (measuredRms > 0.02) {
            rawRms = measuredRms;
            rawFreqs = dataArray;
          }
        }

        // If analyser is quiet or Web Speech is playing, generate realistic vocal speech amplitude envelope
        if (!rawFreqs || rawRms < 0.05) {
          simulatedPhaseRef.current += 0.08;
          const p = simulatedPhaseRef.current;
          // Organic speech syllable envelope simulation with breath pauses
          const speechPulse = Math.sin(p * 2.8) * Math.cos(p * 1.4);
          const breathPause = Math.sin(p * 0.4) > -0.6 ? 1 : 0.15; // Periodic breath silence
          const dynamicAmp = Math.max(0.05, Math.abs(speechPulse) * breathPause * 0.75 + 0.15);

          rawRms = dynamicAmp;
          const syntheticData = new Uint8Array(barCount);
          for (let i = 0; i < barCount; i++) {
            const harmonic = Math.sin(p * 3.5 + i * 0.45) * 0.5 + 0.5;
            syntheticData[i] = Math.floor(dynamicAmp * harmonic * 255);
          }
          rawFreqs = syntheticData;
        }
      } else {
        // Paused state: settle gently to rest
        rawRms = 0.02;
        rawFreqs = new Uint8Array(barCount).fill(12);
      }

      // Ballistic smoothing
      const smoothed = smoothAmplitude(smoothedRmsRef.current, rawRms, 0.7, 0.18);
      smoothedRmsRef.current = smoothed;

      // Resample bars
      const newBars = generateBarHeights(rawFreqs, barCount, 1.4);
      setBars(newBars);
      setRms(smoothed);
      setDecibels(amplitudeToDecibels(smoothed));

      animRef.current = requestAnimationFrame(updateLoop);
    };

    animRef.current = requestAnimationFrame(updateLoop);

    return () => {
      active = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, barCount]);

  return (
    <div
      className={`flex items-center space-x-2.5 px-2.5 py-1.5 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] transition-all ${className}`}
      title={`Live Audio Amplitude: ${Math.round(rms * 100)}% (${decibels} dB)`}
    >
      <div className="flex items-center space-x-1.5 shrink-0">
        <Activity
          className={`w-3.5 h-3.5 transition-colors ${
            isPlaying ? 'text-[#009B87] animate-pulse' : 'text-[#89919B]'
          }`}
        />
        {showDecibels && (
          <span className="text-[10px] font-mono font-semibold text-[#626B78] w-10 text-right">
            {isPlaying ? `${decibels} dB` : 'Muted'}
          </span>
        )}
      </div>

      {/* Dynamic Spectrum Amplitude Bars */}
      <div
        className="flex items-end space-x-1 overflow-hidden"
        style={{ height: `${height}px` }}
        role="meter"
        aria-label="Audio amplitude spectrum"
        aria-valuenow={Math.round(rms * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {bars.map((barHeight, idx) => {
          const clampedHeight = Math.max(3, Math.round(barHeight * height));
          const isHighPeak = barHeight > 0.65;

          return (
            <div
              key={idx}
              className="w-1 rounded-full transition-all duration-75 origin-bottom"
              style={{
                height: `${clampedHeight}px`,
                backgroundColor: isHighPeak
                  ? '#2DD4BF' // Mint highlight on audio peaks
                  : '#009B87', // Primary Teal
                opacity: isPlaying ? 0.35 + barHeight * 0.65 : 0.2,
                boxShadow: isPlaying && isHighPeak ? '0 0 6px rgba(45, 212, 191, 0.6)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* RMS Level Ring Indicator */}
      <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full transition-all duration-100"
          style={{
            backgroundColor: isPlaying ? '#009B87' : '#89919B',
            transform: `scale(${isPlaying ? 0.4 + rms * 0.7 : 0.4})`,
            opacity: isPlaying ? 0.3 + rms * 0.7 : 0.2,
          }}
        />
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            isPlaying ? 'bg-[#009B87]' : 'bg-[#89919B]'
          }`}
        />
      </div>
    </div>
  );
};
