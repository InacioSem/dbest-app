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

// Configure FAL client
fal.config({ credentials: process.env.FAL_API_KEY });

const isDemoMode = () => process.env.USE_DEMO_MODE === 'true';

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
  const imageUrl = artistProfile.photoUrls[0];
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
      num_inference_steps: 20,
      fps: 24,
      resolution: 768,
      seed: shot.index, // Consistent seed per shot for reproducibility
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
  // Use artist photo as reference for shots that include the artist,
  // skip reference for pure environment/object shots
  const includesArtist = shot.shotType !== 'transition' &&
    !shot.sceneDescription.toLowerCase().includes('rain drops hitting') &&
    !shot.sceneDescription.toLowerCase().includes('close-up of locked') &&
    !shot.sceneDescription.toLowerCase().includes('close-up details of locked');

  const imageUrl = includesArtist ? artistProfile.photoUrls[0] : undefined;
  const resolvedImage = imageUrl ? await resolveFileUrl(imageUrl) : undefined;

  const duration = Math.min(Math.round(shot.timestampEnd - shot.timestampStart), 10);
  const durationOption = duration <= 5 ? '5' : '10';

  logger.info(`  KLING v3 Pro: prompt="${shot.generationPrompt.substring(0, 60)}...", duration=${durationOption}s`);

  const input: Record<string, unknown> = {
    prompt: shot.generationPrompt,
    duration: durationOption,
    aspect_ratio: '16:9',
  };

  if (resolvedImage) {
    input.image_url = resolvedImage;
  }

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
