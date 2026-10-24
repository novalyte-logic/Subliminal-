import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import {
  transmuteDeterministically,
  analyzeRhythmicCadence,
  QuantumParadigmId,
  SOLFEGGIO_FREQUENCIES,
} from "@/lib/quantum-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      originalText,
      paradigm = "timeline-collapse",
      frequencyHz = 528,
      emotionalMultiplier = "Sovereign Inevitability",
      mood = "motivated",
      intensity = "moderate",
    } = body;

    if (!originalText || typeof originalText !== "string" || !originalText.trim()) {
      return NextResponse.json(
        { error: "Affirmation text is required." },
        { status: 400 }
      );
    }

    const freqObj =
      SOLFEGGIO_FREQUENCIES.find((f) => f.hz === Number(frequencyHz)) ||
      SOLFEGGIO_FREQUENCIES[1];

    // If no GEMINI_API_KEY is configured in the environment, use deterministic transmuter
    if (!process.env.GEMINI_API_KEY) {
      const fallbackResult = transmuteDeterministically(
        originalText,
        paradigm as QuantumParadigmId,
        freqObj.hz
      );
      return NextResponse.json({ ...fallbackResult, source: "deterministic" });
    }

    const prompt = `
You are the Novalyte AI Quantum Affirmation Engine.
The user provided a raw, traditional affirmation or manifestation desire:
"${originalText}"

Target Frequency: ${freqObj.hz} Hz (${freqObj.name} - ${freqObj.harmonicPurpose})
Quantum Paradigm: ${paradigm}
Emotional Multiplier: ${emotionalMultiplier}
Current Mood: ${mood}
Intensity: ${intensity}

TASK:
Transmute this affirmation into a high-impact "Quantum Leap Language" affirmation, tailoring it specifically to shift the user's current mood (${mood}) to a higher-frequency state, with ${intensity} intensity.

Linguistic Requirements:
1. QUANTUM CERTAINTY: Eliminate ALL passive, future, or yearning phrasing ("I want", "I hope", "I will", "I am trying", "I wish"). Replace with present-tense quantum collapse, zero-point certainty, or sovereign observer decrees.
2. HIGH-FREQUENCY VOCABULARY: Weave in high-resonance bio-energetic concepts: electromagnetic coherence, zero-point field, cellular crystallization, mitochondrial vitality, unshakeable sovereignty, timeline lock.
3. RHYTHMIC CADENCE: Format with balanced rhythmic breath pauses. It should sound like a resonant, rhythmic incantation when spoken aloud.
4. SOMATIC ANCHOR: Provide a concrete, 1-2 sentence physical bodily sensation and breath practice to anchor this affirmation.
5. LINGUISTIC SHIFT ANALYSIS: 1-2 sentences explaining specifically why this Quantum Leap phrasing bypasses subconscious cognitive friction/skepticism 10x faster than traditional affirmations, specifically addressing the user's mood (${mood}).

Respond ONLY with valid JSON in this exact structure:
{
  "quantumText": "The transmuted high-frequency quantum leap affirmation text",
  "somaticAnchor": "Concrete breath cue and physical sensation instruction",
  "linguisticShiftAnalysis": "Explanation of psychological/quantum shift",
  "meterStyle": "e.g. Resonant Iambic Surge or Sovereign Harmonic Cadence"
}
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const responseText = response.text || "";
      const parsed = JSON.parse(responseText.trim());

      const cadence = analyzeRhythmicCadence(parsed.quantumText || originalText);

      return NextResponse.json({
        id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        originalText,
        quantumText: parsed.quantumText,
        paradigm,
        frequencyHz: freqObj.hz,
        somaticAnchor: parsed.somaticAnchor,
        linguisticShiftAnalysis: parsed.linguisticShiftAnalysis,
        cadenceNotation: `Cadence: ${parsed.meterStyle || cadence.meterStyle} • ~${cadence.wordCount} words • ${cadence.estimatedDurationSeconds}s spoken cycle`,
        estimatedDurationSeconds: cadence.estimatedDurationSeconds,
        voiceName: "Kore",
        createdAt: new Date().toISOString(),
        source: "gemini-3.8-flash",
      });
    } catch (genError) {
      console.warn("Gemini generation failed, using high-fidelity deterministic engine:", genError);
      const fallbackResult = transmuteDeterministically(
        originalText,
        paradigm as QuantumParadigmId,
        freqObj.hz
      );
      return NextResponse.json({ ...fallbackResult, source: "deterministic-fallback" });
    }
  } catch (error) {
    console.error("Transmute error:", error);
    return NextResponse.json(
      { error: "Internal server error during affirmation transmutation." },
      { status: 500 }
    );
  }
}
