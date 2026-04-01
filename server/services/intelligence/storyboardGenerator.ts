// server/services/intelligence/storyboardGenerator.ts
// Pipeline Step 3: Storyboard Generation
// Produces 15-25 shot descriptions using lyric intelligence,
// user's creative parameters, and song structure timing

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../../middleware/logger.js';
import { demoStoryboard } from './demoData.js';
import type {
  AudioAnalysis,
  LyricIntelligence,
  CreativeParameters,
  Storyboard,
  StoryboardShot,
  ArtistProfile,
} from '../../../shared/types/index.js';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

// ============================================================
// Main entry point
// ============================================================

export async function generateStoryboard(
  projectId: string,
  audioAnalysis: AudioAnalysis,
  lyricIntelligence: LyricIntelligence,
  creativeParams: Partial<CreativeParameters>,
  artistProfile: ArtistProfile
): Promise<Storyboard> {
  if (isDemoMode()) {
    logger.info('[DEMO] Returning mock storyboard');
    return { ...demoStoryboard, projectId };
  }

  logger.info(`Generating storyboard for project ${projectId}`);

  const prompt = buildStoryboardPrompt(
    audioAnalysis,
    lyricIntelligence,
    creativeParams,
    artistProfile
  );

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected Claude response type');
  }

  // Parse the shots array from Claude's response
  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse storyboard response as JSON array');
  }

  const shots: StoryboardShot[] = JSON.parse(jsonMatch[0]);

  // Add generation prompts with @-reference system for character consistency
  const enrichedShots = shots.map((shot, index) => ({
    ...shot,
    index,
    generationPrompt: buildGenerationPrompt(shot, creativeParams, artistProfile),
  }));

  logger.info(`Storyboard generated: ${enrichedShots.length} shots`);

  return {
    id: `sb_${projectId}`,
    projectId,
    shots: enrichedShots,
    lyricAnalysis: lyricIntelligence,
  };
}

// ============================================================
// Build the storyboard prompt
// ============================================================

function buildStoryboardPrompt(
  audioAnalysis: AudioAnalysis,
  lyricIntelligence: LyricIntelligence,
  params: Partial<CreativeParameters>,
  artist: ArtistProfile
): string {
  const paramText = Object.entries(params)
    .filter(([_, v]) => v !== undefined)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join('\n');

  const sectionsText = lyricIntelligence.sections
    .map(s => `[${s.timestampStart}→${s.timestampEnd}] ${s.sectionType.toUpperCase()}: ${s.sceneDescription} (energy: ${s.energyLevel}/10, mood: ${s.emotionalTone})`)
    .join('\n');

  return `You are an elite music video director creating a shot-by-shot storyboard.

ARTIST: ${artist.name}
GENRE: ${lyricIntelligence.genreDetected}
BPM: ${audioAnalysis.bpm}
DURATION: ${audioAnalysis.durationSeconds} seconds
VISUAL STYLE: ${lyricIntelligence.visualStyleSuggestion}
COLOR PALETTE: ${lyricIntelligence.overallColorPalette.join(', ')}

SONG NARRATIVE: ${lyricIntelligence.songNarrative}

SCENE DESCRIPTIONS PER SECTION:
${sectionsText}

${paramText ? `USER CREATIVE PREFERENCES:\n${paramText}` : 'No specific creative preferences — use your best judgment based on the genre and mood.'}

Create a JSON array of 15-25 shots. Each shot should be 3-10 seconds long.
Rules:
- Performance shots (artist singing to camera) should appear in EVERY chorus
- B-roll scenes should illustrate the lyrics visually
- Vary shot types: mix close-ups, wide shots, tracking shots
- Cut on beat drops — faster cuts for high energy, slower for low energy
- End with a memorable closing shot

Each shot must be a JSON object:
{
  "index": 0,
  "timestampStart": 0.0,
  "timestampEnd": 5.0,
  "sectionType": "intro",
  "lyrics": "any lyrics during this shot or null",
  "sceneDescription": "Detailed visual description",
  "cameraDirection": "Camera movement and angle",
  "lightingDescription": "Lighting setup",
  "moodKeywords": ["keyword1", "keyword2"],
  "shotType": "performance | broll | environment | transition",
  "requiresLipSync": false
}

Set requiresLipSync to true for any shot where the artist is singing directly to camera.
Respond with ONLY the JSON array — no markdown, no backticks, no explanation.`;
}

// ============================================================
// Build generation prompt with @-reference for character consistency
// ============================================================

function buildGenerationPrompt(
  shot: StoryboardShot,
  params: Partial<CreativeParameters>,
  artist: ArtistProfile
): string {
  const parts: string[] = [];

  // Character reference (CRITICAL for consistency)
  if (shot.shotType === 'performance' || shot.shotType === 'broll') {
    parts.push(`@image1`);
  }

  // Scene description
  parts.push(shot.sceneDescription);

  // Camera direction
  parts.push(shot.cameraDirection);

  // Lighting
  parts.push(shot.lightingDescription);

  // Style modifiers from creative params
  if (params.artStyle && params.artStyle !== 'photorealistic') {
    parts.push(`${params.artStyle} style`);
  }
  if (params.colorPalette && params.colorPalette !== 'natural') {
    parts.push(`${params.colorPalette.replace('_', ' ')} color palette`);
  }
  if (params.visualTexture && params.visualTexture !== 'clean') {
    parts.push(`${params.visualTexture.replace('_', ' ')} texture`);
  }
  if (params.lensStyle && params.lensStyle !== 'standard') {
    parts.push(`${params.lensStyle.replace('_', ' ')} lens`);
  }

  // Always add quality keywords
  parts.push('cinematic, professional music video, 8K quality');

  return parts.join('. ');
}
