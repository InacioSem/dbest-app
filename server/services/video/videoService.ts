// server/services/video/videoService.ts
// Pipeline Step 4: Asset Generation
//
// Performance shots (lip-sync): fal-ai/bytedance/omnihuman/v1.5
//   - Takes artist photo + trimmed audio segment → video with lip-sync
//
// B-roll / environment shots: fal-ai/kling-video/v3/pro/image-to-video
//   - Takes artist photo + generation prompt → cinematic video clip

import { fal } from '@fal-ai/client';
import fs from 'fs';
import path from 'path';
import { logger } from '../../middleware/logger';
import type {
  StoryboardShot,
  GeneratedClip,
  ArtistProfile,
} from '../../../shared/types/index';

const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

let falConfigured = false;
function ensureFalConfigured() {
  if (!falConfigured) {
    fal.config({ credentials: process.env.FAL_API_KEY });
    falConfigured = true;
  }
}

// ============================================================
// Generate all clips for a storyboard
// ============================================================

export async function generateClips(
  projectId: string,
  shots: StoryboardShot[],
  artistProfile: ArtistProfile,
  songUrl: string,
  audioSegmentsDir?: string,
): Promise<GeneratedClip[]> {
  logger.info(`Generating ${shots.length} clips for project ${projectId}`);

  const clips: GeneratedClip[] = [];

  for (const shot of shots) {
    try {
      const clip = await generateSingleClip(
        projectId, shot, artistProfile, songUrl, audioSegmentsDir,
      );
      clips.push(clip);
      logger.info(`  Shot ${shot.index + 1}: ${clip.status} (${clip.platform})`);
    } catch (err) {
      logger.error(`  Shot ${shot.index + 1} FAILED: ${(err as Error).message}`);
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
// Route to correct provider based on shot type
// ============================================================

async function generateSingleClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile,
  songUrl: string,
  audioSegmentsDir?: string,
): Promise<GeneratedClip> {
  if (isDemoMode()) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id: `clip_${projectId}_${shot.index}`,
      projectId,
      shotIndex: shot.index,
      clipUrl: `https://demo.dbest.app/clips/demo_shot_${shot.index}.mp4`,
      platform: shot.requiresLipSync ? 'omnihuman_demo' : 'kling_demo',
      generationModel: shot.requiresLipSync ? 'omnihuman-v1.5' : 'kling-v3-pro',
      generationCost: shot.requiresLipSync ? 0.80 : 0.50,
      status: 'succeeded',
      createdAt: new Date(),
    };
  }

  if (shot.requiresLipSync) {
    return generateLipSyncClip(projectId, shot, artistProfile, songUrl, audioSegmentsDir);
  } else {
    return generateVideoClip(projectId, shot, artistProfile);
  }
}

// ============================================================
// Photo selection — pick the best reference image per shot
//
// When multiple photos are available, use scene context to choose:
//   - Flashback / warm / golden scenes → use a warmer, softer photo
//   - Present-day / dramatic / performance → use the dramatic photo
//   - Default → first photo
// ============================================================

function selectPhotoForShot(shot: StoryboardShot, photoUrls: string[]): string {
  if (photoUrls.length <= 1) return photoUrls[0];

  const desc = (shot.sceneDescription + ' ' + (shot.lightingDescription || '')).toLowerCase();
  const mood = (shot.moodKeywords || []).join(' ').toLowerCase();
  const combined = desc + ' ' + mood;

  // Flashback / memory / golden / warm / nostalgic → use last photo (typically the softer look)
  const isFlashback = combined.includes('flashback') ||
    combined.includes('memory') ||
    combined.includes('golden') ||
    combined.includes('overexposed') ||
    combined.includes('nostalgic') ||
    combined.includes('warm') ||
    combined.includes('dreamy');

  if (isFlashback && photoUrls.length >= 3) {
    return photoUrls[2]; // MAG2 — warm, elegant look
  }

  // Dramatic / performance / rain / dark → use second photo (dramatic look)
  const isDramatic = combined.includes('dramatic') ||
    combined.includes('rain') ||
    combined.includes('storm') ||
    combined.includes('dark') ||
    combined.includes('red') ||
    combined.includes('powerful') ||
    combined.includes('intense');

  if (isDramatic && photoUrls.length >= 2) {
    return photoUrls[1]; // MAG1 — dramatic, red-lit
  }

  // Default: first photo
  return photoUrls[0];
}

// ============================================================
// OmniHuman v1.5 — Lip-sync performance shots (via FAL.AI)
//
// Model: fal-ai/bytedance/omnihuman/v1.5
// Input: reference image + audio segment
// Output: video with character-consistent lip-sync
// ============================================================

async function generateLipSyncClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile,
  songUrl: string,
  audioSegmentsDir?: string,
): Promise<GeneratedClip> {
  ensureFalConfigured();
  const imageUrl = selectPhotoForShot(shot, artistProfile.photoUrls);
  if (!imageUrl) {
    throw new Error('No artist photo available for lip-sync generation');
  }

  // Resolve the audio source: use pre-trimmed segment if available,
  // otherwise pass the full song URL (less ideal).
  let audioSource: string = songUrl;

  if (audioSegmentsDir) {
    const shotNum = String(shot.index + 1).padStart(2, '0');
    const segmentFiles = fs.existsSync(audioSegmentsDir)
      ? fs.readdirSync(audioSegmentsDir).filter(f => f.startsWith(`shot${shotNum}_`))
      : [];

    if (segmentFiles.length > 0) {
      const segmentPath = path.join(audioSegmentsDir, segmentFiles[0]);
      // Upload local file to FAL storage
      audioSource = await uploadToFal(segmentPath);
      logger.info(`  Using trimmed audio segment: ${segmentFiles[0]}`);
    }
  }

  // Upload image if it's a local file path
  const resolvedImage = await resolveFileUrl(imageUrl);

  const duration = Math.round(shot.timestampEnd - shot.timestampStart);

  logger.info(`  OmniHuman v1.5: image=${path.basename(imageUrl)}, duration=${duration}s`);

  const result = await fal.subscribe('fal-ai/bytedance/omnihuman/v1.5', {
    input: {
      image_url: resolvedImage,
      audio_url: audioSource,
    },
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && update.logs) {
        for (const log of update.logs) {
          logger.debug(`  OmniHuman [shot ${shot.index + 1}]: ${log.message}`);
        }
      }
    },
  });

  const videoUrl = (result.data as any)?.video?.url;
  if (!videoUrl) {
    throw new Error(`OmniHuman returned no video URL: ${JSON.stringify(result.data)}`);
  }

  return {
    id: `clip_${projectId}_${shot.index}`,
    projectId,
    shotIndex: shot.index,
    clipUrl: videoUrl,
    platform: 'fal-omnihuman',
    generationModel: 'omnihuman-v1.5',
    generationCost: 0.80, // Approximate per-clip cost
    status: 'succeeded',
    createdAt: new Date(),
  };
}

// ============================================================
// KLING v3 Pro — B-roll / environment / transition shots (via FAL.AI)
//
// Model: fal-ai/kling-video/v3/pro/image-to-video
// Input: reference image + text prompt from storyboard
// Output: cinematic video clip matching the scene description
// ============================================================

async function generateVideoClip(
  projectId: string,
  shot: StoryboardShot,
  artistProfile: ArtistProfile,
): Promise<GeneratedClip> {
  ensureFalConfigured();
  // KLING image-to-video always requires start_image_url.
  // Select the best photo based on shot context.
  const imageUrl = selectPhotoForShot(shot, artistProfile.photoUrls);
  if (!imageUrl) {
    throw new Error('No artist photo available for KLING generation');
  }
  logger.info(`  Photo selected: ${path.basename(imageUrl)}`);
  const resolvedImage = await resolveFileUrl(imageUrl);

  const duration = Math.min(Math.round(shot.timestampEnd - shot.timestampStart), 10);
  const durationOption = duration <= 5 ? '5' : '10';

  logger.info(`  KLING v3 Pro: prompt="${shot.generationPrompt.substring(0, 60)}...", duration=${durationOption}s`);

  // Strip @image references from prompt — those are for Seedance, not KLING.
  // KLING uses start_image_url for character reference instead.
  const cleanPrompt = shot.generationPrompt
    .replace(/@image\d+\s*/g, '')
    .replace(/^\.\s*/, '')
    .trim();

  const input: Record<string, unknown> = {
    prompt: cleanPrompt,
    start_image_url: resolvedImage,
    duration: durationOption,
    aspect_ratio: '16:9',
  };

  const result = await fal.subscribe('fal-ai/kling-video/v3/pro/image-to-video', {
    input,
    logs: true,
    onQueueUpdate: (update) => {
      if (update.status === 'IN_PROGRESS' && update.logs) {
        for (const log of update.logs) {
          logger.debug(`  KLING [shot ${shot.index + 1}]: ${log.message}`);
        }
      }
    },
  });

  const videoUrl = (result.data as any)?.video?.url;
  if (!videoUrl) {
    throw new Error(`KLING returned no video URL: ${JSON.stringify(result.data)}`);
  }

  return {
    id: `clip_${projectId}_${shot.index}`,
    projectId,
    shotIndex: shot.index,
    clipUrl: videoUrl,
    platform: 'fal-kling',
    generationModel: 'kling-v3-pro',
    generationCost: 0.50, // Approximate per-clip cost
    status: 'succeeded',
    createdAt: new Date(),
  };
}

// ============================================================
// File handling helpers
// ============================================================

async function uploadToFal(localPath: string): Promise<string> {
  ensureFalConfigured();
  const fileBuffer = fs.readFileSync(localPath);
  const fileName = path.basename(localPath);
  const file = new File([fileBuffer], fileName, {
    type: fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg',
  });

  const url = await fal.storage.upload(file);
  logger.info(`  Uploaded to FAL storage: ${fileName}`);
  return url;
}

async function resolveFileUrl(filePathOrUrl: string): Promise<string> {
  // If it's already a URL, return as-is
  if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
    return filePathOrUrl;
  }

  // If it's a local file, upload to FAL storage
  const absolutePath = path.isAbsolute(filePathOrUrl)
    ? filePathOrUrl
    : path.resolve(filePathOrUrl);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }

  return uploadToFal(absolutePath);
}
