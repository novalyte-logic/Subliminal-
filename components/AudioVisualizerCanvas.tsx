'use client';

import React, { useEffect, useRef } from 'react';
import { globalSolfeggioSynth } from '@/lib/audio-player';

interface AudioVisualizerCanvasProps {
  isPlaying: boolean;
  frequencyHz: number;
  height?: number;
}

export const AudioVisualizerCanvas: React.FC<AudioVisualizerCanvasProps> = ({
  isPlaying,
  frequencyHz,
  height = 72,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      // Background subtle grid
      ctx.strokeStyle = '#EEF1EF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(width, h / 2);
      ctx.stroke();

      const analyser = globalSolfeggioSynth.getAnalyser();

      if (isPlaying) {
        phase += 0.04;
        const bufferLength = analyser ? analyser.frequencyBinCount : 64;
        const dataArray = analyser ? new Uint8Array(bufferLength) : new Uint8Array(64);
        if (analyser) {
          analyser.getByteTimeDomainData(dataArray);
        } else {
          // Synthetic wave based on frequency
          for (let i = 0; i < 64; i++) {
            const val = Math.sin((i / 64) * Math.PI * 4 + phase) * 25 + 128;
            dataArray[i] = val;
          }
        }

        // Draw glowing frequency wave 1 (Primary Teal #009B87)
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = '#009B87';
        ctx.shadowColor = 'rgba(0, 155, 135, 0.45)';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        // Draw secondary harmonic wave (Mint Accent #2DD4BF)
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = '#2DD4BF';
        ctx.shadowColor = 'rgba(45, 212, 191, 0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const harmonic = Math.sin((i / bufferLength) * Math.PI * 8 - phase * 1.5) * 8;
          const v = dataArray[i] / 128.0;
          const y = (v * h) / 2 + harmonic;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }
        ctx.stroke();

        // Frequency resonance indicators
        ctx.shadowBlur = 0;
        const barCount = 18;
        const barSpacing = width / barCount;
        for (let b = 0; b < barCount; b++) {
          const barHeight = Math.abs(Math.sin(b * 0.4 + phase * 2)) * (h * 0.35);
          const bx = b * barSpacing + barSpacing / 2;
          ctx.fillStyle = b % 2 === 0 ? 'rgba(0, 155, 135, 0.22)' : 'rgba(45, 212, 191, 0.28)';
          ctx.fillRect(bx - 2, h / 2 - barHeight / 2, 4, barHeight);
        }
      } else {
        // Resting state: gentle breathing zero-point harmonic
        phase += 0.015;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0, 155, 135, 0.3)';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        for (let i = 0; i < width; i += 4) {
          const y = h / 2 + Math.sin(i * 0.02 + phase) * 4;
          if (i === 0) ctx.moveTo(i, y);
          else ctx.lineTo(i, y);
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, frequencyHz]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-[#FAF9F6] border border-[#EEF1EF]">
      <canvas
        ref={canvasRef}
        width={720}
        height={height}
        className="w-full h-full block"
      />
      <div className="absolute top-2 right-3 flex items-center space-x-1.5 text-[11px] font-mono text-[#626B78] bg-white/80 px-2 py-0.5 rounded-md border border-[#E5E9E7]/60">
        <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#009B87] animate-ping' : 'bg-[#89919B]'}`} />
        <span>{frequencyHz} Hz Carrier Bed</span>
      </div>
    </div>
  );
};
