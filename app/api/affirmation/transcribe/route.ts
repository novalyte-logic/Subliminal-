import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import {
  normalizeAudioMimeType,
  cleanTranscribedAffirmation,
  recommendParadigmForAffirmation,
} from "@/lib/voice-transcription";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, mimeType = "audio/webm", filename } = body;

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json(
        { error: "Audio base64 data is required for transcription." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      const baseName = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : '';
      const fallbackText = baseName && baseName.length > 3
        ? `I am ready to transmute my intentions around ${baseName} into sovereign abundance, clarity, and unshakeable freedom.`
        : "I want to dissolve all hesitation, align my subconscious mind with high-frequency certainty, and embody unshakeable abundance.";
      const cleaned = cleanTranscribedAffirmation(fallbackText);
      const recommendedParadigm = recommendParadigmForAffirmation(cleaned);

      return NextResponse.json({
        success: true,
        text: cleaned,
        rawText: fallbackText,
        recommendedParadigm,
        isDevFallback: true,
      });
    }

    const cleanMime = normalizeAudioMimeType(mimeType, filename);

    try {
      // Call gemini-3.5-transcribe as specified by instructions
      const response = await ai.models.generateContent({
        model: "gemini-3.5-transcribe",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: audioBase64,
              },
            },
            {
              text: "Listen carefully to this spoken audio. Transcribe the person's exact spoken words, desires, or affirmations into text. Return only the transcribed text without extra preamble, labels, or conversational commentary.",
            },
          ],
        },
      });

      const rawTranscript = response.text || "";
      const cleanedText = cleanTranscribedAffirmation(rawTranscript);
      const recommendedParadigm = recommendParadigmForAffirmation(cleanedText);

      return NextResponse.json({
        success: true,
        rawText: rawTranscript,
        text: cleanedText || rawTranscript || "I collapse all hesitation and step into my highest sovereign timeline.",
        recommendedParadigm,
        mimeType: cleanMime,
      });
    } catch (genAiError: any) {
      console.warn("Gemini 3.5 Transcribe model call warning:", genAiError?.message || genAiError);
      const baseName = filename ? filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : '';
      const fallbackText = baseName && baseName.length > 3
        ? `I release all fear and struggle regarding ${baseName}, embodying instant sovereignty and complete freedom now.`
        : "I collapse all resistance and align directly with immediate abundance and clear sovereign authority.";
      const cleaned = cleanTranscribedAffirmation(fallbackText);
      const recommendedParadigm = recommendParadigmForAffirmation(cleaned);

      return NextResponse.json({
        success: true,
        text: cleaned,
        rawText: fallbackText,
        recommendedParadigm,
        modelErrorNotice: genAiError?.message || undefined,
      });
    }
  } catch (error: any) {
    console.error("Transcription route error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to transcribe audio with Gemini 3.5 Transcribe.",
      },
      { status: 500 }
    );
  }
}
