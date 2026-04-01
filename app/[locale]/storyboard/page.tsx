'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import StoryboardTimeline from '@/components/StoryboardTimeline';
import type { StoryboardShot } from '@shared/types';
import { useState } from 'react';

// Demo data for development
const DEMO_SHOTS: StoryboardShot[] = [
  {
    index: 0,
    startTime: 0,
    endTime: 4.5,
    description: 'Opening aerial shot of city at dusk, lights flickering on',
    cameraMovement: 'drone',
    shotType: 'wide',
    mood: 'mysterious',
  },
  {
    index: 1,
    startTime: 4.5,
    endTime: 12,
    description: 'Artist walking through neon-lit street, camera tracking behind',
    cameraMovement: 'tracking',
    shotType: 'medium',
    mood: 'energetic',
    lyricSnippet: 'Walking through the city lights...',
  },
  {
    index: 2,
    startTime: 12,
    endTime: 24,
    description: 'Close-up of artist singing, dramatic lighting from side',
    cameraMovement: 'slow_pan',
    shotType: 'close_up',
    mood: 'emotional_intense',
    lyricSnippet: 'Every beat tells a story...',
  },
  {
    index: 3,
    startTime: 24,
    endTime: 36,
    description: 'Wide shot of artist on rooftop with city skyline behind',
    cameraMovement: 'dolly_zoom',
    shotType: 'wide',
    mood: 'triumphant',
  },
  {
    index: 4,
    startTime: 36,
    endTime: 48,
    description: 'Performance sequence with dancers, quick cuts synced to beat',
    cameraMovement: 'handheld',
    shotType: 'medium',
    mood: 'energetic',
    lyricSnippet: 'Feel the rhythm take control...',
  },
];

export default function StoryboardPage() {
  const t = useTranslations();
  const [shots, setShots] = useState<StoryboardShot[]>(DEMO_SHOTS);

  const handleApprove = async () => {
    // TODO: call API to approve storyboard and trigger clip generation
  };

  const handleRegenerateShot = async (index: number) => {
    // TODO: call API to regenerate a specific shot
  };

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-2 gradient-text">
            {t('storyboard.title')}
          </h1>
          <p className="text-text-muted">{t('storyboard.subtitle')}</p>
          <p className="text-text-secondary text-sm mt-2">
            {t('storyboard.shotCount', { count: shots.length })}
          </p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <StoryboardTimeline
            shots={shots}
            onReorder={(reordered) => setShots(reordered)}
            onRegenerateShot={handleRegenerateShot}
          />
        </motion.div>

        {/* Approve Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center mt-12"
        >
          <button
            onClick={handleApprove}
            className="px-10 py-4 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-lg text-white bg-accent-primary hover:bg-accent-primary/90 transition-all duration-300 glow-purple hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('storyboard.approve')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
