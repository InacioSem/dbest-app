// server/services/video/videoService.ts
// Pipeline Step 4: Asset Generation
// Orchestrates video clip generation across multiple providers
// Currently in demo/placeholder mode — swap in real API calls when keys are ready

import { logger } from '../../middleware/logger.js';
import type {
  StoryboardShot,
  GeneratedClip,
  ArtistProfile,
} from '../../../shared/types/index.js';

const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

// ============================================================
// Generate all clips for a storyboard
// ============================================================

export async function generateClips(
  projectId: string,
  shots: StoryboardShot[],
  artistProfile: ArtistProfile,
  songUrl: string
): Promise<GeneratedClip[]> {
  logger.info(`Generating ${shots.length} clips for project ${projectId}`);

  const clips: GeneratedClip[] = [];

  for (const shot of shots) {
    try {
      const clip = await generateSingleClip(projectId, shot, artistProfile, songUrl);
      clips.push(clip);
      logger.info(`  Shot ${shot.index}: ${clip.status} (${clip.platform})`);
    } catch (err) {
      logger.error(`  Shot ${shot.index} FAILED: ${(err as Error).message}`);
      clips.push({
        id: `clip_${projectId}_${shot.index}`,
        projectId,
        shotIndex: shot.index,
        clipUrl: '',
        platform: 'error',
        generationModel: 'none',
        generationCost: 0,
        status: 'failed',
        createdAt: new Date(),
      });
    }
  }

  const succeeded = clips.filter(c => c.status === 'succeeded').length;
  logger.info(`Clip generation complete: ${succeeded}/${clips.length} succeeded`);

  return clips;
}

// ============================================================
// Generate a single clip (routes to correct provider)
// ============================================================

async function generateSingleClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile,
  songUrl: string
): Promise<GeneratedClip> {
  if (isDemoMode()) {
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      id: `clip_${projectId}_${shot.index}`,
      projectId,
      shotIndex: shot.index,
      clipUrl: `https://demo.dbest.app/clips/demo_shot_${shot.index}.mp4`,
      platform: shot.requiresLipSync ? 'omnihuman_demo' : 'seedance_demo',
      generationModel: shot.requiresLipSync ? 'omnihuman-v1.5' : 'seedance-2-0',
      generationCost: shot.requiresLipSync ? 0.16 * 5 : 0.10 * 5, // ~5 sec clips
      status: 'succeeded',
      createdAt: new Date(),
    };
  }

  // === REAL API CALLS (uncomment when keys are ready) ===

  if (shot.requiresLipSync) {
    return generateLipSyncClip(projectId, shot, artistProfile, songUrl);
  } else {
    return generateVideoClip(projectId, shot, artistProfile);
  }
}

// ============================================================
// Seedance / Kling video generation (via EvoLink)
// ============================================================

async function generateVideoClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile
): Promise<GeneratedClip> {
  // TODO: Replace with real EvoLink API call when Seedance 2.0 schema is published
  //
  // const response = await fetch(`${process.env.EVOLINK_BASE_URL}/videos/generations`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${process.env.EVOLINK_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     model: process.env.SEEDANCE_MODEL || 'seedance-2-0',
  //     prompt: shot.generationPrompt,
  //     image_urls: artistProfile.photoUrls.slice(0, 9), // Max 9 for @image1-@image9
  //     duration: Math.round(shot.timestampEnd - shot.timestampStart),
  //     audio: false,
  //   }),
  // });
  //
  // const job = await response.json();
  // const result = await pollForResult(job.id);
  // return { ... };

  throw new Error('Video generation not yet implemented — enable DEMO MODE or add EvoLink API key');
}

// ============================================================
// OmniHuman / Aurora lip-sync generation (via FAL.AI)
// ============================================================

async function generateLipSyncClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile,
  songUrl: string
): Promise<GeneratedClip> {
  // TODO: Replace with real FAL.AI API call for OmniHuman/Aurora
  //
  // const response = await fetch('https://fal.run/fal-ai/omnihuman-v1.5', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Key ${process.env.FAL_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     image_url: artistProfile.photoUrls[0], // Primary reference photo
  //     audio_url: songUrl, // Isolated vocal track for this segment
  //     duration: Math.round(shot.timestampEnd - shot.timestampStart),
  //   }),
  // });

  throw new Error('Lip-sync generation not yet implemented — enable DEMO MODE or add FAL API key');
}

// ============================================================
// Async polling helper (for all video APIs)
// ============================================================

export async function pollForResult(
  taskId: string,
  baseUrl: string = process.env.EVOLINK_BASE_URL || '',
  apiKey: string = process.env.EVOLINK_API_KEY || '',
  maxAttempts: number = 60,
  intervalMs: number = 15000
): Promise<{ status: string; videoUrl: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${baseUrl}/tasks/${taskId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    const data = await response.json() as any;

    if (data.status === 'succeeded') {
      return { status: 'succeeded', videoUrl: data.results?.[0] || data.video_url };
    }

    if (data.status === 'failed') {
      throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
    }

    logger.debug(`  Polling ${taskId}: ${data.status} (attempt ${attempt + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Generation timed out after ${maxAttempts} attempts`);
}
