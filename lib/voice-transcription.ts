import { QuantumParadigmId } from './quantum-engine';

/**
 * Standard supported audio MIME types for upload and recording.
 */
export const SUPPORTED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/webm;codecs=opus',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/aac',
  'audio/flac',
];

/**
 * Checks whether the given MIME type or file extension is a valid audio input.
 */
export function isValidAudioMimeType(mimeType: string, filename?: string): boolean {
  if (!mimeType && !filename) return false;

  const normalizedMime = (mimeType || '').toLowerCase().trim();
  if (normalizedMime && SUPPORTED_AUDIO_MIME_TYPES.some((m) => normalizedMime.startsWith(m))) {
    return true;
  }

  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext && ['mp3', 'wav', 'm4a', 'webm', 'ogg', 'aac', 'flac'].includes(ext)) {
      return true;
    }
  }

  return false;
}

/**
 * Normalizes browser mimeType to standard clean format for Gemini API.
 */
export function normalizeAudioMimeType(mimeType: string, filename?: string): string {
  const lower = (mimeType || '').toLowerCase();
  if (lower.includes('webm')) return 'audio/webm';
  if (lower.includes('wav')) return 'audio/wav';
  if (lower.includes('mp3') || lower.includes('mpeg')) return 'audio/mp3';
  if (lower.includes('m4a') || lower.includes('mp4')) return 'audio/m4a';
  if (lower.includes('ogg')) return 'audio/ogg';
  if (lower.includes('flac')) return 'audio/flac';

  if (filename) {
    const ext = filename.toLowerCase().split('.').pop();
    if (ext === 'mp3') return 'audio/mp3';
    if (ext === 'wav') return 'audio/wav';
    if (ext === 'm4a') return 'audio/m4a';
    if (ext === 'ogg') return 'audio/ogg';
    if (ext === 'webm') return 'audio/webm';
  }

  return 'audio/webm';
}

/**
 * Validates audio file size against maximum megabytes (default 25MB).
 */
export function isAudioFileSizeWithinLimit(bytes: number, maxMegabytes: number = 25): boolean {
  if (bytes <= 0) return false;
  return bytes <= maxMegabytes * 1024 * 1024;
}

/**
 * Formats duration in seconds to M:SS or MM:SS format.
 */
export function formatAudioDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Cleans and formats raw transcribed spoken affirmations by stripping
 * verbal filler hesitations (e.g., um, uh, ah) while preserving core intent.
 */
export function cleanTranscribedAffirmation(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let cleaned = rawText.trim();

  // Remove quotes if the transcription model wrapped the output in quotes
  cleaned = cleaned.replace(/^["'“](.*)["'”]$/, '$1').trim();

  // Remove common speech filler words at word boundaries (case-insensitive) along with trailing punctuation
  const fillerRegex = /\b(um|uh|er|ah|hmm|like,?\s+you\s+know|you\s+know)\b[,;]?/gi;
  cleaned = cleaned.replace(fillerRegex, ' ');

  // Clean leading punctuation like commas, dashes, colons left behind
  cleaned = cleaned.replace(/^[,;:\s-]+/, '').trim();

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();

  if (!cleaned) return '';

  // Ensure first character is uppercase
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  // Ensure reasonable ending punctuation
  if (!/[.!?]$/.test(cleaned)) {
    cleaned += '.';
  }

  return cleaned;
}

/**
 * Recommends an optimal Quantum Leap paradigm based on the semantic resonance
 * of the user's spoken words.
 */
export function recommendParadigmForAffirmation(text: string): QuantumParadigmId {
  const lower = (text || '').toLowerCase();

  // Bio-Electric Somatic Encoding: physiological, cellular, bodily health
  if (
    lower.includes('body') ||
    lower.includes('heal') ||
    lower.includes('cell') ||
    lower.includes('health') ||
    lower.includes('pain') ||
    lower.includes('energy') ||
    lower.includes('vitality') ||
    lower.includes('fatigue') ||
    lower.includes('nerve') ||
    lower.includes('breath')
  ) {
    return 'bio-electric-somatic';
  }

  // Multiverse Convergence: identity, highest version, quantum leaps, parallel timelines
  if (
    lower.includes('version of me') ||
    lower.includes('parallel') ||
    lower.includes('quantum') ||
    lower.includes('dimension') ||
    lower.includes('multiverse') ||
    lower.includes('leap') ||
    lower.includes('future self') ||
    lower.includes('soulmate')
  ) {
    return 'multiverse-convergence';
  }

  // Timeline Collapse: collapsing delays, speed, immediate wealth, time, zero-point
  if (
    lower.includes('waiting') ||
    lower.includes('delay') ||
    lower.includes('soon') ||
    lower.includes('eventually') ||
    lower.includes('hurry') ||
    lower.includes('speed') ||
    lower.includes('now') ||
    lower.includes('money') ||
    lower.includes('finance') ||
    lower.includes('wealth') ||
    lower.includes('debt')
  ) {
    return 'timeline-collapse';
  }

  // Default to Observer Sovereignty for personal power, clarity, mastery, decrees
  return 'observer-sovereignty';
}
