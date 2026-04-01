// server/services/audio/transcriptionCorrector.ts
// Post-Whisper correction step for Haitian Creole (Kreyòl Ayisyen).
//
// Problem: Whisper has no Kreyòl model. With 'fr' hint it returns usable
// timestamps but renders Kreyòl words as French phonetic approximations.
//
// Solution: Send the French-phonetic transcription to Claude, which understands
// Kreyòl deeply, and have it re-interpret each segment into correct Kreyòl.
// Timestamps stay unchanged — only the text is corrected.

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../middleware/logger';
import type { TranscriptionResult, SongLanguage } from '../../../shared/types/index';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface CorrectedSegment {
  start: number;
  end: number;
  original: string;
  corrected: string;
}

export async function correctKreyolTranscription(
  transcription: TranscriptionResult,
  songTitle?: string,
): Promise<TranscriptionResult> {
  // Only correct if the language is Kreyòl
  if (transcription.language !== 'ht') {
    return transcription;
  }

  logger.info('Correcting Kreyòl transcription via Claude...');

  const segmentsJson = transcription.segments.map(s => ({
    start: s.start,
    end: s.end,
    text: s.text,
  }));

  const prompt = `You are a native Haitian Creole (Kreyòl Ayisyen) linguist and music transcription expert.

${songTitle ? `SONG TITLE: "${songTitle}"` : ''}

CONTEXT: The following transcription was produced by OpenAI Whisper using a French language hint, because Whisper does not support Haitian Creole. The TIMESTAMPS are accurate, but the TEXT is wrong — Whisper rendered Kreyòl words as French phonetic approximations.

Your job: Re-interpret each segment into correct Kreyòl Ayisyen.

RULES:
- Preserve EXACT timestamps — do not change start/end values
- Fix the text from French phonetics into proper Kreyòl spelling and words
- Kreyòl is NOT French. Use Kreyòl orthography: "ou" not "vous", "mwen" not "moi", "renmen" not "aimer", "li" not "il/elle", "pa" not "pas", "w" not "vous"
- If a segment contains actual English lyrics, keep them in English — this song is multilingual
- If a segment is just music/humming (like "♪♪♪" or "Mmh"), keep it as-is
- Use your knowledge of Haitian music (Kompa, Raboday, Zouk) to inform word choices
- The song title "${songTitle || 'unknown'}" is a major clue about the theme

WHISPER OUTPUT (French-phonetic, timestamps in seconds):
${JSON.stringify(segmentsJson, null, 2)}

FULL WHISPER TEXT (for context):
"${transcription.text}"

Respond with ONLY a JSON object — no markdown, no backticks, no explanation:
{
  "correctedText": "Full corrected Kreyòl lyrics as one string",
  "segments": [
    { "start": 0.0, "end": 4.0, "text": "corrected kreyòl text" },
    ...
  ],
  "notes": "Brief note on what you changed and any uncertain interpretations"
}`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected Claude response type');
    }

    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse Claude correction response as JSON');
    }

    const correction = JSON.parse(jsonMatch[0]);

    const correctedSegments = correction.segments.map((s: CorrectedSegment) => ({
      start: s.start,
      end: s.end,
      text: s.text || s.corrected || '',
    }));

    logger.info(`Kreyòl correction complete: ${correctedSegments.length} segments corrected`);
    if (correction.notes) {
      logger.info(`  Claude notes: ${correction.notes}`);
    }

    return {
      text: correction.correctedText || correctedSegments.map((s: { text: string }) => s.text).join(' '),
      language: 'ht' as SongLanguage,
      segments: correctedSegments,
    };
  } catch (err) {
    logger.error(`Kreyòl correction failed: ${(err as Error).message}`);
    logger.info('Falling back to uncorrected French-phonetic transcription');
    return transcription;
  }
}
