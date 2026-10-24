import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voiceName = "Kore",
      style = "Rhythmic, deep, confident quantum incantation with steady cadence, hypnotic resonance, and clear sovereign power",
      amplified = false,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for spoken audio synthesis." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not set. Switching to high-fidelity client Web Audio synthesis.",
          fallbackToClientAudio: true,
        },
        { status: 200 }
      );
    }

    // Supported voices: Puck, Charon, Kore, Fenrir, Zephyr
    const validVoices = ["Kore", "Zephyr", "Fenrir", "Puck", "Charon"];
    const selectedVoice = validVoices.includes(voiceName) ? voiceName : "Kore";

    // Build human-like speech styling instructions based on persona
    const voiceStyles: Record<string, string> = {
      Kore: "Warm, deeply soothing, authentic natural human voice with gentle breath pacing, warm vocal resonance, subtle intimacy, and zero robotic monotone. Speaks with calm, serene presence.",
      Zephyr: "Clear, grounded, authentic human male voice with natural vocal cadence, calm certainty, warm resonance, and conversational human warmth.",
      Fenrir: "Rich, deep, resonant human male voice with grounded gravitas, slow meditative breathing, authentic warm timbre, and sovereign presence.",
      Puck: "Inspiring, bright, natural human voice with expressive nuance, uplifting cadence, and genuine human warmth.",
      Charon: "Wise, ancient, deeply grounded human voice with warm acoustic texture, authentic breath cadences, and calm authority.",
    };

    const naturalStyle = style || voiceStyles[selectedVoice] || voiceStyles.Kore;
    const finalStyle = amplified 
      ? `Extremely powerful, high-impact, amplified volume, intense resonance, commanding sovereign authority. ${naturalStyle}`
      : naturalStyle;

    // Enhance text with natural human breathing pauses between clauses for maximum realism
    let formattedText = text.trim();
    if (!formattedText.includes("<breath>") && formattedText.includes(".")) {
      // Add subtle natural breath marker between sentences for authentic human cadence
      formattedText = formattedText.replace(/\.\s+/g, ". <breath> ");
    }

    // Try flagship gemini-3.8-flash-tts first for most realistic human voice, fallback to gemini-3.8-flash-lite-tts
    const ttsModels = ["gemini-3.8-flash-tts", "gemini-3.8-flash-lite-tts"];
    let base64Audio: string | undefined = undefined;
    let usedModel = "gemini-3.8-flash-tts";
    let lastError: any = null;

    for (const modelName of ttsModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: formattedText,
                  speechMetadata: {
                    style: finalStyle,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: selectedVoice },
              },
            },
          },
        });

        const audioPart = response.candidates?.[0]?.content?.parts?.find(
          (p) => p.inlineData && p.inlineData.data
        );

        if (audioPart?.inlineData?.data) {
          base64Audio = audioPart.inlineData.data;
          usedModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`TTS attempt with ${modelName} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!base64Audio) {
      return NextResponse.json(
        {
          error: lastError?.message || "No audio generated from model.",
          fallbackToClientAudio: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      audioBase64: base64Audio,
      mimeType: "audio/wav",
      voice: selectedVoice,
      model: usedModel,
    });
  } catch (error) {
    console.error("Speech route error:", error);
    return NextResponse.json(
      { error: "Internal server error in speech route." },
      { status: 500 }
    );
  }
}
