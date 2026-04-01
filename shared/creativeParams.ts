import type { CreativeParameters } from './types/index';

export interface ParamOption {
  value: string;
  labelKey: string; // i18n key
}

export interface ParamDefinition {
  key: keyof CreativeParameters;
  category: 'cinematography' | 'visual_style' | 'narrative' | 'character' | 'editing';
  labelKey: string;
  options: ParamOption[];
}

export const CREATIVE_PARAM_DEFINITIONS: ParamDefinition[] = [
  // ─── Cinematography (1-5) ───
  {
    key: 'cameraMovement',
    category: 'cinematography',
    labelKey: 'params.cameraMovement',
    options: [
      { value: 'static', labelKey: 'params.cameraMovement.static' },
      { value: 'slow_pan', labelKey: 'params.cameraMovement.slowPan' },
      { value: 'tracking', labelKey: 'params.cameraMovement.tracking' },
      { value: 'handheld', labelKey: 'params.cameraMovement.handheld' },
      { value: 'drone', labelKey: 'params.cameraMovement.drone' },
      { value: 'dolly_zoom', labelKey: 'params.cameraMovement.dollyZoom' },
    ],
  },
  {
    key: 'shotTypes',
    category: 'cinematography',
    labelKey: 'params.shotTypes',
    options: [
      { value: 'close_up', labelKey: 'params.shotTypes.closeUp' },
      { value: 'medium', labelKey: 'params.shotTypes.medium' },
      { value: 'wide', labelKey: 'params.shotTypes.wide' },
      { value: 'extreme_close', labelKey: 'params.shotTypes.extremeClose' },
      { value: 'over_shoulder', labelKey: 'params.shotTypes.overShoulder' },
    ],
  },
  {
    key: 'cameraAngle',
    category: 'cinematography',
    labelKey: 'params.cameraAngle',
    options: [
      { value: 'eye_level', labelKey: 'params.cameraAngle.eyeLevel' },
      { value: 'low_angle', labelKey: 'params.cameraAngle.lowAngle' },
      { value: 'high_angle', labelKey: 'params.cameraAngle.highAngle' },
      { value: 'dutch', labelKey: 'params.cameraAngle.dutch' },
      { value: 'birds_eye', labelKey: 'params.cameraAngle.birdsEye' },
    ],
  },
  {
    key: 'lensStyle',
    category: 'cinematography',
    labelKey: 'params.lensStyle',
    options: [
      { value: 'cinematic_35mm', labelKey: 'params.lensStyle.cinematic35' },
      { value: 'anamorphic', labelKey: 'params.lensStyle.anamorphic' },
      { value: 'wide_angle', labelKey: 'params.lensStyle.wideAngle' },
      { value: 'telephoto', labelKey: 'params.lensStyle.telephoto' },
      { value: 'fisheye', labelKey: 'params.lensStyle.fisheye' },
    ],
  },
  {
    key: 'focusTechnique',
    category: 'cinematography',
    labelKey: 'params.focusTechnique',
    options: [
      { value: 'deep_focus', labelKey: 'params.focusTechnique.deepFocus' },
      { value: 'shallow_dof', labelKey: 'params.focusTechnique.shallowDof' },
      { value: 'rack_focus', labelKey: 'params.focusTechnique.rackFocus' },
      { value: 'soft_focus', labelKey: 'params.focusTechnique.softFocus' },
    ],
  },
  // ─── Visual Style (6-10) ───
  {
    key: 'colorPalette',
    category: 'visual_style',
    labelKey: 'params.colorPalette',
    options: [
      { value: 'warm_golden', labelKey: 'params.colorPalette.warmGolden' },
      { value: 'cool_blue', labelKey: 'params.colorPalette.coolBlue' },
      { value: 'neon_vibrant', labelKey: 'params.colorPalette.neonVibrant' },
      { value: 'desaturated', labelKey: 'params.colorPalette.desaturated' },
      { value: 'monochrome', labelKey: 'params.colorPalette.monochrome' },
      { value: 'tropical', labelKey: 'params.colorPalette.tropical' },
    ],
  },
  {
    key: 'lightingStyle',
    category: 'visual_style',
    labelKey: 'params.lightingStyle',
    options: [
      { value: 'natural', labelKey: 'params.lightingStyle.natural' },
      { value: 'dramatic', labelKey: 'params.lightingStyle.dramatic' },
      { value: 'neon_glow', labelKey: 'params.lightingStyle.neonGlow' },
      { value: 'golden_hour', labelKey: 'params.lightingStyle.goldenHour' },
      { value: 'silhouette', labelKey: 'params.lightingStyle.silhouette' },
      { value: 'studio', labelKey: 'params.lightingStyle.studio' },
    ],
  },
  {
    key: 'visualTexture',
    category: 'visual_style',
    labelKey: 'params.visualTexture',
    options: [
      { value: 'clean_digital', labelKey: 'params.visualTexture.cleanDigital' },
      { value: 'film_grain', labelKey: 'params.visualTexture.filmGrain' },
      { value: 'vhs_retro', labelKey: 'params.visualTexture.vhsRetro' },
      { value: 'painterly', labelKey: 'params.visualTexture.painterly' },
    ],
  },
  {
    key: 'artStyle',
    category: 'visual_style',
    labelKey: 'params.artStyle',
    options: [
      { value: 'photorealistic', labelKey: 'params.artStyle.photorealistic' },
      { value: 'stylized', labelKey: 'params.artStyle.stylized' },
      { value: 'anime', labelKey: 'params.artStyle.anime' },
      { value: 'comic', labelKey: 'params.artStyle.comic' },
      { value: 'abstract', labelKey: 'params.artStyle.abstract' },
    ],
  },
  {
    key: 'visualEffects',
    category: 'visual_style',
    labelKey: 'params.visualEffects',
    options: [
      { value: 'none', labelKey: 'params.visualEffects.none' },
      { value: 'particles', labelKey: 'params.visualEffects.particles' },
      { value: 'light_leaks', labelKey: 'params.visualEffects.lightLeaks' },
      { value: 'smoke_haze', labelKey: 'params.visualEffects.smokeHaze' },
      { value: 'glitch', labelKey: 'params.visualEffects.glitch' },
    ],
  },
  // ─── Narrative (11-14) ───
  {
    key: 'settingLocation',
    category: 'narrative',
    labelKey: 'params.settingLocation',
    options: [
      { value: 'studio', labelKey: 'params.settingLocation.studio' },
      { value: 'urban_street', labelKey: 'params.settingLocation.urbanStreet' },
      { value: 'beach_tropical', labelKey: 'params.settingLocation.beachTropical' },
      { value: 'nightclub', labelKey: 'params.settingLocation.nightclub' },
      { value: 'rooftop', labelKey: 'params.settingLocation.rooftop' },
      { value: 'nature', labelKey: 'params.settingLocation.nature' },
      { value: 'mansion', labelKey: 'params.settingLocation.mansion' },
    ],
  },
  {
    key: 'moodAtmosphere',
    category: 'narrative',
    labelKey: 'params.moodAtmosphere',
    options: [
      { value: 'energetic', labelKey: 'params.moodAtmosphere.energetic' },
      { value: 'romantic', labelKey: 'params.moodAtmosphere.romantic' },
      { value: 'melancholic', labelKey: 'params.moodAtmosphere.melancholic' },
      { value: 'triumphant', labelKey: 'params.moodAtmosphere.triumphant' },
      { value: 'mysterious', labelKey: 'params.moodAtmosphere.mysterious' },
      { value: 'nostalgic', labelKey: 'params.moodAtmosphere.nostalgic' },
    ],
  },
  {
    key: 'timeOfDay',
    category: 'narrative',
    labelKey: 'params.timeOfDay',
    options: [
      { value: 'dawn', labelKey: 'params.timeOfDay.dawn' },
      { value: 'day', labelKey: 'params.timeOfDay.day' },
      { value: 'golden_hour', labelKey: 'params.timeOfDay.goldenHour' },
      { value: 'night', labelKey: 'params.timeOfDay.night' },
    ],
  },
  {
    key: 'weather',
    category: 'narrative',
    labelKey: 'params.weather',
    options: [
      { value: 'clear', labelKey: 'params.weather.clear' },
      { value: 'rain', labelKey: 'params.weather.rain' },
      { value: 'fog', labelKey: 'params.weather.fog' },
      { value: 'storm', labelKey: 'params.weather.storm' },
      { value: 'snow', labelKey: 'params.weather.snow' },
    ],
  },
  // ─── Character (15-17) ───
  {
    key: 'characterPresence',
    category: 'character',
    labelKey: 'params.characterPresence',
    options: [
      { value: 'solo_performance', labelKey: 'params.characterPresence.soloPerformance' },
      { value: 'with_dancers', labelKey: 'params.characterPresence.withDancers' },
      { value: 'narrative_cast', labelKey: 'params.characterPresence.narrativeCast' },
      { value: 'abstract_no_people', labelKey: 'params.characterPresence.abstractNoPeople' },
    ],
  },
  {
    key: 'wardrobeStyle',
    category: 'character',
    labelKey: 'params.wardrobeStyle',
    options: [
      { value: 'streetwear', labelKey: 'params.wardrobeStyle.streetwear' },
      { value: 'formal', labelKey: 'params.wardrobeStyle.formal' },
      { value: 'traditional', labelKey: 'params.wardrobeStyle.traditional' },
      { value: 'futuristic', labelKey: 'params.wardrobeStyle.futuristic' },
      { value: 'match_photos', labelKey: 'params.wardrobeStyle.matchPhotos' },
    ],
  },
  {
    key: 'performanceEnergy',
    category: 'character',
    labelKey: 'params.performanceEnergy',
    options: [
      { value: 'high_energy', labelKey: 'params.performanceEnergy.highEnergy' },
      { value: 'smooth_relaxed', labelKey: 'params.performanceEnergy.smoothRelaxed' },
      { value: 'emotional_intense', labelKey: 'params.performanceEnergy.emotionalIntense' },
      { value: 'playful', labelKey: 'params.performanceEnergy.playful' },
    ],
  },
  // ─── Editing (18-20) ───
  {
    key: 'cutPace',
    category: 'editing',
    labelKey: 'params.cutPace',
    options: [
      { value: 'fast', labelKey: 'params.cutPace.fast' },
      { value: 'medium', labelKey: 'params.cutPace.medium' },
      { value: 'slow', labelKey: 'params.cutPace.slow' },
      { value: 'match_bpm', labelKey: 'params.cutPace.matchBpm' },
    ],
  },
  {
    key: 'transitionStyle',
    category: 'editing',
    labelKey: 'params.transitionStyle',
    options: [
      { value: 'hard_cut', labelKey: 'params.transitionStyle.hardCut' },
      { value: 'crossfade', labelKey: 'params.transitionStyle.crossfade' },
      { value: 'whip_pan', labelKey: 'params.transitionStyle.whipPan' },
      { value: 'morph', labelKey: 'params.transitionStyle.morph' },
      { value: 'glitch', labelKey: 'params.transitionStyle.glitch' },
    ],
  },
  {
    key: 'lipSyncAmount',
    category: 'editing',
    labelKey: 'params.lipSyncAmount',
    options: [
      { value: 'full', labelKey: 'params.lipSyncAmount.full' },
      { value: 'chorus_only', labelKey: 'params.lipSyncAmount.chorusOnly' },
      { value: 'minimal', labelKey: 'params.lipSyncAmount.minimal' },
      { value: 'none', labelKey: 'params.lipSyncAmount.none' },
    ],
  },
];

export const PARAM_CATEGORIES = [
  { key: 'cinematography', labelKey: 'params.category.cinematography' },
  { key: 'visual_style', labelKey: 'params.category.visualStyle' },
  { key: 'narrative', labelKey: 'params.category.narrative' },
  { key: 'character', labelKey: 'params.category.character' },
  { key: 'editing', labelKey: 'params.category.editing' },
] as const;
