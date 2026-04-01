#!/usr/bin/env npx tsx
// scripts/run-audio-pipeline.ts
// Runs Pipeline Step 1 (real audio analysis) against an actual song file.
//
// Usage: USE_DEMO_MODE=false npx tsx scripts/run-audio-pipeline.ts <path> [language] [song-title]
// Example: USE_DEMO_MODE=false npx tsx scripts/run-audio-pipeline.ts ~/Desktop/Magdaline/song.wav ht "M Te Renmen W"

import 'dotenv/config';

// Force demo mode off for this script
process.env.USE_DEMO_MODE = 'false';

import path from 'path';
import fs from 'fs';
import { analyzeAudio } from '../server/services/audio/audioService';
import type { SongLanguage } from '../shared/types/index';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function main() {
  const inputPath = process.argv[2];
  const language = (process.argv[3] as SongLanguage) || undefined;
  const songTitle = process.argv[4] || undefined;

  if (!inputPath) {
    console.error('Usage: npx tsx scripts/run-audio-pipeline.ts <audio-file> [ht|fr|en|es] [song-title]');
    process.exit(1);
  }

  const fullPath = path.resolve(inputPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }

  const sizeMB = (fs.statSync(fullPath).size / 1024 / 1024).toFixed(1);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  dbest.app — Pipeline Step 1: Audio Analysis`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  File:     ${path.basename(fullPath)}`);
  console.log(`  Size:     ${sizeMB} MB`);
  console.log(`  Language: ${language || 'auto-detect'}`);
  if (songTitle) console.log(`  Title:    ${songTitle}`);
  console.log(`${'═'.repeat(60)}\n`);

  const result = await analyzeAudio(fullPath, language, songTitle);

  // ── Transcription ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  TRANSCRIPTION`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  Detected language: ${result.detectedLanguage}`);
  console.log(`  Segments: ${result.transcription.segments.length}`);
  console.log(`  Duration: ${formatTime(result.durationSeconds)}`);
  console.log(`  BPM: ${result.bpm}\n`);

  console.log(`  Full text:\n`);
  console.log(`  ${result.transcription.text}\n`);

  console.log(`  Timestamped segments:\n`);
  for (const seg of result.transcription.segments) {
    console.log(`  [${formatTime(seg.start)} → ${formatTime(seg.end)}]  ${seg.text}`);
  }

  // ── Song Structure ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  SONG STRUCTURE`);
  console.log(`${'─'.repeat(60)}\n`);

  for (const section of result.songStructure) {
    const lyrics = section.lyrics ? `  "${section.lyrics.substring(0, 60)}${section.lyrics.length > 60 ? '...' : ''}"` : '';
    console.log(`  ${section.type.toUpperCase().padEnd(14)} [${formatTime(section.startTime)} → ${formatTime(section.endTime)}]  energy: ${section.energyLevel}/10${lyrics}`);
  }

  // ── Save results ──
  const outputPath = path.join(
    path.dirname(fullPath),
    `${path.basename(fullPath, path.extname(fullPath))}_analysis.json`
  );

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Saved to: ${outputPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
