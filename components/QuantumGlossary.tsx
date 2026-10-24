import React from 'react';
import { BookOpen } from 'lucide-react';

export const QuantumGlossary: React.FC = () => {
  const terms = [
    {
      term: 'Quantum Collapse',
      definition: 'The linguistic technique of speaking as if a desired future has already materialized in the present, forcing the subconscious to align with that reality as current fact rather than future possibility.'
    },
    {
      term: 'Zero-Point Certainty',
      definition: 'The removal of all doubt-inducing language (want, hope, wish). By framing affirmations with absolute finality, we neutralize the subconscious resistance that arises from ambiguity.'
    },
    {
      term: 'Somatic Anchoring',
      definition: 'The integration of specific physical sensations or breath patterns (e.g., solar plexus warmth, vagus nerve release) to ground abstract affirmations into the body\'s biological feedback loop.'
    },
    {
      term: 'Vocal Entrainment',
      definition: 'Matching the cadence, pitch, and resonance of the spoken audio to biological rhythms (HRV resonance), encouraging the nervous system to entrain with the affirmation\'s intended state.'
    }
  ];

  return (
    <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E5E9E7] shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <BookOpen className="w-5 h-5 text-[#009B87]" />
        <h2 className="text-[18px] font-bold text-[#171D27]">Quantum Leap Glossary</h2>
      </div>
      <div className="space-y-4">
        {terms.map((item) => (
          <div key={item.term} className="border-b border-[#EEF1EF] pb-3 last:border-0 last:pb-0">
            <h3 className="text-[14px] font-semibold text-[#009B87] mb-1">{item.term}</h3>
            <p className="text-[13px] text-[#626B78] leading-relaxed">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
