import type { ProjectType } from './types/index';

export interface ProjectTypeDefinition {
  type: ProjectType;
  labelKey: string;
  descriptionKey: string;
  requiresPhotos: boolean;
  requiresLipSync: boolean;
  minDuration?: number;
  maxDuration?: number;
  availableTiers: ('standard' | 'hd' | 'premium')[];
}

export const PROJECT_TYPE_DEFINITIONS: ProjectTypeDefinition[] = [
  {
    type: 'music_video',
    labelKey: 'projectType.musicVideo',
    descriptionKey: 'projectType.musicVideo.desc',
    requiresPhotos: true,
    requiresLipSync: true,
    availableTiers: ['standard', 'hd', 'premium'],
  },
  {
    type: 'lyric_video',
    labelKey: 'projectType.lyricVideo',
    descriptionKey: 'projectType.lyricVideo.desc',
    requiresPhotos: false,
    requiresLipSync: false,
    availableTiers: ['standard', 'hd', 'premium'],
  },
  {
    type: 'visualizer',
    labelKey: 'projectType.visualizer',
    descriptionKey: 'projectType.visualizer.desc',
    requiresPhotos: false,
    requiresLipSync: false,
    availableTiers: ['standard', 'hd'],
  },
  {
    type: 'album_art',
    labelKey: 'projectType.albumArt',
    descriptionKey: 'projectType.albumArt.desc',
    requiresPhotos: false,
    requiresLipSync: false,
    availableTiers: ['standard', 'hd', 'premium'],
  },
  {
    type: 'social_teaser',
    labelKey: 'projectType.socialTeaser',
    descriptionKey: 'projectType.socialTeaser.desc',
    requiresPhotos: true,
    requiresLipSync: true,
    minDuration: 15,
    maxDuration: 30,
    availableTiers: ['standard', 'hd'],
  },
  {
    type: 'spotify_canvas',
    labelKey: 'projectType.spotifyCanvas',
    descriptionKey: 'projectType.spotifyCanvas.desc',
    requiresPhotos: false,
    requiresLipSync: false,
    minDuration: 3,
    maxDuration: 8,
    availableTiers: ['standard'],
  },
];
