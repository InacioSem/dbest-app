// server/services/pipeline.ts
// Master orchestrator that runs the 6-step pipeline
// Each step updates project status and can be resumed if interrupted

import { logger } from '../middleware/logger.js';
import { analyzeAudio } from './audio/audioService.js';
import { analyzeLyrics } from './intelligence/lyricAnalysis.js';
import { generateStoryboard } from './intelligence/storyboardGenerator.js';
import { generateClips } from './video/videoService.js';
import type {
  Project,
  ArtistProfile,
  AudioAnalysis,
  LyricIntelligence,
  Storyboard,
  GeneratedClip,
  CostBreakdown,
} from '../../shared/types/index.js';

export interface PipelineResult {
  project: Partial<Project>;
  audioAnalysis: AudioAnalysis;
  lyricIntelligence: LyricIntelligence;
  storyboard: Storyboard;
  clips: GeneratedClip[];
  costs: CostBreakdown;
}

// ============================================================
// Run the full pipeline
// ============================================================

export async function runPipeline(
  project: Project,
  artistProfile: ArtistProfile,
  songPath: string
): Promise<PipelineResult> {
  const startTime = Date.now();
  logger.info(`\n${'='.repeat(60)}`);
  logger.info(`🎬 PIPELINE START — Project: ${project.id}`);
  logger.info(`   Artist: ${artistProfile.name}`);
  logger.info(`   Type: ${project.projectType}`);
  logger.info(`   Language: ${project.songLanguage || 'auto-detect'}`);
  logger.info(`${'='.repeat(60)}\n`);

  const costs: CostBreakdown = {
    whisper: 0, claude: 0, videoGeneration: 0,
    lipSync: 0, imageGeneration: 0, total: 0,
  };

  // ── Step 1: Audio Processing ──────────────────────────────
  logger.info('📊 Step 1/6: Analyzing audio...');
  const audioAnalysis = await analyzeAudio(
    songPath,
    project.songLanguageOverride || undefined
  );
  costs.whisper = (audioAnalysis.durationSeconds / 60) * 0.006; // $0.006/min
  logger.info(`   ✓ ${audioAnalysis.bpm} BPM, ${audioAnalysis.durationSeconds.toFixed(0)}s, language: ${audioAnalysis.detectedLanguage}`);

  // ── Step 2: Lyric Intelligence ────────────────────────────
  logger.info('🧠 Step 2/6: Analyzing lyrics...');
  const lyricIntelligence = await analyzeLyrics(audioAnalysis);
  costs.claude += 0.05; // Estimated per-call cost
  logger.info(`   ✓ Genre: ${lyricIntelligence.genreDetected}, ${lyricIntelligence.sections.length} sections`);

  // ── Step 3: Storyboard Generation ─────────────────────────
  logger.info('🎬 Step 3/6: Generating storyboard...');
  const storyboard = await generateStoryboard(
    project.id,
    audioAnalysis,
    lyricIntelligence,
    project.creativeParams,
    artistProfile
  );
  costs.claude += 0.10; // Storyboard generation is a larger prompt
  logger.info(`   ✓ ${storyboard.shots.length} shots planned`);

  // ── Step 4: Asset Generation ──────────────────────────────
  logger.info('🎥 Step 4/6: Generating video clips...');
  const clips = await generateClips(
    project.id,
    storyboard.shots,
    artistProfile,
    project.songUrl
  );
  const succeededClips = clips.filter(c => c.status === 'succeeded');
  costs.videoGeneration = clips.reduce((sum, c) => sum + c.generationCost, 0);
  logger.info(`   ✓ ${succeededClips.length}/${clips.length} clips generated`);

  // ── Step 5: Composition (placeholder) ─────────────────────
  logger.info('🎞️ Step 5/6: Composing video... (placeholder — manual assembly for now)');

  // ── Step 6: Platform Adaptation (placeholder) ─────────────
  logger.info('📱 Step 6/6: Exporting for platforms... (placeholder)');

  // ── Summary ───────────────────────────────────────────────
  costs.total = costs.whisper + costs.claude + costs.videoGeneration + costs.lipSync + costs.imageGeneration;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  logger.info(`\n${'='.repeat(60)}`);
  logger.info(`✅ PIPELINE COMPLETE — ${elapsed}s`);
  logger.info(`   Clips: ${succeededClips.length}/${clips.length}`);
  logger.info(`   Estimated cost: $${costs.total.toFixed(2)}`);
  logger.info(`${'='.repeat(60)}\n`);

  return {
    project: { ...project, status: 'completed', costBreakdown: costs },
    audioAnalysis,
    lyricIntelligence,
    storyboard,
    clips,
    costs,
  };
}
