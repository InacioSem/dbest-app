'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { GeneratedClip } from '@shared/types';

const EXPORT_FORMATS = [
  { label: '16:9', desc: 'YouTube / Landscape' },
  { label: '9:16', desc: 'TikTok / Reels' },
  { label: '1:1', desc: 'Instagram / Spotify' },
] as const;

// Demo clips for development
const DEMO_CLIPS: GeneratedClip[] = [
  {
    id: '1',
    projectId: 'demo',
    storyboardShotIndex: 0,
    clipUrl: '',
    platform: 'seedance',
    generationModel: 'seedance-1.1',
    generationCost: 0.12,
    status: 'completed',
    createdAt: new Date(),
  },
  {
    id: '2',
    projectId: 'demo',
    storyboardShotIndex: 1,
    clipUrl: '',
    platform: 'seedance',
    generationModel: 'seedance-1.1',
    generationCost: 0.15,
    status: 'completed',
    createdAt: new Date(),
  },
  {
    id: '3',
    projectId: 'demo',
    storyboardShotIndex: 2,
    clipUrl: '',
    platform: 'kling',
    generationModel: 'kling-2.0',
    generationCost: 0.18,
    status: 'completed',
    createdAt: new Date(),
  },
  {
    id: '4',
    projectId: 'demo',
    storyboardShotIndex: 3,
    clipUrl: '',
    platform: 'seedance',
    generationModel: 'seedance-1.1',
    generationCost: 0.12,
    status: 'generating',
    createdAt: new Date(),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

export default function GalleryPage() {
  const t = useTranslations();
  const [clips] = useState<GeneratedClip[]>(DEMO_CLIPS);
  const [selectedFormat, setSelectedFormat] = useState<string>('16:9');
  const [activeClip, setActiveClip] = useState<string | null>(null);

  const completedClips = clips.filter((c) => c.status === 'completed');

  return (
    <div className="min-h-screen px-4 py-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-2 gradient-text">
            {t('gallery.title')}
          </h1>
          <p className="text-text-muted">{t('gallery.subtitle')}</p>
        </motion.div>

        {/* Export Format Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-wrap gap-3 mb-8"
        >
          <span className="text-sm text-text-secondary self-center mr-2">
            {t('gallery.exportTo')}:
          </span>
          {EXPORT_FORMATS.map((fmt) => (
            <button
              key={fmt.label}
              onClick={() => setSelectedFormat(fmt.label)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedFormat === fmt.label
                  ? 'bg-accent-primary text-white glow-purple'
                  : 'glass glass-hover text-text-secondary'
              }`}
            >
              <span className="font-bold">{fmt.label}</span>
              <span className="ml-2 text-xs opacity-70">{fmt.desc}</span>
            </button>
          ))}
        </motion.div>

        {/* Clips Grid */}
        {completedClips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-text-muted text-lg">{t('gallery.noClips')}</p>
          </motion.div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {clips.map((clip) => (
              <motion.div
                key={clip.id}
                variants={item}
                className={`glass rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:border-white/20 ${
                  activeClip === clip.id ? 'selected-glow' : ''
                }`}
                onClick={() => setActiveClip(clip.id)}
              >
                {/* Video preview area */}
                <div className="aspect-video bg-white/5 relative flex items-center justify-center">
                  {clip.status === 'completed' ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent-primary/20 transition-all duration-300">
                        <svg
                          className="w-8 h-8 text-white/60 group-hover:text-white transition-colors"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <p className="text-text-muted text-xs">
                        {t('storyboard.shotLabel', { number: clip.storyboardShotIndex + 1 })}
                      </p>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-accent-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Card info */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary">
                      {t('storyboard.shotLabel', { number: clip.storyboardShotIndex + 1 })}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        clip.status === 'completed'
                          ? 'bg-success/20 text-success'
                          : 'bg-accent-primary/20 text-accent-primary'
                      }`}
                    >
                      {clip.status}
                    </span>
                  </div>
                  <p className="text-text-muted text-xs mt-1">{clip.generationModel}</p>

                  {clip.status === 'completed' && (
                    <button className="mt-3 w-full py-2 rounded-lg text-sm font-medium glass glass-hover text-text-secondary hover:text-white transition-all duration-200">
                      {t('gallery.download')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <button className="px-8 py-3 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-white bg-accent-primary hover:bg-accent-primary/90 transition-all duration-300 glow-purple hover:scale-[1.02] active:scale-[0.98]">
            {t('gallery.downloadAll')}
          </button>
          <button className="px-8 py-3 rounded-2xl font-[family-name:var(--font-heading)] font-bold glass glass-hover text-text-secondary hover:text-white transition-all duration-200">
            {t('gallery.share')}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
