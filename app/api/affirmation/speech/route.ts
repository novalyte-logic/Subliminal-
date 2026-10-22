import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voiceName = "Kore",
      style = "Rhythmic, deep, confident quantum incantation with steady cadence, hypnotic resonance, and clear sovereign power",
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

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: text.trim(),
                speechMetadata: {
                  style,
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

      const base64Audio = audioPart?.inlineData?.data;

      if (!base64Audio) {
        return NextResponse.json(
          {
            error: "No audio generated from model.",
            fallbackToClientAudio: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json({
        audioBase64: base64Audio,
        mimeType: "audio/wav",
        voice: selectedVoice,
      });
    } catch (ttsError: any) {
      console.warn("Gemini TTS synthesis call encountered:", ttsError?.message || ttsError);
      return NextResponse.json(
        {
          error: ttsError?.message || "TTS service unavailable",
          fallbackToClientAudio: true,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Speech route error:", error);
    return NextResponse.json(
      { error: "Internal server error in speech route." },
      { status: 500 }
    );
  }
}
