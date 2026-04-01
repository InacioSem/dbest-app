import type { Storyboard, StoryboardShot, LyricAnalysis, GeneratedClip, Project, Locale } from '../../shared/types';
import { v4 as uuid } from 'uuid';

export function isDemoMode(): boolean {
  return process.env.USE_DEMO_MODE === 'true';
}

export function generateDemoProject(overrides: Partial<Project> = {}): Project {
  return {
    id: uuid(),
    userId: 'demo-user-001',
    artistProfileId: 'demo-artist-001',
    projectType: 'music_video',
    pricingTier: 'hd',
    songUrl: '/demo/song-sample.mp3',
    songLanguage: 'ht',
    status: 'draft',
    costBreakdown: { total: 0, items: [] },
    creativeParams: {},
    createdAt: new Date(),
    ...overrides,
  };
}

export function generateDemoStoryboard(projectId: string): Storyboard {
  const shots: StoryboardShot[] = [
    {
      index: 0,
      startTime: 0,
      endTime: 8,
      description: 'Opening aerial shot of Port-au-Prince at sunset, camera slowly descending toward a vibrant street market.',
      cameraMovement: 'crane_down',
      shotType: 'wide',
      mood: 'nostalgic',
      lyricSnippet: 'Nan peyi m, solèy la toujou klere...',
    },
    {
      index: 1,
      startTime: 8,
      endTime: 18,
      description: 'Medium close-up of artist walking through the market, vendors and colorful produce in the background.',
      cameraMovement: 'tracking',
      shotType: 'medium_closeup',
      mood: 'confident',
      lyricSnippet: 'M ap mache nan lari a ak fyète...',
      referenceImages: ['@image1'],
    },
    {
      index: 2,
      startTime: 18,
      endTime: 30,
      description: 'Artist performing on a rooftop with the city skyline behind them. Golden hour lighting.',
      cameraMovement: 'orbit',
      shotType: 'full',
      mood: 'powerful',
      lyricSnippet: 'Vwa m monte anwo, tout moun tande...',
      referenceImages: ['@image1', '@image2'],
    },
    {
      index: 3,
      startTime: 30,
      endTime: 42,
      description: 'Fast-cut montage of carnival dancers, drums, and painted murals.',
      cameraMovement: 'handheld',
      shotType: 'montage',
      mood: 'energetic',
    },
    {
      index: 4,
      startTime: 42,
      endTime: 55,
      description: 'Slow-motion close-up of artist singing with emotional intensity. Shallow depth of field.',
      cameraMovement: 'dolly_in',
      shotType: 'close_up',
      mood: 'intimate',
      lyricSnippet: 'Kè m ap pale pou tout moun ki lwen...',
      referenceImages: ['@image1'],
    },
    {
      index: 5,
      startTime: 55,
      endTime: 68,
      description: 'Wide shot of a bonfire gathering on a beach at twilight. Community dancing together.',
      cameraMovement: 'steadicam',
      shotType: 'wide',
      mood: 'celebratory',
    },
  ];

  const lyricAnalysis: LyricAnalysis = {
    language: 'ht',
    translationEn: 'In my country, the sun always shines... I walk the streets with pride... My voice rises, everyone hears... My heart speaks for all who are far away...',
    themes: ['homeland', 'pride', 'diaspora', 'resilience', 'community'],
    imagery: ['sunset over Port-au-Prince', 'vibrant market', 'rooftop performance', 'carnival', 'beach bonfire'],
    culturalReferences: ['Rara', 'Carnival', 'Haitian diaspora', 'Kompa rhythm'],
    emotionalArc: [
      { timestamp: 0, emotion: 'nostalgia', intensity: 0.6 },
      { timestamp: 15, emotion: 'confidence', intensity: 0.75 },
      { timestamp: 30, emotion: 'energy', intensity: 0.9 },
      { timestamp: 45, emotion: 'intimacy', intensity: 0.7 },
      { timestamp: 55, emotion: 'celebration', intensity: 0.95 },
    ],
    colorPalette: ['#FF6B35', '#1A1A2E', '#E94560', '#F5A623', '#16213E'],
    sceneDescriptions: [
      { section: 'intro', description: 'Aerial establishing shot transitioning into street-level intimacy' },
      { section: 'verse1', description: 'Artist moving through their environment with confidence' },
      { section: 'chorus', description: 'Rooftop performance with expansive city views' },
      { section: 'bridge', description: 'Cultural montage celebrating Haitian heritage' },
      { section: 'verse2', description: 'Emotional close-up performance' },
      { section: 'outro', description: 'Community gathering, unity and celebration' },
    ],
  };

  return {
    id: uuid(),
    projectId,
    shots,
    lyricAnalysis,
  };
}

export function generateDemoClips(projectId: string, shotCount: number = 6): GeneratedClip[] {
  return Array.from({ length: shotCount }, (_, i) => ({
    id: uuid(),
    projectId,
    storyboardShotIndex: i,
    clipUrl: `/demo/clips/${projectId}/shot-${i}.mp4`,
    platform: '16:9',
    generationModel: 'seedance-demo',
    generationCost: 0,
    status: 'completed' as const,
    createdAt: new Date(),
  }));
}
