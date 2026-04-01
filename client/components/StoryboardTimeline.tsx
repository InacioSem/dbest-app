'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import type { StoryboardShot } from '@shared/types';

interface StoryboardTimelineProps {
  shots: StoryboardShot[];
  onReorder: (shots: StoryboardShot[]) => void;
  onRegenerateShot: (index: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function StoryboardTimeline({
  shots,
  onReorder,
  onRegenerateShot,
}: StoryboardTimelineProps) {
  const t = useTranslations('storyboard');
  const [expandedShot, setExpandedShot] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Horizontal scroll timeline (small screens) / vertical list */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border-subtle" />

        <div className="space-y-4">
          {shots.map((shot, i) => (
            <motion.div
              key={shot.index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <button
                onClick={() => setExpandedShot(expandedShot === i ? null : i)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-4 pl-2">
                  {/* Timeline node */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-accent-primary/20 border border-accent-primary flex items-center justify-center text-xs text-accent-primary font-[family-name:var(--font-heading)] font-bold flex-shrink-0">
                    {shot.index + 1}
                  </div>

                  {/* Shot card */}
                  <div className="flex-1 rounded-xl glass glass-hover p-4 transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-accent-secondary font-mono">
                        {formatTime(shot.startTime)} → {formatTime(shot.endTime)}
                      </span>
                      <span className="text-xs text-text-muted capitalize">{shot.mood}</span>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2">{shot.description}</p>
                  </div>
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedShot === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="ml-14 mt-2 overflow-hidden"
                  >
                    <div className="rounded-xl glass p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-text-muted">{t('mood')}:</span>{' '}
                          <span className="text-text-secondary capitalize">{shot.mood}</span>
                        </div>
                        <div>
                          <span className="text-text-muted">Camera:</span>{' '}
                          <span className="text-text-secondary capitalize">
                            {shot.cameraMovement} / {shot.shotType}
                          </span>
                        </div>
                      </div>

                      {shot.lyricSnippet && (
                        <p className="text-xs text-accent-secondary/70 italic">
                          &ldquo;{shot.lyricSnippet}&rdquo;
                        </p>
                      )}

                      <div className="flex gap-2 pt-1">
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium glass glass-hover text-text-secondary hover:text-white transition-all duration-200">
                          {t('edit')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRegenerateShot(shot.index);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 transition-all duration-200"
                        >
                          {t('regenerate')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
