'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  UploadCloud,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  ArrowRight,
  Radio,
  Copy,
} from 'lucide-react';
import {
  isValidAudioMimeType,
  isAudioFileSizeWithinLimit,
  formatAudioDuration,
  normalizeAudioMimeType,
} from '@/lib/voice-transcription';
import { QuantumParadigmId } from '@/lib/quantum-engine';

interface VoiceAffirmationUploaderProps {
  onTranscribeComplete: (
    text: string,
    recommendedParadigm?: QuantumParadigmId,
    autoTransmute?: boolean
  ) => void;
  className?: string;
}

export const VoiceAffirmationUploader: React.FC<VoiceAffirmationUploaderProps> = ({
  onTranscribeComplete,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Data State
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioFilename, setAudioFilename] = useState<string>('voice-recording.webm');
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [audioFileSize, setAudioFileSize] = useState<number>(0);

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Transcription State
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [recommendedParadigm, setRecommendedParadigm] = useState<QuantumParadigmId | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopiedTranscription, setIsCopiedTranscription] = useState(false);
  const transcriptionBoxRef = useRef<HTMLDivElement | null>(null);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [audioUrl]);

  // Start Mic Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setTranscribedText(null);
    setRecommendedParadigm(null);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage('Microphone recording is not supported in this browser. Please use the Upload tab.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else {
          mimeType = '';
        }
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const actualMime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setAudioMimeType(actualMime);
        setAudioFileSize(blob.size);
        setAudioFilename(`voice-incantation-${Date.now()}.${actualMime.includes('mp4') ? 'm4a' : 'webm'}`);

        // Stop all audio tracks to release microphone hardware light
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 120) {
            // Cap recording at 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. Please check your browser permissions, or upload a recorded audio file.');
      } else {
        setErrorMessage(err.message || 'Unable to access microphone.');
      }
    }
  };

  // Stop Mic Recording
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setTranscribedText(null);
    setRecommendedParadigm(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidAudioMimeType(file.type, file.name)) {
      setErrorMessage('Please upload a valid audio file (.mp3, .wav, .m4a, .webm, .ogg).');
      return;
    }

    if (!isAudioFileSizeWithinLimit(file.size, 25)) {
      setErrorMessage('Audio file size exceeds the 25MB limit.');
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const url = URL.createObjectURL(file);
    setAudioBlob(file);
    setAudioUrl(url);
    setAudioFilename(file.name);
    setAudioMimeType(file.type || normalizeAudioMimeType('', file.name));
    setAudioFileSize(file.size);
  };

  // Convert Blob to Base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Strip data:audio/xxx;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Transcribe with Gemini 3.5 Transcribe
  const handleTranscribe = async (autoTransmute: boolean = false) => {
    if (!audioBlob) {
      setErrorMessage('Please record or upload an audio file first.');
      return;
    }

    setIsTranscribing(true);
    setErrorMessage(null);

    try {
      const base64Audio = await blobToBase64(audioBlob);

      const res = await fetch('/api/affirmation/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          mimeType: audioMimeType,
          filename: audioFilename,
        }),
      });

      const data = await res.json();

      if (!res.ok || (data.error && !data.text)) {
        throw new Error(data.error || 'Transcription failed');
      }

      const text = data.text || data.rawText || '';
      if (text) {
        setTranscribedText(text);
        if (data.recommendedParadigm) {
          setRecommendedParadigm(data.recommendedParadigm);
        }
        onTranscribeComplete(text, data.recommendedParadigm, autoTransmute);
        setTimeout(() => {
          transcriptionBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
      } else {
        throw new Error('No spoken words could be extracted from audio.');
      }
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'Failed to transcribe audio with Gemini 3.5 Transcribe.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Audio Playback Preview
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleReset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setTranscribedText(null);
    setRecommendedParadigm(null);
    setErrorMessage(null);
    setIsRecording(false);
    setIsPlayingAudio(false);
    setRecordingSeconds(0);
  };

  return (
    <div
      className={`bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E9E7] shadow-[0_1px_3px_rgba(16,24,40,0.04)] ${className}`}
    >
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAFBF5] border border-[#2DD4BF]/40 flex items-center justify-center text-[#009B87]">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#171D27] flex items-center space-x-1.5">
              <span>Personal Voice Quantum Ingestion</span>
              <span className="text-[10px] font-semibold text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.5 rounded uppercase tracking-wider">
                Gemini 3.5 Transcribe
              </span>
            </h3>
            <p className="text-[12px] text-[#626B78]">
              Speak or upload your raw desires; Gemini transcribes and bridges into Quantum Leap language.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-[#FAF9F6] p-1 rounded-xl border border-[#EEF1EF] text-[12px] font-semibold text-[#626B78] shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'record'
                ? 'bg-white text-[#009B87] shadow-2xs font-bold'
                : 'hover:text-[#171D27]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-[#009B87] shadow-2xs font-bold'
                : 'hover:text-[#171D27]'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#EEF1EF] transition-all">
        {/* TAB 1: RECORD VOICE */}
        {activeTab === 'record' && (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {isRecording ? (
              <div className="flex flex-col items-center space-y-3">
                {/* Live pulsing microphone aura */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" />
                  <div className="relative w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md animate-pulse">
                    <Mic className="w-6 h-6" />
                  </div>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[18px] font-bold font-mono text-[#171D27]">
                    {formatAudioDuration(recordingSeconds)}
                  </span>
                  <span className="text-[11px] text-red-600 font-medium block">
                    Recording personal voice affirmation... (Max 2:00)
                  </span>
                </div>

                {/* Animated simulated waveform */}
                <div className="flex items-center space-x-1 py-1">
                  {[12, 24, 38, 20, 44, 28, 16, 32, 40, 18, 30, 14].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-[#009B87] rounded-full animate-bounce"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${(i * 0.1).toFixed(1)}s`,
                        animationDuration: '0.8s',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={stopRecording}
                  className="mt-2 px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[13px] shadow-sm flex items-center space-x-2 transition-all transform active:scale-95"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop & Prepare Audio</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={startRecording}
                  className="w-14 h-14 rounded-full bg-[#EAFBF5] hover:bg-[#009B87] text-[#009B87] hover:text-white border border-[#2DD4BF]/50 flex items-center justify-center shadow-sm hover:shadow-md transition-all transform active:scale-95 group"
                  aria-label="Start recording your personal voice"
                >
                  <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                  <p className="text-[13px] font-semibold text-[#171D27]">
                    Click to Record Your Spoken Words
                  </p>
                  <p className="text-[11px] text-[#626B78] mt-0.5">
                    Speak naturally. Say what you want, what worries you, or what you intend to manifest.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD AUDIO */}
        {activeTab === 'upload' && (
          <div className="py-3">
            <label
              htmlFor="audio-file-input"
              className="border-2 border-dashed border-[#E5E9E7] hover:border-[#009B87] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors group"
            >
              <UploadCloud className="w-8 h-8 text-[#89919B] group-hover:text-[#009B87] transition-colors mb-2" />
              <span className="text-[13px] font-semibold text-[#171D27] group-hover:text-[#009B87]">
                Click or drag & drop an audio file
              </span>
              <span className="text-[11px] text-[#89919B] mt-1">
                Supports MP3, WAV, M4A, WEBM, OGG (Max 25MB)
              </span>
              <input
                id="audio-file-input"
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Audio Player Preview If Audio Ready */}
        {audioUrl && !isRecording && (
          <div className="mt-3 pt-3 border-t border-[#EEF1EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <button
                onClick={togglePlayAudio}
                className="w-9 h-9 rounded-full bg-[#009B87] hover:bg-[#007F73] text-white flex items-center justify-center shrink-0 shadow-2xs transition-all"
                aria-label={isPlayingAudio ? 'Pause preview' : 'Play recorded voice'}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
              <div className="min-w-0">
                <span className="text-[12px] font-semibold text-[#171D27] truncate block">
                  {audioFilename}
                </span>
                <span className="text-[11px] text-[#89919B]">
                  {(audioFileSize / (1024 * 1024)).toFixed(2)} MB • Ready for Gemini 3.5 Transcribe
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleReset}
                className="p-2 text-[#89919B] hover:text-[#171D27] hover:bg-[#F3FCF8] rounded-lg transition-colors text-xs"
                title="Discard audio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleTranscribe(false)}
                disabled={isTranscribing}
                className="px-3.5 py-1.5 rounded-lg bg-white border border-[#009B87] text-[#009B87] hover:bg-[#EAFBF5] text-[12px] font-semibold transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isTranscribing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Transcribe Audio</span>
              </button>

              <button
                onClick={() => handleTranscribe(true)}
                disabled={isTranscribing}
                className="px-4 py-1.5 rounded-lg bg-[#009B87] hover:bg-[#007F73] text-white text-[12px] font-semibold transition-all shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isTranscribing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Transcribe & Quantum Leap</span>
              </button>
            </div>

            {/* Hidden HTML audio element for playback preview */}
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              onEnded={() => setIsPlayingAudio(false)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Prominent Transcribed Voice Inspection Console */}
      {transcribedText && (
        <div
          ref={transcriptionBoxRef}
          className="mt-4 p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#2DD4BF] shadow-[0_4px_16px_rgba(0,155,135,0.08)] animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAFBF5] text-[#009B87] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#171D27] flex items-center space-x-1.5">
                  <span>Decoded Voice Transcription</span>
                  <span className="text-[10px] font-semibold text-[#009B87] bg-[#EAFBF5] px-1.5 py-0.2 rounded font-mono">
                    Gemini 3.5 Transcribe
                  </span>
                </h4>
                <p className="text-[12px] text-[#626B78]">
                  Verified spoken words from your audio recording
                </p>
              </div>
            </div>

            {recommendedParadigm && (
              <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                <span className="text-[11px] text-[#626B78] font-medium">Optimal Resonance:</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAFBF5] text-[#005F58] border border-[#2DD4BF]/40 capitalize">
                  {recommendedParadigm.replace('-', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Large Visible Editable Transcription Box */}
          <div className="relative">
            <textarea
              rows={3}
              value={transcribedText}
              onChange={(e) => {
                const val = e.target.value;
                setTranscribedText(val);
                onTranscribeComplete(val, recommendedParadigm || undefined, false);
              }}
              aria-label="Transcribed spoken words"
              className="w-full p-4 rounded-xl border border-[#2DD4BF]/60 bg-[#F3FCF8]/60 text-[#171D27] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#009B87]/40 focus:border-[#009B87] transition-all resize-none shadow-2xs leading-relaxed"
            />
            <span className="absolute bottom-3 right-3 text-[11px] text-[#89919B] pointer-events-none">
              {transcribedText.length} characters
            </span>
          </div>

          {/* Action Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[#EEF1EF]">
            <div className="flex items-center space-x-2">
              {/* Copy button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(transcribedText);
                  setIsCopiedTranscription(true);
                  setTimeout(() => setIsCopiedTranscription(false), 2000);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#E5E9E7] hover:border-[#009B87] bg-white text-[#626B78] hover:text-[#009B87] text-[12px] font-semibold transition-all flex items-center space-x-1.5"
                title="Copy transcribed text to clipboard"
              >
                {isCopiedTranscription ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              {/* Push into main transmuter button */}
              <button
                onClick={() => {
                  onTranscribeComplete(transcribedText, recommendedParadigm || undefined, false);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#2DD4BF]/50 bg-[#EAFBF5] text-[#009B87] hover:bg-[#2DD4BF]/20 text-[12px] font-semibold transition-all flex items-center space-x-1.5"
                title="Populate into Transmuter"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Applied to Transmuter</span>
              </button>
            </div>

            {/* Direct Instant Quantum Leap Transmute Button */}
            <button
              onClick={() => onTranscribeComplete(transcribedText, recommendedParadigm || undefined, true)}
              className="px-4 py-1.5 rounded-xl bg-[#009B87] hover:bg-[#007F73] text-white text-[12px] font-semibold transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5 transform active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Transmute into Quantum Affirmation & TTS</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
