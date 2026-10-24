/**
 * Quantum Manifestation Daily Deck
 * Pure logic and curated quantum leap affirmation deck for daily & spontaneous manifestation sessions.
 */

import {
  QuantumParadigmId,
  QuantumAffirmationResult,
  transmuteDeterministically,
} from './quantum-engine';

export interface QuantumDeckCard {
  id: string;
  theme: string;
  archetype: string;
  paradigm: QuantumParadigmId;
  frequencyHz: number;
  quantumText: string;
  somaticAnchor: string;
  cadenceNotation: string;
  recommendedBpm: number;
  focusArea: 'Abundance' | 'Vitality' | 'Sovereignty' | 'Love' | 'Intuition' | 'Impact';
}

export const MASTER_QUANTUM_DECK: QuantumDeckCard[] = [
  {
    id: 'deck-card-01',
    theme: 'Infinite Abundance Vortex',
    archetype: 'The Sovereign Architect',
    paradigm: 'timeline-collapse',
    frequencyHz: 888,
    quantumText: 'I collapse the infinite wealth vector into this immediate coordinate. Every financial resistance has evaporated into zero-point certainty; sovereign abundance crystallizes into my reality now.',
    somaticAnchor: 'Rest one palm over heart, one on solar plexus. Feel warm gravitational density locking the financial timeline into physical reality.',
    cadenceNotation: 'Triadic Pulsing Influx (Dynamic Surge) • ~25 words • 16s spoken breath cycle',
    recommendedBpm: 5.5,
    focusArea: 'Abundance',
  },
  {
    id: 'deck-card-02',
    theme: 'Cellular Super-Immunity & Bio-Vitality',
    archetype: 'The Radiant Healer',
    paradigm: 'bio-electric-somatic',
    frequencyHz: 528,
    quantumText: 'Every cell in my biology resonates at pure 528Hz coherence. Mitochondrial vitality surges through my bloodstream; radiant health and indefatigable stamina are my baseline state now.',
    somaticAnchor: 'Deep diaphragmatic inhalation into the pelvic bowl. Expand the ribcage and visualize green-gold light charging every cell wall.',
    cadenceNotation: 'Cellular Wave Expansion • ~26 words • 17s spoken breath cycle',
    recommendedBpm: 4.5,
    focusArea: 'Vitality',
  },
  {
    id: 'deck-card-03',
    theme: 'Observer Command & Visionary Sovereignty',
    archetype: 'The Reality Commander',
    paradigm: 'observer-sovereignty',
    frequencyHz: 741,
    quantumText: 'From the unshakeable stillness of the conscious observer, I decree my vision into form. What I observe adapts to my command; ambiguity dissolves before my sovereign clarity.',
    somaticAnchor: 'Straighten spine into regal alignment. Drop shoulder blades downward and fix gaze softly on the horizon with zero internal doubt.',
    cadenceNotation: 'Steadfast Hierarchical Decreed Cadence • ~25 words • 15s spoken breath cycle',
    recommendedBpm: 6.0,
    focusArea: 'Sovereignty',
  },
  {
    id: 'deck-card-04',
    theme: 'Magnetic Relational Union',
    archetype: 'The Heartfield Harmonizer',
    paradigm: 'multiverse-convergence',
    frequencyHz: 639,
    quantumText: 'I bridge the quantum gap between hearts. My energetic signature vibrates with unconditional magnetism, pulling high-resonance soul alliances and profound love directly into my orbit.',
    somaticAnchor: 'Rest both hands on center chest. Sense warm electromagnetic toroidal waves radiating 360 degrees into the surrounding room.',
    cadenceNotation: 'Harmonic Bridge Meter • ~25 words • 16s spoken breath cycle',
    recommendedBpm: 5.5,
    focusArea: 'Love',
  },
  {
    id: 'deck-card-05',
    theme: 'Zero-Point Epiphany & Intuition',
    archetype: 'The Oracle of Knowing',
    paradigm: 'timeline-collapse',
    frequencyHz: 963,
    quantumText: 'I merge my awareness with pure source intelligence. Divine synchronicity directs every step; effortless insight and prophetic clarity illuminate my path before I ask.',
    somaticAnchor: 'Inhale through the crown of the head. Release tension in the jaw and forehead, allowing pure white light to descend into third eye.',
    cadenceNotation: 'Crown Influx Cadence • ~24 words • 14s spoken breath cycle',
    recommendedBpm: 4.5,
    focusArea: 'Intuition',
  },
  {
    id: 'deck-card-06',
    theme: 'Unstoppable Momentum & Market Domination',
    archetype: 'The High-Velocity Founder',
    paradigm: 'observer-sovereignty',
    frequencyHz: 888,
    quantumText: 'My ventures execute with ruthless elegance and geometric compounding. Every obstacle becomes accelerating propellant; global impact and effortless scale converge upon my vision.',
    somaticAnchor: 'Press feet firmly into the floor. Feel the kinetic earth charge rising through ankles, thighs, and solar core.',
    cadenceNotation: 'Dynamic Kinetic Surge • ~24 words • 15s spoken breath cycle',
    recommendedBpm: 6.0,
    focusArea: 'Impact',
  },
  {
    id: 'deck-card-07',
    theme: 'Deep Vagal Release & Sleep Surrender',
    archetype: 'The Subconscious Transmuter',
    paradigm: 'bio-electric-somatic',
    frequencyHz: 432,
    quantumText: 'I dissolve the final remnants of mental vigilance into the velvet ocean of sleep. While my body rests, my subconscious mind orchestrates the absolute crystallization of my highest desires.',
    somaticAnchor: 'Unclench tongue from the roof of mouth. Allow eyelids to feel extraordinarily heavy as breath naturally slows into deep resonance.',
    cadenceNotation: 'Somnolent Dissolution Rhythm • ~28 words • 18s spoken breath cycle',
    recommendedBpm: 4.5,
    focusArea: 'Vitality',
  },
  {
    id: 'deck-card-08',
    theme: 'Multiverse Quantum Leap',
    archetype: 'The Dimension Shifter',
    paradigm: 'multiverse-convergence',
    frequencyHz: 741,
    quantumText: 'I step across the probability manifold into the timeline where my greatest milestone has already transpired. The sensations, the victory, the sovereign peace are mine right now.',
    somaticAnchor: 'Take a slow, deep breath. On exhale, visualize physically stepping forward one full pace into the parallel quantum reality.',
    cadenceNotation: 'Parallel Manifold Shift • ~27 words • 16s spoken breath cycle',
    recommendedBpm: 5.5,
    focusArea: 'Sovereignty',
  },
  {
    id: 'deck-card-09',
    theme: 'Sovereign Wealth Acceleration',
    archetype: 'The Infinite Benefactor',
    paradigm: 'timeline-collapse',
    frequencyHz: 888,
    quantumText: 'Capital flows toward my consciousness like water down a steep incline. I am a sovereign custodian of immense abundance, deploying prosperity for transformational world impact.',
    somaticAnchor: 'Cup palms upward in open receiving posture on lap. Feel electric warmth tingling through fingertips and forearms.',
    cadenceNotation: 'Vortex Influx Rhythm • ~24 words • 15s spoken breath cycle',
    recommendedBpm: 5.5,
    focusArea: 'Abundance',
  },
  {
    id: 'deck-card-10',
    theme: 'Unshakable Emotional Peace',
    archetype: 'The Stillness Center',
    paradigm: 'observer-sovereignty',
    frequencyHz: 528,
    quantumText: 'Chaos swirls outside, but within my core lies unbreachable calm. I do not react; I generate reality from stillness. No external event can perturb my equilibrium.',
    somaticAnchor: 'Drop chin slightly, lengthen back of neck, and breathe smoothly into the lower belly with an extended 6-second exhale.',
    cadenceNotation: 'Centering Stillpoint Cadence • ~25 words • 16s spoken breath cycle',
    recommendedBpm: 5.0,
    focusArea: 'Sovereignty',
  },
  {
    id: 'deck-card-11',
    theme: 'Universal Love & Soul Telepathy',
    archetype: 'The Resonant Empath',
    paradigm: 'multiverse-convergence',
    frequencyHz: 639,
    quantumText: 'I dissolve all walls of past separation. My auric field broadcasts compassionate authority, inviting deep authenticity, mutual devotion, and crystalline understanding from every soul I meet.',
    somaticAnchor: 'Breathe in heart-centered gratitude. Feel a soft pink-emerald radiance expanding outward from sternum.',
    cadenceNotation: 'Electromagnetic Field Expansion • ~26 words • 16s spoken breath cycle',
    recommendedBpm: 5.5,
    focusArea: 'Love',
  },
  {
    id: 'deck-card-12',
    theme: 'Genius Flow & Transcendent Focus',
    archetype: 'The Master Polymath',
    paradigm: 'timeline-collapse',
    frequencyHz: 741,
    quantumText: 'Distraction has ceased to exist. I enter effortless hyper-focus where complex problems unweave themselves instantly. My intellect operates at peak diamond-grade clarity.',
    somaticAnchor: 'Touch index fingers to thumbs in classical mudra. Feel laser-focused electrical coherence between cerebral hemispheres.',
    cadenceNotation: 'Hyper-Focus Coherence Surge • ~23 words • 14s spoken breath cycle',
    recommendedBpm: 6.0,
    focusArea: 'Impact',
  },
];

/**
 * Deterministically generates today's 7-card manifestation deck from a date.
 */
export function getDailyDeck(date: Date = new Date(), count: number = 7): QuantumDeckCard[] {
  // Use date string as pseudo-random seed (e.g. 20261023)
  const seedString = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed * 31 + seedString.charCodeAt(i)) % 1000000;
  }

  // Shuffle pool deterministically using linear congruential generator
  const pool = [...MASTER_QUANTUM_DECK];
  const shuffled: QuantumDeckCard[] = [];

  for (let i = pool.length - 1; i >= 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const rnd = seed / 233280;
    const j = Math.floor(rnd * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Shuffles deck randomly for spontaneous on-demand manifestation sessions.
 */
export function getRandomDeck(count: number = 7): QuantumDeckCard[] {
  const pool = [...MASTER_QUANTUM_DECK];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/**
 * Converts a deck card into a complete QuantumAffirmationResult for immediate playback & library saving.
 */
export function deckCardToAffirmationResult(card: QuantumDeckCard): QuantumAffirmationResult {
  return {
    id: `quantum-deck-${card.id}-${Date.now().toString(36)}`,
    originalText: card.theme,
    quantumText: card.quantumText,
    paradigm: card.paradigm,
    frequencyHz: card.frequencyHz,
    somaticAnchor: card.somaticAnchor,
    linguisticShiftAnalysis: `Transmuted via ${card.paradigm} with resonance optimized for ${card.recommendedBpm} BPM heart rate variability coherence and ${card.frequencyHz}Hz Solfeggio carrier harmonic.`,
    cadenceNotation: card.cadenceNotation,
    estimatedDurationSeconds: 16,
    voiceName: 'Kore',
    createdAt: new Date().toISOString(),
  };
}
