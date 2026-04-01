#!/usr/bin/env npx tsx
// scripts/run-storyboard.ts
// Runs Pipeline Step 3 (Storyboard Generation) against saved analysis + lyric intelligence.
//
// Usage: npx tsx scripts/run-storyboard.ts <analysis.json> <lyric_intelligence.json> [artist-name]

import 'dotenv/config';
process.env.USE_DEMO_MODE = 'false';

import fs from 'fs';
import path from 'path';
import { generateStoryboard } from '../server/services/intelligence/storyboardGenerator';
import type { AudioAnalysis, LyricIntelligence, ArtistProfile, CreativeParameters } from '../shared/types/index';

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function main() {
  const analysisPath = process.argv[2];
  const lyricPath = process.argv[3];
  const artistName = process.argv[4] || 'Magdaline';

  if (!analysisPath || !lyricPath) {
    console.error('Usage: npx tsx scripts/run-storyboard.ts <analysis.json> <lyric_intelligence.json> [artist-name]');
    process.exit(1);
  }

  const audioAnalysis: AudioAnalysis = JSON.parse(fs.readFileSync(path.resolve(analysisPath), 'utf-8'));
  const lyricIntelligence: LyricIntelligence = JSON.parse(fs.readFileSync(path.resolve(lyricPath), 'utf-8'));

  // Magdaline's artist profile from the production plan
  const artistProfile: ArtistProfile = {
    id: 'artist_magdaline',
    userId: 'user_1',
    name: artistName,
    photoUrls: ['magdaline-mytil-m-te-renmen-w-2026.png'],
    description: 'Haitian R&B/Kompa artist',
    genreTags: ['R&B', 'Kompa', 'Kreyòl'],
    createdAt: new Date(),
  };

  // No overrides — let Claude decide everything from genre + emotional arc
  const creativeParams: Partial<CreativeParameters> = {};

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  dbest.app — Pipeline Step 3: Storyboard Generation`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Artist:   ${artistName}`);
  console.log(`  Genre:    ${lyricIntelligence.genreDetected}`);
  console.log(`  Duration: ${fmt(audioAnalysis.durationSeconds)}`);
  console.log(`  Sections: ${lyricIntelligence.sections.length}`);
  console.log(`${'═'.repeat(60)}\n`);

  const storyboard = await generateStoryboard(
    'proj_magdaline_001',
    audioAnalysis,
    lyricIntelligence,
    creativeParams,
    artistProfile
  );

  // ── Print shots ──
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  STORYBOARD: ${storyboard.shots.length} SHOTS`);
  console.log(`${'─'.repeat(60)}\n`);

  for (const shot of storyboard.shots) {
    const lipSync = shot.requiresLipSync ? ' 🎤 LIP-SYNC' : '';
    const typeIcon: Record<string, string> = {
      performance: '🎬',
      broll: '🎞️',
      environment: '🌆',
      transition: '✨',
    };
    const icon = typeIcon[shot.shotType] || '📷';

    console.log(`  ┌─ SHOT ${shot.index + 1}  ${icon} ${shot.shotType.toUpperCase()}${lipSync}`);
    console.log(`  │  Time:     [${fmt(shot.timestampStart)} → ${fmt(shot.timestampEnd)}]  (${(shot.timestampEnd - shot.timestampStart).toFixed(1)}s)`);
    console.log(`  │  Section:  ${shot.sectionType}`);
    if (shot.lyrics) {
      console.log(`  │  Lyrics:   "${shot.lyrics.substring(0, 70)}${shot.lyrics.length > 70 ? '...' : ''}"`);
    }
    console.log(`  │`);
    console.log(`  │  Scene:    ${shot.sceneDescription}`);
    console.log(`  │  Camera:   ${shot.cameraDirection}`);
    console.log(`  │  Lighting: ${shot.lightingDescription}`);
    console.log(`  │  Mood:     ${shot.moodKeywords.join(', ')}`);
    console.log(`  │`);
    console.log(`  │  Prompt:   ${shot.generationPrompt.substring(0, 100)}...`);
    console.log(`  └${'─'.repeat(58)}\n`);
  }

  // ── Summary ──
  const perfShots = storyboard.shots.filter(s => s.shotType === 'performance').length;
  const brollShots = storyboard.shots.filter(s => s.shotType === 'broll').length;
  const envShots = storyboard.shots.filter(s => s.shotType === 'environment').length;
  const lipSyncShots = storyboard.shots.filter(s => s.requiresLipSync).length;

  console.log(`${'─'.repeat(60)}`);
  console.log(`  SUMMARY`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`  Total shots:     ${storyboard.shots.length}`);
  console.log(`  Performance:     ${perfShots}`);
  console.log(`  B-roll:          ${brollShots}`);
  console.log(`  Environment:     ${envShots}`);
  console.log(`  Lip-sync needed: ${lipSyncShots}`);
  console.log(`  Avg shot length: ${(audioAnalysis.durationSeconds / storyboard.shots.length).toFixed(1)}s`);

  // ── Save ──
  const outputPath = path.resolve(analysisPath).replace('_analysis.json', '_storyboard.json');
  fs.writeFileSync(outputPath, JSON.stringify(storyboard, null, 2));

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  Saved to: ${outputPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
