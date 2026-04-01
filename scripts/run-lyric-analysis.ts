#!/usr/bin/env npx tsx
// scripts/run-lyric-analysis.ts
// Runs Pipeline Step 2 (Lyric Intelligence) against a saved audio analysis JSON.
//
// Usage: npx tsx scripts/run-lyric-analysis.ts <analysis.json>
// Example: npx tsx scripts/run-lyric-analysis.ts ~/Desktop/Magdaline/..._analysis.json

import 'dotenv/config';
process.env.USE_DEMO_MODE = 'false';

import fs from 'fs';
import path from 'path';
import { analyzeLyrics } from '../server/services/intelligence/lyricAnalysis';
import type { AudioAnalysis } from '../shared/types/index';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error('Usage: npx tsx scripts/run-lyric-analysis.ts <audio-analysis.json>');
    process.exit(1);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set in .env');
    process.exit(1);
  }

  const fullPath = path.resolve(inputPath);
  const audioAnalysis: AudioAnalysis = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  dbest.app — Pipeline Step 2: Lyric Intelligence`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Language:  ${audioAnalysis.detectedLanguage}`);
  console.log(`  Segments:  ${audioAnalysis.transcription.segments.length}`);
  console.log(`  BPM:       ${audioAnalysis.bpm}`);
  console.log(`  Duration:  ${formatTime(audioAnalysis.durationSeconds)}`);
  console.log(`${'═'.repeat(60)}\n`);

  const result = await analyzeLyrics(audioAnalysis);

  // ── Song Narrative ──
  console.log(`${'─'.repeat(60)}`);
  console.log(`  SONG NARRATIVE`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`  Genre: ${result.genreDetected}`);
  console.log(`  Style: ${result.visualStyleSuggestion}\n`);
  console.log(`  ${result.songNarrative}\n`);

  // ── English Translation ──
  console.log(`${'─'.repeat(60)}`);
  console.log(`  ENGLISH TRANSLATION`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`  ${result.fullTranslation}\n`);

  // ── Color Palette ──
  console.log(`${'─'.repeat(60)}`);
  console.log(`  COLOR PALETTE`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`  ${result.overallColorPalette.join('  ')}\n`);

  // ── Sections ──
  console.log(`${'─'.repeat(60)}`);
  console.log(`  SECTIONS & SCENE DESCRIPTIONS`);
  console.log(`${'─'.repeat(60)}\n`);

  for (const section of result.sections) {
    const bar = '█'.repeat(section.energyLevel) + '░'.repeat(10 - section.energyLevel);
    console.log(`  ┌─ ${section.sectionType.toUpperCase()} [${section.timestampStart} → ${section.timestampEnd}]`);
    console.log(`  │  Emotion:  ${section.emotionalTone}   Energy: ${bar} ${section.energyLevel}/10`);
    console.log(`  │  Color:    ${section.colorMood}`);
    console.log(`  │`);
    console.log(`  │  Kreyòl:   "${section.originalText}"`);
    console.log(`  │  English:  "${section.englishTranslation}"`);
    console.log(`  │`);
    console.log(`  │  Imagery:  ${section.visualImagery}`);
    console.log(`  │  Scene:    ${section.sceneDescription}`);
    console.log(`  │  Camera:   ${section.cameraSuggestion}`);
    if (section.culturalReferences.length > 0) {
      console.log(`  │  Culture:  ${section.culturalReferences.join(', ')}`);
    }
    console.log(`  └${'─'.repeat(58)}\n`);
  }

  // ── Save ──
  const outputPath = fullPath.replace('_analysis.json', '_lyric_intelligence.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log(`${'═'.repeat(60)}`);
  console.log(`  Saved to: ${outputPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
