// server/services/audio/audioService.ts
// Pipeline Step 1: Audio Processing
// - Compress WAV→MP3 (fix Whisper 25MB limit)
// - Transcribe with Whisper (language-aware for Kreyòl/French/English/Spanish)
// - Detect BPM and beat markers
// - Map song structure (intro/verse/chorus/bridge/outro)

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { v4 as uuid } from 'uuid';
import { logger } from '../../middleware/logger.js';
import { demoAudioAnalysis } from './demoData.js';
import type {
  AudioAnalysis,
  SongLanguage,
  TranscriptionResult,
  SongSection,
} from '../../../shared/types/index.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

// ============================================================
// Main entry point
// ============================================================

export async function analyzeAudio(
  songPath: string,
  languageOverride?: SongLanguage
): Promise<AudioAnalysis> {
  if (isDemoMode()) {
    logger.info('[DEMO] Returning mock audio analysis');
    return demoAudioAnalysis;
  }

  logger.info(`Analyzing audio: ${songPath}`);

  // Step 1a: Compress for Whisper (handles the 38MB WAV problem)
  const compressedPath = await compressForWhisper(songPath);

  // Step 1b: Transcribe with Whisper
  const transcription = await transcribeWithWhisper(compressedPath, languageOverride);

  // Step 1c: Detect BPM and duration
  const { bpm, durationSeconds } = await detectBpmAndDuration(songPath);

  // Step 1d: Generate beat markers from BPM
  const beatMarkers = generateBeatMarkers(bpm, durationSeconds);

  // Step 1e: Map song structure from transcription segments
  const songStructure = mapSongStructure(transcription.segments, durationSeconds);

  // Cleanup compressed file
  await fs.unlink(compressedPath).catch(() => {});

  logger.info(`Audio analysis complete: ${bpm} BPM, ${transcription.segments.length} segments, ${songStructure.length} sections`);

  return {
    transcription,
    bpm,
    beatMarkers,
    songStructure,
    durationSeconds,
    detectedLanguage: transcription.language,
  };
}

// ============================================================
// Compress audio for Whisper API (25MB limit)
// ============================================================

export async function compressForWhisper(inputPath: string): Promise<string> {
  const outputPath = path.join(
    path.dirname(inputPath),
    `${uuid()}_compressed.mp3`
  );

  logger.info(`Compressing ${inputPath} → ${outputPath}`);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)       // Mono — Whisper converts internally anyway
      .audioFrequency(16000)  // 16kHz — Whisper's internal sample rate
      .audioBitrate('48k')    // 48kbps — small file, no quality loss for transcription
      .format('mp3')
      .on('end', async () => {
        const stats = await fs.stat(outputPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(1);
        logger.info(`Compressed: ${sizeMB}MB (limit: 25MB)`);
        resolve(outputPath);
      })
      .on('error', (err) => {
        logger.error(`FFmpeg compression failed: ${err.message}`);
        reject(new Error(`Audio compression failed: ${err.message}`));
      })
      .save(outputPath);
  });
}

// ============================================================
// Whisper transcription (language-aware)
// ============================================================

async function transcribeWithWhisper(
  audioPath: string,
  languageOverride?: SongLanguage
): Promise<TranscriptionResult> {
  logger.info(`Transcribing with Whisper (language: ${languageOverride || 'auto-detect'})`);

  const fileStream = await fs.readFile(audioPath);
  const file = new File([fileStream], path.basename(audioPath), { type: 'audio/mpeg' });

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    ...(languageOverride ? { language: languageOverride } : {}),
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  const segments = (response as any).segments?.map((seg: any) => ({
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  })) || [];

  const detectedLanguage = (response as any).language || languageOverride || 'en';

  // Map Whisper language codes to our SongLanguage type
  const languageMap: Record<string, SongLanguage> = {
    'haitian creole': 'ht',
    'haitian': 'ht',
    'ht': 'ht',
    'french': 'fr',
    'fr': 'fr',
    'english': 'en',
    'en': 'en',
    'spanish': 'es',
    'es': 'es',
  };

  const normalizedLanguage = languageMap[detectedLanguage.toLowerCase()] || 'en';

  logger.info(`Transcribed: ${segments.length} segments, detected language: ${normalizedLanguage}`);

  return {
    text: response.text,
    language: normalizedLanguage,
    segments,
  };
}

// ============================================================
// BPM detection using FFmpeg + analysis
// ============================================================

async function detectBpmAndDuration(
  audioPath: string
): Promise<{ bpm: number; durationSeconds: number }> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioPath, (err, metadata) => {
      if (err) {
        logger.error(`FFprobe failed: ${err.message}`);
        reject(new Error(`BPM detection failed: ${err.message}`));
        return;
      }

      const durationSeconds = metadata.format.duration || 0;

      // Basic BPM estimation from audio characteristics
      // For production, consider using essentia.js or aubio
      // Default to 120 BPM and let Claude refine from genre analysis
      const bpm = 120; // TODO: Replace with actual BPM detection library

      logger.info(`Duration: ${durationSeconds.toFixed(1)}s, BPM: ${bpm}`);
      resolve({ bpm, durationSeconds });
    });
  });
}

// ============================================================
// Beat markers from BPM
// ============================================================

function generateBeatMarkers(bpm: number, durationSeconds: number): number[] {
  const beatInterval = 60 / bpm;
  const markers: number[] = [];

  for (let t = 0; t < durationSeconds; t += beatInterval) {
    markers.push(Math.round(t * 1000) / 1000); // Round to ms
  }

  return markers;
}

// ============================================================
// Song structure mapping
// ============================================================

function mapSongStructure(
  segments: TranscriptionResult['segments'],
  durationSeconds: number
): SongSection[] {
  // Basic structure detection based on segment patterns
  // Claude will refine this in the Lyric Intelligence step
  const sections: SongSection[] = [];

  if (segments.length === 0) {
    // Instrumental track — single section
    return [{
      type: 'instrumental',
      startTime: 0,
      endTime: durationSeconds,
      energyLevel: 5,
    }];
  }

  // Simple heuristic: divide into sections based on gaps and repetition
  // The real intelligence comes from Claude in Step 2
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];

  // Intro: any silence before first lyrics
  if (firstSegment.start > 2) {
    sections.push({
      type: 'intro',
      startTime: 0,
      endTime: firstSegment.start,
      energyLevel: 3,
    });
  }

  // Main body: chunk segments into ~30s sections
  // (Claude will properly identify verse/chorus/bridge in Step 2)
  const chunkDuration = 30;
  let currentStart = firstSegment.start;
  let sectionIndex = 0;
  const sectionTypes: SongSection['type'][] = ['verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus'];

  while (currentStart < lastSegment.end) {
    const currentEnd = Math.min(currentStart + chunkDuration, lastSegment.end);
    const sectionLyrics = segments
      .filter(s => s.start >= currentStart && s.end <= currentEnd)
      .map(s => s.text)
      .join(' ');

    sections.push({
      type: sectionTypes[sectionIndex % sectionTypes.length],
      startTime: currentStart,
      endTime: currentEnd,
      lyrics: sectionLyrics || undefined,
      energyLevel: 5 + (sectionIndex % 3), // Rough energy curve
    });

    currentStart = currentEnd;
    sectionIndex++;
  }

  // Outro: any remaining time after last lyrics
  if (lastSegment.end < durationSeconds - 2) {
    sections.push({
      type: 'outro',
      startTime: lastSegment.end,
      endTime: durationSeconds,
      energyLevel: 3,
    });
  }

  return sections;
}
