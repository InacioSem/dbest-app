'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import type { ProjectType } from '@shared/types';
import { PROJECT_TYPE_DEFINITIONS } from '@shared/projectTypes';

const ICONS: Record<ProjectType, string> = {
  music_video: '🎬',
  lyric_video: '✍️',
  visualizer: '🌊',
  album_art: '🎨',
  social_teaser: '📱',
  spotify_canvas: '🟢',
};

interface ProjectTypeSelectorProps {
  selected: ProjectType;
  onSelect: (type: ProjectType) => void;
}

export default function ProjectTypeSelector({ selected, onSelect }: ProjectTypeSelectorProps) {
  const t = useTranslations('projectType');

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {PROJECT_TYPE_DEFINITIONS.map((def, i) => (
        <motion.button
          key={def.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(def.type)}
          className={`
            relative p-5 rounded-2xl text-left transition-all duration-300
            backdrop-blur-xl border
            ${selected === def.type
              ? 'bg-accent-primary/20 border-accent-primary selected-glow'
              : 'glass glass-hover'}
          `}
        >
          <div className="text-3xl mb-3">{ICONS[def.type]}</div>
          <h3 className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-primary mb-1">
            {t(def.labelKey.replace('projectType.', ''))}
          </h3>
          <p className="text-xs text-text-muted leading-relaxed">
            {t(def.descriptionKey.replace('projectType.', ''))}
          </p>
          {selected === def.type && (
            <motion.div
              layoutId="selected-type"
              className="absolute inset-0 rounded-2xl border-2 border-accent-primary pointer-events-none"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
}
