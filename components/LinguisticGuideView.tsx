'use client';

import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Zap,
  ArrowRight,
  ShieldAlert,
  Brain,
  Sparkles,
} from 'lucide-react';

export const LinguisticGuideView: React.FC = () => {
  const comparisons = [
    {
      category: 'Financial Abundance',
      traditional: 'I am a wealthy multi-millionaire with millions in my bank account.',
      subconsciousFriction:
        'The Reticular Activating System (RAS) triggers alarm: "Lie. You checked your bank account this morning and you have $2,400."',
      quantumLeap:
        'I collapse the infinite wealth vector into this immediate coordinate. All financial resistance has evaporated into zero-point certainty; sovereign prosperity crystallizes now.',
      whyItWorks:
        'Does not argue with current 3D bank balance; claims quantum probability collapse, which the logical intellect cannot counter-argue.',
    },
    {
      category: 'Physical Healing & Energy',
      traditional: 'I will be cured and I will be healthy and happy.',
      subconsciousFriction:
        'Future tense "will be" linguistically reinforces that you are sick right now, perpetually delaying healing into tomorrow.',
      quantumLeap:
        'I collapse all biological delay into immediate cellular renewal. My mitochondria ignite at 528Hz coherence, restoring radiant biological perfection now.',
      whyItWorks:
        'Directs attention to cellular frequency and mitochondrial ignition in the immediate second with somatic breath anchoring.',
    },
    {
      category: 'Unshakeable Confidence & Imposter Syndrome',
      traditional: 'I am trying to believe in myself and become a strong founder.',
      subconsciousFriction:
        '"Trying" is linguistic confession of struggle and self-doubt, signaling helplessness to the autonomic nervous system.',
      quantumLeap:
        'As the sovereign conscious observer, I decree unshakeable authority over this vessel. All hesitation dissolves before my command; clarity is absolute and permanent.',
      whyItWorks:
        'Positions the speaker as the source observer decreeing reality, bypassing the petitioner-victim psychological posture.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      <div className="mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EAFBF5] border border-[#2DD4BF]/40 text-[#009B87] text-xs font-semibold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Neuro-Linguistic Quantum Mechanics</span>
        </div>
        <h1 className="text-[30px] font-bold text-[#171D27] tracking-tight">
          The Science of Quantum Leap Language
        </h1>
        <p className="text-[14px] text-[#626B78] mt-1 max-w-3xl leading-relaxed">
          Why traditional positive thinking often fails—and how quantum observer language, somatic anchors,
          and high-frequency acoustics permanently rewire subconscious neuroplasticity.
        </p>
      </div>

      {/* 3 Foundation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-[#F3FCF8] text-[#009B87] flex items-center justify-center mb-4">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="text-[16px] font-bold text-[#171D27] mb-2">
            1. Bypassing the Critical Factor
          </h3>
          <p className="text-[13px] text-[#626B78] leading-relaxed">
            The left hemisphere filters out positive statements that contradict sensory facts. Quantum
            leap syntax operates on probabilities and zero-point vectors, bypassing amygdala skepticism.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-[#F3FCF8] text-[#009B87] flex items-center justify-center mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-[16px] font-bold text-[#171D27] mb-2">
            2. Somatic Cellular Anchoring
          </h3>
          <p className="text-[13px] text-[#626B78] leading-relaxed">
            Words without visceral sensations evaporate from memory. Linking affirmations to specific vagal
            nerve breath cues and interoceptive muscular releases encodes the statement into cellular biology.
          </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]">
          <div className="w-10 h-10 rounded-xl bg-[#F3FCF8] text-[#009B87] flex items-center justify-center mb-4">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-[16px] font-bold text-[#171D27] mb-2">
            3. Solfeggio Auditory Entrainment
          </h3>
          <p className="text-[13px] text-[#626B78] leading-relaxed">
            528Hz and 432Hz carrier waves provide a coherent electromagnetic bed that synchronizes left and
            right brain hemispheres into receptive theta states ideal for rapid subconscious programming.
          </p>
        </div>
      </div>

      {/* Side-by-Side Analysis */}
      <h2 className="text-[22px] font-semibold text-[#171D27] mb-6">
        Comparative Linguistic Breakdown
      </h2>

      <div className="space-y-6">
        {comparisons.map((item, idx) => (
          <div
            key={idx}
            className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)]"
          >
            <div className="text-[12px] font-bold text-[#009B87] uppercase tracking-wider mb-4">
              Vector: {item.category}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traditional */}
              <div className="p-4 rounded-xl bg-red-50/40 border border-red-100">
                <div className="flex items-center space-x-1.5 text-red-700 text-[12px] font-bold mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>Traditional Affirmation</span>
                </div>
                <p className="text-[13px] text-[#171D27] italic mb-3">&ldquo;{item.traditional}&rdquo;</p>
                <div className="text-[11px] text-red-800 bg-red-100/50 p-2.5 rounded-lg">
                  <strong className="block mb-0.5">Subconscious Rejection:</strong>
                  {item.subconsciousFriction}
                </div>
              </div>

              {/* Quantum Leap */}
              <div className="p-4 rounded-xl bg-[#F3FCF8] border border-[#2DD4BF]/40 lg:col-span-2">
                <div className="flex items-center space-x-1.5 text-[#009B87] text-[12px] font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 text-[#009B87]" />
                  <span>Quantum Leap Transmutation</span>
                </div>
                <p className="text-[14px] text-[#171D27] font-semibold mb-3">
                  &ldquo;{item.quantumLeap}&rdquo;
                </p>
                <div className="text-[12px] text-[#005F58] bg-[#EAFBF5] p-3 rounded-lg border border-[#2DD4BF]/20">
                  <strong className="block mb-0.5 text-[#171D27]">Neuro-Linguistic Mechanism:</strong>
                  {item.whyItWorks}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
