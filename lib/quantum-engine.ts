export interface SolfeggioFrequency {
  hz: number;
  name: string;
  harmonicPurpose: string;
  binauralDifference: number; // e.g. 4.0 for Theta 4Hz
  colorCode: string;
  chakraOrBioField: string;
  recommendedParadigm: QuantumParadigmId;
}

export type QuantumParadigmId = 
  | 'timeline-collapse' 
  | 'observer-sovereignty' 
  | 'bio-electric-somatic' 
  | 'multiverse-convergence';

export interface QuantumParadigm {
  id: QuantumParadigmId;
  name: string;
  tagline: string;
  linguisticRule: string;
  description: string;
  powerMultiplier: string;
}

export interface QuantumAffirmationResult {
  id: string;
  originalText: string;
  quantumText: string;
  paradigm: QuantumParadigmId;
  frequencyHz: number;
  somaticAnchor: string;
  linguisticShiftAnalysis: string;
  cadenceNotation: string;
  estimatedDurationSeconds: number;
  voiceName: string;
  createdAt: string;
  audioBase64?: string; // WAV base64 if generated via TTS
}

export const SOLFEGGIO_FREQUENCIES: SolfeggioFrequency[] = [
  {
    hz: 432,
    name: 'Zero-Point Grounding',
    harmonicPurpose: 'Natural mathematical coherence, deep theta calm, cellular peace',
    binauralDifference: 4.5, // Deep Theta
    colorCode: '#009B87',
    chakraOrBioField: 'Electromagnetic Field & Heart Matrix',
    recommendedParadigm: 'timeline-collapse',
  },
  {
    hz: 528,
    name: 'DNA & Cellular Transformation',
    harmonicPurpose: 'The miracle tone: molecular repair, emotional release, radiant vitality',
    binauralDifference: 7.83, // Schumann Resonance Alpha
    colorCode: '#2DD4BF',
    chakraOrBioField: 'Solar Plexus & Mitochondrial Energy',
    recommendedParadigm: 'bio-electric-somatic',
  },
  {
    hz: 639,
    name: 'Quantum Relational Entanglement',
    harmonicPurpose: 'Harmonizing relationships, divine union, telepathic connection',
    binauralDifference: 6.0, // Theta Connection
    colorCode: '#0EA5E9',
    chakraOrBioField: 'Heart Chakra & Relational Resonance',
    recommendedParadigm: 'multiverse-convergence',
  },
  {
    hz: 741,
    name: 'Subconscious Detoxification',
    harmonicPurpose: 'Clearing energetic toxins, dismantling deep-seated trauma patterns',
    binauralDifference: 5.0, // Subconscious Clearing
    colorCode: '#8B5CF6',
    chakraOrBioField: 'Throat & Intuitive Expression',
    recommendedParadigm: 'observer-sovereignty',
  },
  {
    hz: 852,
    name: 'Awakening Intuition & Sight',
    harmonicPurpose: 'Dissolving cognitive illusions, high-order mental clarity',
    binauralDifference: 8.0, // High Alpha
    colorCode: '#A855F7',
    chakraOrBioField: 'Third Eye & Pineal Coherence',
    recommendedParadigm: 'observer-sovereignty',
  },
  {
    hz: 888,
    name: 'Infinite Abundance Vortex',
    harmonicPurpose: 'Vortex mathematics of infinite receipt, wealth crystallization',
    binauralDifference: 10.0, // Focused Beta/Alpha bridge
    colorCode: '#D97706',
    chakraOrBioField: 'Root-to-Crown Abundance Conduit',
    recommendedParadigm: 'timeline-collapse',
  },
  {
    hz: 963,
    name: 'Pure Source Consciousness',
    harmonicPurpose: 'Direct communion with the unified field, unmanifest potential',
    binauralDifference: 4.0, // Transcendent Theta
    colorCode: '#005F58',
    chakraOrBioField: 'Crown Chakra & Universal Field',
    recommendedParadigm: 'multiverse-convergence',
  },
];

export const QUANTUM_PARADIGMS: Record<QuantumParadigmId, QuantumParadigm> = {
  'timeline-collapse': {
    id: 'timeline-collapse',
    name: 'Timeline Collapse (Zero-Point)',
    tagline: 'Folds future possibilities directly into the present spatial coordinate',
    linguisticRule: 'Eliminate future tense ("will", "shall") and desire ("want", "hope"). Replace with instant spatial collapse ("I collapse the probability into physical fact now").',
    description: 'Based on quantum superposition principles: reality exists in potential until observed with uncompromising certainty.',
    powerMultiplier: '9.4x neural integration',
  },
  'observer-sovereignty': {
    id: 'observer-sovereignty',
    name: 'Observer Sovereignty',
    tagline: 'Decrees reality through the unshakeable authority of the conscious observer',
    linguisticRule: 'Position the speaker as the source decreeing law to the physical vessel and environment ("By my conscious decree, this physical vessel reflects...").',
    description: 'Eliminates subconscious feelings of begging or pleading, commanding absolute authority over physical and financial states.',
    powerMultiplier: '11.2x cognitive rewiring',
  },
  'bio-electric-somatic': {
    id: 'bio-electric-somatic',
    name: 'Bio-Electric Somatic Encoding',
    tagline: 'Anchors quantum frequency into neuromuscular and cellular biology',
    linguisticRule: 'Fuse declarations with explicit somatic cues ("My nervous system electrifies with...", "Every cell pulsates at 528Hz...").',
    description: 'Bypasses intellectual skepticism by engaging visceral interoceptive pathways and vagal tone.',
    powerMultiplier: '8.8x visceral entrainment',
  },
  'multiverse-convergence': {
    id: 'multiverse-convergence',
    name: 'Multiverse Convergence',
    tagline: 'Quantum-tunnels the identity of your highest parallel reality into your current body',
    linguisticRule: 'Frame experience as an already existing parallel timeline synchronizing with the current physical frame ("The version of me in total abundance merges into my flesh now").',
    description: 'Disarms psychological resistance by acknowledging that the desired reality already exists in the multiverse.',
    powerMultiplier: '10.5x manifestation velocity',
  },
};

export const PRESET_AFFIRMATIONS = [
  {
    category: 'Wealth & Sovereign Abundance',
    raw: 'I want to stop worrying about money and attract huge financial wealth and freedom.',
    targetFrequency: 888,
    targetParadigm: 'timeline-collapse' as QuantumParadigmId,
  },
  {
    category: 'Cellular Vitality & Super-Immunity',
    raw: 'I hope my body heals from fatigue and I get my vibrant energy back.',
    targetFrequency: 528,
    targetParadigm: 'bio-electric-somatic' as QuantumParadigmId,
  },
  {
    category: 'Divine Magnetism & Relational Union',
    raw: 'I am looking for true unconditional love and deep soul connection.',
    targetFrequency: 639,
    targetParadigm: 'multiverse-convergence' as QuantumParadigmId,
  },
  {
    category: 'Unshakeable Leadership & Clarity',
    raw: 'I wish I had more confidence and stopped doubting my decisions as a founder.',
    targetFrequency: 741,
    targetParadigm: 'observer-sovereignty' as QuantumParadigmId,
  },
  {
    category: 'Genius Flow & Hyper-Focus',
    raw: 'I want to overcome brain fog and tap into limitless creative genius every day.',
    targetFrequency: 432,
    targetParadigm: 'timeline-collapse' as QuantumParadigmId,
  },
  {
    category: 'Higher Consciousness & Intuition',
    raw: 'I want to feel connected to the universe and trust my intuition fully.',
    targetFrequency: 963,
    targetParadigm: 'multiverse-convergence' as QuantumParadigmId,
  },
];

/**
 * Calculates rhythmic cadence properties
 */
export function analyzeRhythmicCadence(text: string): {
  syllableCount: number;
  wordCount: number;
  estimatedDurationSeconds: number;
  meterStyle: string;
} {
  const clean = text.trim();
  if (!clean) {
    return { syllableCount: 0, wordCount: 0, estimatedDurationSeconds: 0, meterStyle: 'Rest' };
  }
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Approximate syllable count
  let syllableCount = 0;
  for (const w of words) {
    const word = w.toLowerCase().replace(/[^a-z]/g, '');
    if (!word) continue;
    if (word.length <= 3) {
      syllableCount += 1;
      continue;
    }
    const syllables = word
      .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g);
    syllableCount += syllables ? Math.max(1, syllables.length) : 1;
  }

  // High-frequency quantum incantations are spoken with rhythmic gravitas: ~110-130 words per minute + deliberate breath pauses
  const estimatedDurationSeconds = Math.max(4, Math.round((wordCount / 1.9) + 2.5));

  const meterStyle = syllableCount % 2 === 0 
    ? 'Resonant Harmonic Binary (Balanced Cadence)' 
    : 'Triadic Pulsing Influx (Dynamic Surge)';

  return {
    syllableCount,
    wordCount,
    estimatedDurationSeconds,
    meterStyle,
  };
}

/**
 * Strips weak linguistic markers (e.g. "I want", "I hope", "I will try", "I need")
 */
export function stripSubconsciousFriction(rawInput: string): string {
  let cleaned = rawInput.trim();
  const weakPatterns = [
    /^(i want to|i hope to|i wish to|i need to|i am trying to|i will try to)\s+/i,
    /^(i want|i hope|i wish|i need)\s+/i,
    /^(i am praying for|i would like to have)\s+/i,
  ];

  for (const pattern of weakPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Deterministic Fallback Quantum Leap Transmuter
 * Produces high-fidelity, impactful quantum affirmations even without API latency
 */
export function transmuteDeterministically(
  rawInput: string,
  paradigmId: QuantumParadigmId = 'timeline-collapse',
  targetHz: number = 528
): QuantumAffirmationResult {
  const stripped = stripSubconsciousFriction(rawInput);
  const freqObj = SOLFEGGIO_FREQUENCIES.find((f) => f.hz === targetHz) || SOLFEGGIO_FREQUENCIES[1];

  let quantumText = '';
  let somaticAnchor = '';
  let linguisticShiftAnalysis = '';

  const lower = rawInput.toLowerCase();
  const isWealth = /money|wealth|financ|rich|afford|income|abundanc|business|debt|earning/i.test(lower);
  const isHealth = /heal|health|body|pain|fatigue|energy|vital|cancer|sick|weight|sleep|cure/i.test(lower);
  const isLove = /love|soul|relation|partner|marry|heart|attract|dating|connection/i.test(lower);
  const isConfidence = /confiden|fear|doubt|impost|lead|founder|power|speak|brave|strength/i.test(lower);
  const isFocus = /focus|brain|fog|mind|productiv|clarity|flow|genius|creativ/i.test(lower);

  if (paradigmId === 'timeline-collapse') {
    if (isWealth) {
      quantumText = `I collapse the infinite wealth vector into this immediate coordinate. Every financial resistance has evaporated into zero-point certainty; sovereign abundance crystallizes into my reality now.`;
      somaticAnchor = `Breathe down to the pelvic floor, lock the jaw gently, and feel solid gravitational weight holding unshakeable wealth.`;
      linguisticShiftAnalysis = `Replaces "wanting money" (which affirms lack) with "collapsing the vector into immediate coordinate," establishing mathematical certainty in the subconscious.`;
    } else if (isHealth) {
      quantumText = `I collapse all biological delay into immediate cellular renewal. My mitochondria ignite at ${freqObj.hz}Hz coherence, restoring radiant biological perfection now.`;
      somaticAnchor = `Deep inhale through the nostrils into the heart center; feel a warm liquid gold pulse expanding through the ribcage.`;
      linguisticShiftAnalysis = `Replaces hopeful healing with present cellular ignition, neutralizing subconscious attachment to the illness identity.`;
    } else if (isLove) {
      quantumText = `I collapse the illusion of separation. My heart field radiates at ${freqObj.hz}Hz electromagnetic coherence, magnetically synchronizing with my supreme divine union now.`;
      somaticAnchor = `Rest both palms over the center of the chest; exhale slowly while relaxing the space behind the eyes.`;
      linguisticShiftAnalysis = `Shifts from yearning to gravitational magnetism, dissolving unconscious unworthiness.`;
    } else {
      quantumText = `I collapse the quantum wave function of ${stripped.toLowerCase() || 'supreme sovereign mastery'} into physical coordinate now. Reality has registered my command. It is done.`;
      somaticAnchor = `Drop the shoulders 2 inches, release the tongue from the palate, and lock the breath for 3 seconds in quiet certainty.`;
      linguisticShiftAnalysis = `Eliminates waiting time and establishes instantaneous quantum observation.`;
    }
  } else if (paradigmId === 'observer-sovereignty') {
    if (isConfidence) {
      quantumText = `As the sovereign conscious observer, I decree unshakeable authority over this mind and vessel. All hesitation dissolves before my command; clarity is absolute and permanent.`;
      somaticAnchor = `Lengthen the spine upwards, lift the chin 5 degrees, and feel the solar plexus radiate heat.`;
      linguisticShiftAnalysis = `Eliminates the "trying to feel confident" loop by claiming observer sovereignty as an ontological fact.`;
    } else if (isWealth) {
      quantumText = `By sovereign conscious decree, I command the materialization of boundless prosperity. The universe conforms to my frequency of unyielding stewardship and wealth.`;
      somaticAnchor = `Open both hands facing upward on your lap; feel the tingling pulse in the fingertips as receptors of abundance.`;
      linguisticShiftAnalysis = `Positions you as the master directing flow rather than a petitioner begging for luck.`;
    } else {
      quantumText = `As the sovereign observer of this field, I decree that ${stripped.toLowerCase()} is crystallized as unalterable truth throughout every dimension of my life.`;
      somaticAnchor = `Inhale 4 counts, hold 7 counts feeling pure stillness, exhale 8 counts releasing all doubt.`;
      linguisticShiftAnalysis = `Commands reality rather than asking permission from external circumstances.`;
    }
  } else if (paradigmId === 'bio-electric-somatic') {
    quantumText = `My neuromuscular network electrifies at ${freqObj.hz}Hz. Every cell, nerve ending, and synapse anchors ${stripped.toLowerCase()} into somatic, irreversible biological certainty.`;
    somaticAnchor = `Clench both fists lightly on inhale, then release completely on exhale, allowing electric tingling to wash over the arms and spine.`;
    linguisticShiftAnalysis = `Engages visceral proprioception to bypass the analytical mind's rationalizations.`;
  } else {
    // multiverse-convergence
    quantumText = `The parallel version of my sovereign self who embodies ${stripped.toLowerCase()} merges seamlessly into this vessel now. Our timelines have locked; our realities are one.`;
    somaticAnchor = `Close eyes, tilt head slightly back, visualize a double-helix pulse connecting your current crown to infinite parallel clarity.`;
    linguisticShiftAnalysis = `Bypasses the "how will it happen" paradox by acknowledging that the perfected frequency already exists and is simply being tuned into.`;
  }

  const cadence = analyzeRhythmicCadence(quantumText);

  return {
    id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    originalText: rawInput,
    quantumText,
    paradigm: paradigmId,
    frequencyHz: targetHz,
    somaticAnchor,
    linguisticShiftAnalysis,
    cadenceNotation: `Cadence: ${cadence.meterStyle} • ~${cadence.wordCount} words • ${cadence.estimatedDurationSeconds}s spoken breath cycle`,
    estimatedDurationSeconds: cadence.estimatedDurationSeconds,
    voiceName: 'Kore',
    createdAt: new Date().toISOString(),
  };
}
