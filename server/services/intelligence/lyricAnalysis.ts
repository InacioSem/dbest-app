// server/services/intelligence/lyricAnalysis.ts
// Pipeline Step 2: Lyric Intelligence
// Uses Claude to analyze lyrics in Kreyòl/French/English/Spanish,
// extract cultural context, and generate scene descriptions

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../middleware/logger.js';
import { demoLyricIntelligence } from './demoData.js';
import type {
  AudioAnalysis,
  LyricIntelligence,
  SongLanguage,
} from '../../../shared/types/index.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

// ============================================================
// Cultural context prompts per language
// ============================================================

const CULTURAL_CONTEXT: Record<SongLanguage, string> = {
  ht: `You are a Haitian music and cultural expert fluent in Kreyòl Ayisyen.
IMPORTANT: Kreyòl is NOT French. Translate directly from Kreyòl.
Recognize cultural references:
- Vodou symbolism (lwa, seremoni, drapo)
- Rara festival energy and instruments
- Carnival (kanaval) imagery
- Diaspora experience (nostalgia for home, life in Miami/NYC/Montreal)
- Haitian history (revolution, independence, resilience)
- Genre patterns: Kompa = slow romantic, Raboday = high-energy street, Zouk = sensual Caribbean, Twoubadou = acoustic storytelling`,

  fr: `You are a Francophone music and cultural expert.
Recognize cultural contexts:
- Antillean French (Guadeloupe, Martinique) — Zouk, Créole influences
- West African Francophone (Côte d'Ivoire, Senegal) — Coupé-Décalé, Afrobeats
- Metropolitan French — Chanson, Rap FR, Variété
- Caribbean carnival and biguine traditions`,

  en: `You are a music and cultural expert.
Recognize cultural contexts:
- Caribbean English dialects (Jamaican Patois, Trinidadian, Bahamian)
- African American musical traditions (R&B, Hip-Hop, Gospel roots)
- Global pop and indie conventions
- Diaspora and immigrant experience themes`,

  es: `You are a Latin music and cultural expert fluent in Spanish.
Recognize cultural contexts:
- Reggaeton and Dembow (Puerto Rico, Dominican Republic)
- Bachata and Merengue (Dominican Republic)
- Salsa and Son (Cuba, Puerto Rico, Colombia)
- Latin trap and urban Latin traditions
- Religious and spiritual references (Santería, Catholic imagery)`,
};

// ============================================================
// Main entry point
// ============================================================

export async function analyzeLyrics(
  audioAnalysis: AudioAnalysis
): Promise<LyricIntelligence> {
  if (isDemoMode()) {
    logger.info('[DEMO] Returning mock lyric intelligence');
    return demoLyricIntelligence;
  }

  const { transcription, songStructure, bpm, detectedLanguage } = audioAnalysis;

  logger.info(`Analyzing lyrics in ${detectedLanguage} (${transcription.segments.length} segments, ${bpm} BPM)`);

  const culturalContext = CULTURAL_CONTEXT[detectedLanguage] || CULTURAL_CONTEXT.en;

  const prompt = buildLyricAnalysisPrompt(
    transcription.text,
    transcription.segments,
    songStructure,
    bpm,
    detectedLanguage,
    culturalContext
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected Claude response type');
  }

  // Parse JSON response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse Claude lyric analysis response as JSON');
  }

  const analysis: LyricIntelligence = JSON.parse(jsonMatch[0]);

  logger.info(`Lyric analysis complete: ${analysis.sections.length} sections, genre: ${analysis.genreDetected}`);

  return analysis;
}

// ============================================================
// Build the analysis prompt
// ============================================================

function buildLyricAnalysisPrompt(
  fullText: string,
  segments: AudioAnalysis['transcription']['segments'],
  songStructure: AudioAnalysis['songStructure'],
  bpm: number,
  language: SongLanguage,
  culturalContext: string
): string {
  const segmentText = segments
    .map(s => `[${formatTime(s.start)} → ${formatTime(s.end)}] ${s.text}`)
    .join('\n');

  const structureText = songStructure
    .map(s => `${s.type.toUpperCase()} [${formatTime(s.startTime)} → ${formatTime(s.endTime)}] energy:${s.energyLevel}/10`)
    .join('\n');

  return `${culturalContext}

Given the following song lyrics with timestamps, analyze them for music video creation.
The song is ${bpm} BPM. Song language: ${language}.

LYRICS WITH TIMESTAMPS:
${segmentText}

DETECTED SONG STRUCTURE:
${structureText}

Respond with ONLY a JSON object (no markdown, no backticks, no preamble) with this exact structure:

{
  "fullTranslation": "Complete English translation preserving poetic quality (if not English)",
  "songNarrative": "One paragraph describing the overall story/message",
  "genreDetected": "Kompa | Raboday | Zouk | Twoubadou | Reggaeton | Bachata | R&B | Pop | Hip-Hop | Other",
  "sections": [
    {
      "sectionType": "intro | verse | chorus | bridge | outro | instrumental",
      "timestampStart": "0:00",
      "timestampEnd": "0:15",
      "originalText": "Original lyrics for this section",
      "englishTranslation": "English translation of this section",
      "emotionalTone": "melancholic | joyful | defiant | romantic | nostalgic | etc.",
      "energyLevel": 1-10,
      "visualImagery": "What the words suggest visually",
      "culturalReferences": ["List any cultural references found"],
      "sceneDescription": "Detailed scene description for video generation",
      "cameraSuggestion": "Camera movement and framing suggestion",
      "colorMood": "Warm golden | Cool blue | Neon vibrant | etc."
    }
  ],
  "overallColorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
  "visualStyleSuggestion": "One sentence describing the ideal visual approach for this song"
}

Create one section entry for each distinct part of the song (intro, each verse, each chorus, bridge, outro).
Make scene descriptions vivid and specific enough to generate video from.
Camera suggestions should be professional cinematography directions.`;
}

// ============================================================
// Helpers
// ============================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
