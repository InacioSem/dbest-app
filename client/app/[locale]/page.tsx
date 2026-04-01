'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import UploadZone from '@/client/components/UploadZone';
import ProjectTypeSelector from '@/client/components/ProjectTypeSelector';
import CreativeParams from '@/client/components/CreativeParams';
import type { ProjectType, Locale, CreativeParameters } from '@shared/types';
import { useState } from 'react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function HomePage() {
  const t = useTranslations();
  const [songFile, setSongFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [projectType, setProjectType] = useState<ProjectType>('music_video');
  const [songLanguage, setSongLanguage] = useState<Locale>('en');
  const [creativeParams, setCreativeParams] = useState<Partial<CreativeParameters>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const languageOptions: { code: Locale; label: string }[] = [
    { code: 'ht', label: 'Kreyol Ayisyen' },
    { code: 'fr', label: 'Francais' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Espanol' },
  ];

  const handleGenerate = async () => {
    if (!songFile) return;
    setIsSubmitting(true);
    // TODO: call createProject API
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative max-w-5xl mx-auto text-center"
        >
          <motion.p
            variants={item}
            className="text-accent-secondary font-semibold tracking-widest uppercase text-sm mb-4"
          >
            {t('hero.tagline')}
          </motion.p>
          <motion.h1
            variants={item}
            className="font-[family-name:var(--font-heading)] text-5xl md:text-7xl font-bold leading-tight mb-6 gradient-text-hero"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            variants={item}
            className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10"
          >
            {t('hero.subtitle')}
          </motion.p>
        </motion.div>
      </section>

      {/* Upload & Configuration Section */}
      <section className="max-w-5xl mx-auto px-4 pb-24 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold mb-2">
            {t('upload.title')}
          </h2>
          <p className="text-text-muted mb-6">{t('upload.subtitle')}</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Song Upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('upload.songLabel')}
              </label>
              <UploadZone
                accept={{ 'audio/*': ['.mp3', '.wav', '.flac'] }}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                onDrop={(files) => setSongFile(files[0] || null)}
                files={songFile ? [songFile] : []}
                helpText={t('upload.songHelp')}
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('upload.photosLabel')}
              </label>
              <UploadZone
                accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                onDrop={(files) => setPhotoFiles((prev) => [...prev, ...files].slice(0, 5))}
                files={photoFiles}
                helpText={t('upload.photosHelp')}
              />
            </div>
          </div>
        </motion.div>

        {/* Song Language Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t('upload.languageLabel')}
          </label>
          <p className="text-text-muted text-sm mb-3">{t('upload.languageHelp')}</p>
          <div className="flex gap-3 flex-wrap">
            {languageOptions.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSongLanguage(lang.code)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  songLanguage === lang.code
                    ? 'bg-accent-primary text-white glow-purple'
                    : 'glass glass-hover text-text-secondary'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Project Type Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {t('upload.projectTypeLabel')}
          </label>
          <ProjectTypeSelector selected={projectType} onSelect={setProjectType} />
        </motion.div>

        {/* Creative Parameters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <CreativeParams values={creativeParams} onChange={setCreativeParams} />
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center pt-4"
        >
          <button
            onClick={handleGenerate}
            disabled={!songFile || isSubmitting}
            className="relative px-12 py-4 rounded-2xl font-[family-name:var(--font-heading)] font-bold text-lg text-white bg-accent-primary hover:bg-accent-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 glow-purple hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? t('upload.uploading') : t('upload.submit')}
          </button>
        </motion.div>
      </section>
    </div>
  );
}
