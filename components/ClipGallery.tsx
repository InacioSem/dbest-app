'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { GeneratedClip, Export } from '@shared/types';

interface ClipGalleryProps {
  clips: GeneratedClip[];
  exports: Export[];
  onDownload: (clipId: string) => void;
  onDownloadAll: () => void;
}

export default function ClipGallery({ clips, exports, onDownload, onDownloadAll }: ClipGalleryProps) {
  const t = useTranslations('gallery');
  const completedClips = clips.filter((c) => c.status === 'completed');

  if (completedClips.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">{t('noClips')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-heading)] text-xl text-text-primary">{t('title')}</h2>
        <button
          onClick={onDownloadAll}
          className="px-5 py-2.5 rounded-xl text-sm bg-accent-primary text-white hover:bg-accent-primary/80 transition-colors glow-purple font-[family-name:var(--font-heading)]"
        >
          {t('downloadAll')}
        </button>
      </div>

      {/* Export Formats */}
      {exports.length > 0 && (
        <div className="flex gap-3">
          {exports.map((exp) => (
            <a
              key={exp.id}
              href={exp.fileUrl}
              download
              className="px-4 py-2 rounded-lg text-xs glass glass-hover text-text-secondary transition-colors"
            >
              {exp.spec.aspectRatio} / {exp.spec.resolution}
            </a>
          ))}
        </div>
      )}

      {/* Clip Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {completedClips.map((clip, i) => (
          <motion.div
            key={clip.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl overflow-hidden glass group"
          >
            <div className="aspect-video bg-black relative">
              {clip.clipUrl && (
                <video
                  src={clip.clipUrl}
                  controls
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              )}
              <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-xs text-white font-mono">
                Shot {clip.storyboardShotIndex + 1}
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-xs text-text-muted">{clip.generationModel}</span>
              <button
                onClick={() => onDownload(clip.id)}
                className="px-3 py-1 rounded-lg text-xs bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 transition-colors"
              >
                {t('download')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
