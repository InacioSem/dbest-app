// shared/types/index.ts
// Core types for dbest.app — imported by both server and client

// ============================================================
// Locale & Language
// ============================================================

export type SupportedLocale = 'ht' | 'fr' | 'en' | 'es';

export type SongLanguage = SupportedLocale; // Same codes for Whisper

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  ht: 'Kreyòl Ayisyen',
  fr: 'Français',
  en: 'English',
  es: 'Español',
};

// ============================================================
// Project Types (expandable for scaling)
// ============================================================

export type ProjectType =
  | 'music_video'      // Full video with lip-sync + b-roll (MVP)
  | 'lyric_video'      // Animated text over backgrounds (Phase 2)
  | 'visualizer'       // Audio-reactive abstract animation (Phase 2)
  | 'album_art'        // Static or animated cover art (Phase 2)
  | 'social_teaser'    // 15-30 second clips for TikTok/Reels (Phase 2)
  | 'spotify_canvas';  // 3-8 second looping clip (Phase 2)

export type PricingTier = 'basic' | 'standard' | 'premium';

// ============================================================
// Pipeline Status
// ============================================================

export type PipelineStage =
  | 'uploaded'
  | 'analyzing_audio'
  | 'analyzing_lyrics'
  | 'generating_storyboard'
  | 'generating_assets'
  | 'composing'
  | 'exporting'
  | 'completed'
  | 'failed';

export type ClipStatus = 'pending' | 'generating' | 'succeeded' | 'failed';

// ============================================================
// Project
// ============================================================

export interface Project {
  id: string;
  userId: string;
  artistProfileId: string;
  projectType: ProjectType;
  pricingTier: PricingTier;
  songUrl: string;
  songLanguage: SongLanguage;
  songLanguageOverride?: SongLanguage; // User can override auto-detect
  status: PipelineStage;
  creativeParams: Partial<CreativeParameters>;
  stylePresetId?: string;
  costBreakdown: CostBreakdown;
  createdAt: Date;
  updatedAt: Date;
}

export interface CostBreakdown {
  whisper: number;
  claude: number;
  videoGeneration: number;
  lipSync: number;
  imageGeneration: number;
  total: number;
}

// ============================================================
// Artist Profile
// ============================================================

export interface ArtistProfile {
  id: string;
  userId: string;
  name: string;
  photoUrls: string[]; // 3-5 reference photos
  description?: string;
  genreTags: string[];
  createdAt: Date;
}

// ============================================================
// Audio Analysis (Pipeline Step 1)
// ============================================================

export interface AudioAnalysis {
  transcription: TranscriptionResult;
  bpm: number;
  beatMarkers: number[]; // timestamps in seconds
  songStructure: SongSection[];
  durationSeconds: number;
  detectedLanguage: SongLanguage;
}

export interface TranscriptionResult {
  text: string;
  language: SongLanguage;
  segments: TranscriptionSegment[];
}

export interface TranscriptionSegment {
  start: number;    // seconds
  end: number;      // seconds
  text: string;
}

export interface SongSection {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'instrumental';
  startTime: number;
  endTime: number;
  lyrics?: string;
  energyLevel: number; // 1-10
}

// ============================================================
// Lyric Intelligence (Pipeline Step 2)
// ============================================================

export interface LyricIntelligence {
  fullTranslation: string; // English translation (if not already English)
  songNarrative: string;
  genreDetected: string;
  sections: LyricSection[];
  overallColorPalette: string[]; // hex codes
  visualStyleSuggestion: string;
}

export interface LyricSection {
  sectionType: SongSection['type'];
  timestampStart: string;
  timestampEnd: string;
  originalText: string;
  englishTranslation: string;
  emotionalTone: string;
  energyLevel: number;
  visualImagery: string;
  culturalReferences: string[];
  sceneDescription: string;
  cameraSuggestion: string;
  colorMood: string;
}

// ============================================================
// Storyboard (Pipeline Step 3)
// ============================================================

export interface Storyboard {
  id: string;
  projectId: string;
  shots: StoryboardShot[];
  lyricAnalysis: LyricIntelligence;
  approvedAt?: Date;
}

export interface StoryboardShot {
  index: number;
  timestampStart: number; // seconds
  timestampEnd: number;
  sectionType: SongSection['type'];
  lyrics?: string;
  sceneDescription: string;
  cameraDirection: string;
  lightingDescription: string;
  moodKeywords: string[];
  generationPrompt: string; // The actual prompt sent to video API
  shotType: 'performance' | 'broll' | 'environment' | 'transition';
  requiresLipSync: boolean;
}

// ============================================================
// Generated Clips (Pipeline Step 4)
// ============================================================

export interface GeneratedClip {
  id: string;
  projectId: string;
  shotIndex: number;
  clipUrl: string;
  platform: string; // which API generated it
  generationModel: string;
  generationCost: number;
  status: ClipStatus;
  createdAt: Date;
}

// ============================================================
// Distribution (Pipeline Step 6)
// ============================================================

export type DistributionChannelId =
  | 'download'
  | 'youtube'
  | 'tiktok'
  | 'spotify_canvas'
  | 'instagram';

export interface ExportSpec {
  aspectRatio: '16:9' | '9:16' | '1:1';
  maxDuration?: number;
  resolution: '720p' | '1080p' | '4K';
  format: 'mp4' | 'mov' | 'webm';
}

export interface ExportResult {
  id: string;
  projectId: string;
  channel: DistributionChannelId;
  spec: ExportSpec;
  fileUrl: string;
  publishedUrl?: string;
  publishedAt?: Date;
}

// ============================================================
// Style Presets (Marketplace-ready)
// ============================================================

export interface StylePreset {
  id: string;
  creatorId: string;
  name: string;
  description: Record<SupportedLocale, string>; // Multilingual
  parameters: Partial<CreativeParameters>;
  thumbnailUrl?: string;
  tags: string[];
  isPublic: boolean;
  price?: number; // null = free
  usageCount: number;
  createdAt: Date;
}

// ============================================================
// Creative Parameters (The 20 Controls)
// ============================================================

export interface CreativeParameters {
  // Category 1: Cinematography (1-5)
  cameraMovement: CameraMovement;
  shotTypes: ShotTypes;
  cameraAngle: CameraAngle;
  lensStyle: LensStyle;
  focusTechnique: FocusTechnique;

  // Category 2: Visual Style (6-10)
  colorPalette: ColorPalette;
  lightingStyle: LightingStyle;
  visualTexture: VisualTexture;
  artStyle: ArtStyle;
  visualEffects: VisualEffects;

  // Category 3: Narrative (11-14)
  settingLocation: SettingLocation;
  moodAtmosphere: MoodAtmosphere;
  timeOfDay: TimeOfDay;
  weather: Weather;

  // Category 4: Character (15-17)
  characterPresence: CharacterPresence;
  wardrobeStyle: WardrobeStyle;
  performanceEnergy: PerformanceEnergy;

  // Category 5: Editing (18-20)
  cutPace: CutPace;
  transitionStyle: TransitionStyle;
  lipSyncAmount: LipSyncAmount;
}

// Parameter option types
export type CameraMovement = 'static' | 'slow_pan' | 'tracking' | 'handheld' | 'drone_orbit' | 'steadicam';
export type ShotTypes = 'mixed' | 'wide' | 'closeup' | 'medium' | 'extreme_closeup' | 'establishing';
export type CameraAngle = 'eye_level' | 'low_angle' | 'high_angle' | 'dutch' | 'overhead' | 'pov';
export type LensStyle = 'standard' | 'wide_angle' | 'telephoto' | 'fisheye' | 'anamorphic' | 'macro';
export type FocusTechnique = 'deep_focus' | 'shallow_dof' | 'rack_focus' | 'soft_focus';

export type ColorPalette = 'natural' | 'vibrant' | 'monochrome' | 'sepia_warm' | 'teal_orange' | 'pastel' | 'dark_gothic';
export type LightingStyle = 'natural' | 'cinematic' | 'neon_noir' | 'high_key' | 'low_key' | 'golden_hour' | 'silhouette';
export type VisualTexture = 'clean' | 'film_grain' | 'glow' | 'glitch' | 'vhs_retro' | 'watercolor';
export type ArtStyle = 'photorealistic' | 'anime' | 'cyberpunk' | 'fantasy' | 'vintage' | 'abstract' | 'minimalist';
export type VisualEffects = 'none' | 'particles' | 'light_leaks' | 'lens_flares' | 'motion_blur' | 'slow_motion' | 'timelapse';

export type SettingLocation = 'abstract_studio' | 'urban' | 'nature' | 'beach' | 'desert' | 'space' | 'historical' | 'club';
export type MoodAtmosphere = 'song_derived' | 'energetic' | 'melancholic' | 'mysterious' | 'romantic' | 'dark' | 'hopeful' | 'dreamy';
export type TimeOfDay = 'song_derived' | 'day' | 'night' | 'sunrise_sunset' | 'twilight' | 'stormy';
export type Weather = 'clear' | 'rain' | 'snow' | 'fog' | 'storm' | 'wind_dust' | 'smoke_haze';

export type CharacterPresence = 'artist_only' | 'artist_crowd' | 'artist_partner' | 'doubles_mirrors' | 'abstract';
export type WardrobeStyle = 'from_photo' | 'formal' | 'streetwear' | 'fantasy_costume' | 'minimalist';
export type PerformanceEnergy = 'song_derived' | 'subtle' | 'confident' | 'high_energy' | 'ethereal';

export type CutPace = 'beat_synced' | 'fast' | 'medium' | 'slow_dreamy';
export type TransitionStyle = 'hard_cut' | 'crossfade' | 'dip_to_black' | 'whip_pan' | 'match_cut' | 'morph';
export type LipSyncAmount = 'mixed' | 'heavy' | 'light' | 'none';

// ============================================================
// API Response Shape (consistent across all endpoints)
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// Cost Logging
// ============================================================

export interface CostLog {
  id: string;
  projectId: string;
  apiName: string;
  endpoint: string;
  tokensOrSeconds: number;
  costUsd: number;
  createdAt: Date;
}
