// server/services/intelligence/demoData.ts
import type { LyricIntelligence, Storyboard } from '../../../shared/types/index.js';

export const demoLyricIntelligence: LyricIntelligence = {
  fullTranslation: "I love you so much, my heart beats for you. When I see you, everything becomes beautiful. You are the sun that lights up my life. Under the sky, I dance for you. My heart sings, this love will never end.",
  songNarrative: "A passionate Kompa love song about devotion and the transformative power of romantic love. The narrator describes how their beloved makes the world beautiful, comparing them to the sun. The chorus builds to a declaration that this love is eternal, set against imagery of dancing under Caribbean skies.",
  genreDetected: "Kompa",
  sections: [
    {
      sectionType: 'intro',
      timestampStart: '0:00',
      timestampEnd: '0:10',
      originalText: 'Mwen renmen ou anpil, kè mwen ap bat pou ou',
      englishTranslation: 'I love you so much, my heart beats for you',
      emotionalTone: 'romantic',
      energyLevel: 3,
      visualImagery: 'Soft morning light through sheer curtains, intimate close-up',
      culturalReferences: [],
      sceneDescription: 'Soft dawn light filters through white curtains. A silhouette stands by a window overlooking the ocean. Slow, dreamy atmosphere.',
      cameraSuggestion: 'Slow dolly in from wide to medium shot, shallow depth of field',
      colorMood: 'Warm golden',
    },
    {
      sectionType: 'verse',
      timestampStart: '0:10',
      timestampEnd: '0:30',
      originalText: 'Lè mwen wè ou, tout bagay vin bèl. Ou se solèy ki klere lavi mwen.',
      englishTranslation: 'When I see you, everything becomes beautiful. You are the sun that lights up my life.',
      emotionalTone: 'joyful',
      energyLevel: 5,
      visualImagery: 'Sunlight breaking through clouds, warm Caribbean colors, street scenes',
      culturalReferences: ['Haitian romantic poetry tradition'],
      sceneDescription: 'Artist walks through a vibrant Haitian street market at golden hour. Warm sunlight catches colorful fabrics and fruit stands. Genuine smiles from passersby.',
      cameraSuggestion: 'Tracking shot following artist from behind, then orbiting to reveal face',
      colorMood: 'Warm golden with vibrant accents',
    },
    {
      sectionType: 'chorus',
      timestampStart: '0:30',
      timestampEnd: '1:00',
      originalText: 'Anba syèl la, mwen danse pou ou. Kè mwen ap chante.',
      englishTranslation: 'Under the sky, I dance for you. My heart sings.',
      emotionalTone: 'euphoric',
      energyLevel: 8,
      visualImagery: 'Dancing under open sky, Caribbean sunset, freedom and joy',
      culturalReferences: ['Caribbean dance culture', 'Open-air celebration'],
      sceneDescription: 'Artist dances on a rooftop overlooking the city at sunset. Wide shot with dramatic Caribbean sky. Movement is fluid and joyful, matching the Kompa rhythm.',
      cameraSuggestion: 'Wide establishing shot, then drone orbit revealing the city below',
      colorMood: 'Sunset orange and purple',
    },
    {
      sectionType: 'verse',
      timestampStart: '1:00',
      timestampEnd: '1:20',
      originalText: 'lanmou sa a p ap janm fini',
      englishTranslation: 'This love will never end',
      emotionalTone: 'tender',
      energyLevel: 5,
      visualImagery: 'Intimate close-up, gentle touch, connection between two people',
      culturalReferences: ['Haitian diaspora longing'],
      sceneDescription: 'Intimate scene — artist sits on a porch, soft afternoon light. Close-up of hands, face in soft focus. Nostalgic and tender.',
      cameraSuggestion: 'Extreme close-up on face, rack focus to hands, back to eyes',
      colorMood: 'Soft warm amber',
    },
    {
      sectionType: 'chorus',
      timestampStart: '1:20',
      timestampEnd: '1:55',
      originalText: 'Lè mwen wè ou, tout bagay vin bèl. Ou se solèy ki klere lavi mwen.',
      englishTranslation: 'When I see you, everything becomes beautiful. You are the sun that lights up my life.',
      emotionalTone: 'euphoric',
      energyLevel: 9,
      visualImagery: 'Peak energy — dancing, celebration, confetti, full performance',
      culturalReferences: ['Kanaval energy'],
      sceneDescription: 'Full performance shot — artist singing directly to camera with passionate energy. Neon lights and motion blur in background. This is the emotional peak.',
      cameraSuggestion: 'Close-up on face (lip-sync shot), handheld slight movement for energy',
      colorMood: 'Neon vibrant with warm undertones',
    },
    {
      sectionType: 'bridge',
      timestampStart: '1:55',
      timestampEnd: '2:15',
      originalText: 'Anba syèl la, mwen danse pou ou',
      englishTranslation: 'Under the sky, I dance for you',
      emotionalTone: 'reflective',
      energyLevel: 7,
      visualImagery: 'Ocean, moonlight, solitary figure on beach',
      culturalReferences: ['Caribbean ocean imagery', 'Spiritual connection to nature'],
      sceneDescription: 'Artist stands alone on a moonlit beach. Waves gently crash. Wide shot with the figure small against the vast ocean and star-filled sky.',
      cameraSuggestion: 'Slow crane up from ground level, revealing the ocean expanse',
      colorMood: 'Cool midnight blue with silver moonlight',
    },
    {
      sectionType: 'chorus',
      timestampStart: '2:15',
      timestampEnd: '2:45',
      originalText: 'Kè mwen ap chante, lanmou sa a p ap janm fini',
      englishTranslation: 'My heart sings, this love will never end',
      emotionalTone: 'triumphant',
      energyLevel: 10,
      visualImagery: 'Final explosion — all visual themes converge',
      culturalReferences: ['Rara procession energy'],
      sceneDescription: 'Final chorus — intercut between rooftop performance, street celebration, and ocean. Fastest cuts of the video. Artist faces camera for final lip-sync delivery.',
      cameraSuggestion: 'Rapid intercutting between 3 locations, ending on extreme close-up of eyes',
      colorMood: 'Full spectrum — warm to cool to neon',
    },
    {
      sectionType: 'outro',
      timestampStart: '2:45',
      timestampEnd: '3:05',
      originalText: '',
      englishTranslation: '',
      emotionalTone: 'peaceful',
      energyLevel: 3,
      visualImagery: 'Fade, calm after the storm, sunrise',
      culturalReferences: [],
      sceneDescription: 'Slow fade. Artist walking away down the beach as sunrise begins. Small figure against golden light. Peaceful resolution.',
      cameraSuggestion: 'Static wide shot, slow fade to black',
      colorMood: 'Dawn gold fading to white',
    },
  ],
  overallColorPalette: ['#D4A574', '#FF6B35', '#7B2D8E', '#1A3C5E', '#F4E4C1'],
  visualStyleSuggestion: 'Warm cinematic Kompa aesthetic — Caribbean golden hour meets intimate studio performance, with dramatic sky-scapes for emotional peaks.',
};

export const demoStoryboard: Storyboard = {
  id: 'sb_demo',
  projectId: 'demo',
  shots: demoLyricIntelligence.sections.flatMap((section, sectionIdx) => {
    // Generate 2-3 shots per section for 15-20 total
    const shots = [];
    const sectionDuration = parseTimestamp(section.timestampEnd) - parseTimestamp(section.timestampStart);
    const numShots = sectionDuration > 20 ? 3 : 2;
    const shotDuration = sectionDuration / numShots;
    const sectionStart = parseTimestamp(section.timestampStart);

    for (let i = 0; i < numShots; i++) {
      const isPerformance = section.sectionType === 'chorus' && i === 0;
      shots.push({
        index: sectionIdx * 3 + i,
        timestampStart: sectionStart + (i * shotDuration),
        timestampEnd: sectionStart + ((i + 1) * shotDuration),
        sectionType: section.sectionType,
        lyrics: section.originalText || undefined,
        sceneDescription: section.sceneDescription,
        cameraDirection: section.cameraSuggestion,
        lightingDescription: `${section.colorMood} lighting`,
        moodKeywords: [section.emotionalTone, section.colorMood],
        generationPrompt: `@image1 ${section.sceneDescription}. ${section.cameraSuggestion}. Cinematic, professional music video.`,
        shotType: isPerformance ? 'performance' as const : (section.sectionType === 'intro' || section.sectionType === 'outro' ? 'environment' as const : 'broll' as const),
        requiresLipSync: isPerformance,
      });
    }
    return shots;
  }),
  lyricAnalysis: demoLyricIntelligence,
};

function parseTimestamp(ts: string): number {
  const [mins, secs] = ts.split(':').map(Number);
  return mins * 60 + secs;
}
