// scripts/transcribe.ts
// Real Whisper transcription: compress WAV → MP3, then transcribe with language hint
//
// Usage: npx tsx scripts/transcribe.ts <path-to-audio> [language-code]
// Example: npx tsx scripts/transcribe.ts ~/Desktop/Magdaline/song.wav ht

import 'dotenv/config';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Compress for Whisper (25MB limit) ───
function compressForWhisper(inputPath: string): string {
  const outputPath = path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}_compressed.mp3`
  );

  const inputSize = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(1);
  console.log(`\n📦 Compressing: ${path.basename(inputPath)} (${inputSize}MB)`);
  console.log(`   Command: ffmpeg -i input -ac 1 -ar 16000 -b:a 48k output.mp3`);

  execSync(
    `ffmpeg -y -i "${inputPath}" -ac 1 -ar 16000 -b:a 128k "${outputPath}"`,
    { stdio: 'pipe' }
  );

  const outputSize = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1);
  console.log(`   ✓ Compressed: ${outputSize}MB (limit: 25MB)\n`);

  return outputPath;
}

// ─── Transcribe with Whisper ───
async function transcribe(audioPath: string, language?: string) {
  console.log(`🎤 Transcribing with Whisper...`);
  console.log(`   Language hint: ${language || 'auto-detect'}`);

  // Whisper doesn't support 'ht' (Haitian Creole) directly.
  // Use 'fr' as hint — Whisper handles Kreyòl better with French hint
  // than with auto-detect (which often defaults to English).
  const whisperLang = language === 'ht' ? 'fr' : language;
  if (language === 'ht') {
    console.log(`   Note: Whisper doesn't support 'ht' — using 'fr' hint (best for Kreyòl)`);
  }

  const file = fs.createReadStream(audioPath);

  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    ...(whisperLang ? { language: whisperLang } : {}),
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  return response;
}

// ─── Main ───
async function main() {
  const inputPath = process.argv[2];
  const language = process.argv[3]; // e.g., 'ht' for Kreyòl

  if (!inputPath) {
    console.error('Usage: npx tsx scripts/transcribe.ts <audio-file> [language]');
    console.error('  Languages: ht (Kreyòl), fr (French), en (English), es (Spanish)');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY not set in .env');
    process.exit(1);
  }

  const fullPath = path.resolve(inputPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ File not found: ${fullPath}`);
    process.exit(1);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`🎬 dbest.app — Audio Transcription`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   File: ${path.basename(fullPath)}`);
  console.log(`   Size: ${(fs.statSync(fullPath).size / 1024 / 1024).toFixed(1)}MB`);

  // Step 1: Compress if needed
  let processPath = fullPath;
  const fileSizeMB = fs.statSync(fullPath).size / 1024 / 1024;

  if (fileSizeMB > 24 || fullPath.endsWith('.wav')) {
    processPath = compressForWhisper(fullPath);
  } else {
    console.log(`\n✓ File already under 25MB, skipping compression\n`);
  }

  // Step 2: Transcribe
  const result = await transcribe(processPath, language);

  // Step 3: Output results
  const segments = (result as any).segments || [];
  const detectedLang = (result as any).language || language || 'unknown';

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ TRANSCRIPTION COMPLETE`);
  console.log(`${'='.repeat(60)}`);
  console.log(`   Detected language: ${detectedLang}`);
  console.log(`   Segments: ${segments.length}`);
  console.log(`${'='.repeat(60)}\n`);

  // Print full text
  console.log(`📝 FULL TEXT:\n`);
  console.log(result.text);

  // Print segments with timestamps
  console.log(`\n📊 SEGMENTS:\n`);
  for (const seg of segments) {
    const start = formatTime(seg.start);
    const end = formatTime(seg.end);
    console.log(`  [${start} → ${end}] ${seg.text.trim()}`);
  }

  // Save to JSON
  const outputJson = path.join(
    path.dirname(fullPath),
    `${path.basename(fullPath, path.extname(fullPath))}_transcription.json`
  );

  const output = {
    song: path.basename(fullPath),
    language: detectedLang,
    languageHint: language || null,
    text: result.text,
    segments: segments.map((s: any) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    })),
    duration: (result as any).duration || segments[segments.length - 1]?.end || 0,
    transcribedAt: new Date().toISOString(),
  };

  fs.writeFileSync(outputJson, JSON.stringify(output, null, 2));
  console.log(`\n💾 Saved to: ${outputJson}`);

  // Cleanup compressed file
  if (processPath !== fullPath) {
    fs.unlinkSync(processPath);
    console.log(`🗑️  Cleaned up compressed file`);
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

main().catch((err) => {
  console.error(`\n❌ Error: ${err.message}`);
  process.exit(1);
});
