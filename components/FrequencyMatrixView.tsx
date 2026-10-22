'use client';

import React, { useState } from 'react';
import {
  Radio,
  Play,
  Square,
  Waves,
  Zap,
  CheckCircle2,
  Sliders,
  Volume2,
} from 'lucide-react';
import { SOLFEGGIO_FREQUENCIES, SolfeggioFrequency } from '@/lib/quantum-engine';
import { globalSolfeggioSynth } from '@/lib/audio-player';

interface FrequencyMatrixViewProps {
  activeHz: number;
  setActiveHz: (hz: number) => void;
  carrierActive: boolean;
  toggleCarrier: () => void;
}

export const FrequencyMatrixView: React.FC<FrequencyMatrixViewProps> = ({
  activeHz,
  setActiveHz,
  carrierActive,
  toggleCarrier,
}) => {
  const [testingHz, setTestingHz] = useState<number | null>(null);

  const handleTestTone = (freq: SolfeggioFrequency) => {
    if (testingHz === freq.hz) {
      // Stop
      globalSolfeggioSynth.stopTone();
      setTestingHz(null);
    } else {
      // Start
      setActiveHz(freq.hz);
      setTestingHz(freq.hz);
      globalSolfeggioSynth.startTone(freq.hz, freq.binauralDifference, 0.28);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAFBF5] border border-[#2DD4BF]/40 text-[#009B87] text-xs font-semibold mb-2">
          <Waves className="w-3.5 h-3.5" />
          <span>Acoustic Bio-Resonance Architecture</span>
        </div>
        <h1 className="text-[30px] font-bold text-[#171D27] tracking-tight">
          Solfeggio Frequency & Carrier Tone Matrix
        </h1>
        <p className="text-[14px] text-[#626B78] mt-1 max-w-3xl leading-relaxed">
          The subconscious mind does not only process semantic vocabulary—it entrains to fundamental acoustic
          hertz waves and binaural differences. Test each frequency below to feel its somatic signature.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SOLFEGGIO_FREQUENCIES.map((freq) => {
          const isCurrentTest = testingHz === freq.hz;
          const isSelectedDefault = activeHz === freq.hz;

          return (
            <div
              key={freq.hz}
              className={`bg-[#FFFFFF] p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrentTest
                  ? 'border-[#009B87] ring-2 ring-[#2DD4BF]/40 shadow-[0_4px_16px_rgba(0,155,135,0.12)]'
                  : 'border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)] hover:border-[#2DD4BF]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-[20px] font-black text-[#171D27] font-mono">
                      {freq.hz} <span className="text-[12px] font-bold text-[#009B87]">Hz</span>
                    </span>
                    {isSelectedDefault && (
                      <span className="text-[10px] font-bold bg-[#EAFBF5] text-[#009B87] px-2 py-0.5 rounded-full border border-[#2DD4BF]/30">
                        Default
                      </span>
                    )}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: freq.colorCode }}
                    title={freq.chakraOrBioField}
                  />
                </div>

                <h3 className="text-[16px] font-bold text-[#171D27] mb-1">
                  {freq.name}
                </h3>
                <p className="text-[13px] text-[#626B78] leading-relaxed mb-4">
                  {freq.harmonicPurpose}
                </p>

                <div className="space-y-1.5 text-[12px] p-3 rounded-xl bg-[#FAF9F6] border border-[#EEF1EF] mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#89919B]">Bio-Field Focus:</span>
                    <span className="font-medium text-[#171D27]">{freq.chakraOrBioField}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#89919B]">Binaural Entrainment:</span>
                    <span className="font-mono text-[#009B87] font-semibold">
                      +{freq.binauralDifference} Hz Difference
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EEF1EF] flex items-center justify-between">
                <button
                  onClick={() => setActiveHz(freq.hz)}
                  className={`text-[12px] font-medium transition-colors ${
                    isSelectedDefault
                      ? 'text-[#009B87] font-bold'
                      : 'text-[#626B78] hover:text-[#171D27]'
                  }`}
                >
                  {isSelectedDefault ? '✓ Selected in Studio' : 'Select for Studio'}
                </button>

                <button
                  onClick={() => handleTestTone(freq)}
                  className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold flex items-center space-x-1.5 transition-all ${
                    isCurrentTest
                      ? 'bg-[#DC2626] text-white shadow-xs'
                      : 'bg-[#EAFBF5] text-[#009B87] hover:bg-[#009B87] hover:text-white'
                  }`}
                >
                  {isCurrentTest ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop Tone</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Audition Tone</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
