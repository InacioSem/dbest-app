#!/usr/bin/env npx tsx
// scripts/run-video-gen.ts
// Runs Pipeline Step 4 against individual shots or the full storyboard.
//
// Usage:
//   Single shot test:  npx tsx scripts/run-video-gen.ts <storyboard.json> --shot 2
//   Full generation:   npx tsx scripts/run-video-gen.ts <storyboard.json> --all
//   Range:             npx tsx scripts/run-video-gen.ts <storyboard.json> --shots 1-5

import 'dotenv/config';
process.env.USE_DEMO_MODE = 'false';

import fs from 'fs';
import path from 'path';
import { generateClips } from '../server/services/video/videoService';
import type { Storyboard, ArtistProfile, StoryboardShot } from '../shared/types/index';

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function main() {
  const storyboardPath = process.argv[2];
  const mode = process.argv[3]; // --shot N, --shots N-M, or --all

  if (!storyboardPath || !mode) {
    console.error('Usage:');
    console.error('  npx tsx scripts/run-video-gen.ts <storyboard.json> --shot 2');
    console.error('  npx tsx scripts/run-video-gen.ts <storyboard.json> --shots 1-5');
    console.error('  npx tsx scripts/run-video-gen.ts <storyboard.json> --all');
    process.exit(1);
  }

  if (!process.env.FAL_API_KEY) {
    console.error('FAL_API_KEY not set in .env');
    process.exit(1);
  }

  const storyboard: Storyboard = JSON.parse(fs.readFileSync(path.resolve(storyboardPath), 'utf-8'));

  // Parse which shots to generate
  let shotsToGenerate: StoryboardShot[];

  if (mode === '--all') {
    shotsToGenerate = storyboard.shots;
  } else if (mode === '--shot') {
    const shotNum = parseInt(process.argv[4]) - 1; // 1-indexed to 0-indexed
    const shot = storyboard.shots.find(s => s.index === shotNum);
    if (!shot) {
      console.error(`Shot ${process.argv[4]} not found (valid: 1-${storyboard.shots.length})`);
      process.exit(1);
    }
    shotsToGenerate = [shot];
  } else if (mode === '--shots') {
    const [start, end] = process.argv[4].split('-').map(n => parseInt(n) - 1);
    shotsToGenerate = storyboard.shots.filter(s => s.index >= start && s.index <= end);
  } else {
    console.error(`Unknown mode: ${mode}`);
    process.exit(1);
  }

  // Artist profile for Magdaline
  const artistProfile: ArtistProfile = {
    id: 'artist_magdaline',
    userId: 'user_1',
    name: 'Magdaline',
    photoUrls: ['/Users/albertsemerville/Desktop/Magdaline/magdaline-mytil-m-te-renmen-w-2026.png'],
    description: 'Haitian R&B artist',
    genreTags: ['R&B', 'Kompa', 'Kreyòl'],
    createdAt: new Date(),
  };

  const audioSegmentsDir = '/Users/albertsemerville/Desktop/Magdaline/audio-segments';
  const songUrl = '/Users/albertsemerville/Desktop/Magdaline/MTE RENMEN W - MAGDALINE - MASTER.wav';

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  dbest.app — Pipeline Step 4: Video Generation`);
  console.log(`${'═'.repeat(60)}`);
  console.log(`  Shots to generate: ${shotsToGenerate.length}`);
  console.log(`  Lip-sync shots:    ${shotsToGenerate.filter(s => s.requiresLipSync).length} (OmniHuman v1.5)`);
  console.log(`  B-roll shots:      ${shotsToGenerate.filter(s => !s.requiresLipSync).length} (KLING v3 Pro)`);
  console.log(`${'═'.repeat(60)}\n`);

  for (const shot of shotsToGenerate) {
    const lip = shot.requiresLipSync ? '🎤' : '🎞️';
    const model = shot.requiresLipSync ? 'OmniHuman' : 'KLING';
    console.log(`  ${lip} Shot ${shot.index + 1} [${fmt(shot.timestampStart)}→${fmt(shot.timestampEnd)}] → ${model}`);
    console.log(`     "${shot.sceneDescription.substring(0, 70)}..."`);
  }

  console.log(`\n  Starting generation...\n`);

  const startTime = Date.now();

  const clips = await generateClips(
    'proj_magdaline_001',
    shotsToGenerate,
    artistProfile,
    songUrl,
    audioSegmentsDir,
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // Results
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  RESULTS (${elapsed}s)`);
  console.log(`${'─'.repeat(60)}\n`);

  let totalCost = 0;
  for (const clip of clips) {
    const icon = clip.status === 'succeeded' ? '✅' : '❌';
    totalCost += clip.generationCost;
    console.log(`  ${icon} Shot ${clip.shotIndex + 1} — ${clip.platform} (${clip.generationModel})`);
    if (clip.clipUrl) {
      console.log(`     URL: ${clip.clipUrl}`);
    }
    if (clip.status === 'failed') {
      console.log(`     FAILED`);
    }
  }

  const succeeded = clips.filter(c => c.status === 'succeeded').length;
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${succeeded}/${clips.length} clips generated`);
  console.log(`  Estimated cost: $${totalCost.toFixed(2)}`);
  console.log(`  Time: ${elapsed}s`);

  // Save results
  const outputDir = path.dirname(path.resolve(storyboardPath));
  const outputPath = path.join(outputDir, 'generated_clips.json');
  const existing = fs.existsSync(outputPath)
    ? JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
    : [];
  // Merge new clips with existing (replace by shotIndex)
  const merged = [...existing];
  for (const clip of clips) {
    const idx = merged.findIndex((c: any) => c.shotIndex === clip.shotIndex);
    if (idx >= 0) merged[idx] = clip;
    else merged.push(clip);
  }
  fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
  console.log(`  Saved to: ${outputPath}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch((err) => {
  console.error(`\nError: ${err.message}`);
  process.exit(1);
});
