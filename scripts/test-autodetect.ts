import 'dotenv/config';
import fs from 'fs';
import { execSync } from 'child_process';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function main() {
  const input = "/Users/albertsemerville/Desktop/Magdaline/MTE RENMEN W - MAGDALINE - MASTER.wav";
  const output = "/tmp/magdaline_autodetect.mp3";

  console.log("Compressing at 128kbps...");
  execSync(`ffmpeg -y -i "${input}" -ac 1 -ar 16000 -b:a 128k "${output}"`, { stdio: 'pipe' });
  console.log(`Compressed: ${(fs.statSync(output).size / 1024 / 1024).toFixed(1)}MB`);

  console.log("Transcribing (NO language hint — auto-detect)...\n");
  const file = fs.createReadStream(output);
  const response = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment'],
  });

  const lang = (response as any).language;
  const segs = (response as any).segments || [];
  console.log(`Detected language: ${lang} | Segments: ${segs.length}\n`);

  for (const s of segs) {
    const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    console.log(`[${fmt(s.start)} → ${fmt(s.end)}] ${s.text.trim()}`);
  }

  fs.unlinkSync(output);
}

main().catch(e => { console.error(e.message); process.exit(1); });
