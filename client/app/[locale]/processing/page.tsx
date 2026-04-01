'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useJobStatus } from '@/client/hooks/useJobStatus';

const PIPELINE_STEPS = [
  { key: 'processingAudio', icon: '🎵' },
  { key: 'analyzingLyrics', icon: '📝' },
  { key: 'generatingStoryboard', icon: '🎬' },
  { key: 'awaitingApproval', icon: '✅' },
  { key: 'generatingClips', icon: '🎥' },
  { key: 'composing', icon: '🎞️' },
] as const;

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function ProcessingPage() {
  const t = useTranslations();
  const { status, progress, estimatedTime } = useJobStatus();

  const currentStepIndex = PIPELINE_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {t('processing.title')}
          </h1>
          <p className="text-text-muted">{t('processing.patience')}</p>
        </div>

        {/* Progress Bar */}
        <div className="glass rounded-2xl p-8 mb-8">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-8">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Pipeline Steps */}
          <div className="space-y-4">
            {PIPELINE_STEPS.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive ? 'glass-strong' : ''
                  }`}
                >
                  {/* Status dot */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? 'bg-success'
                          : isActive
                            ? 'bg-accent-primary pulse-dot'
                            : 'bg-white/20'
                      }`}
                    />
                  </div>

                  {/* Step icon */}
                  <span className="text-xl flex-shrink-0">{step.icon}</span>

                  {/* Step label */}
                  <span
                    className={`text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? 'text-text-primary'
                        : isCompleted
                          ? 'text-success'
                          : 'text-text-muted'
                    }`}
                  >
                    {t(`processing.status.${step.key}`)}
                  </span>

                  {/* Progress indicator for active step */}
                  {isActive && (
                    <motion.div
                      className="ml-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-accent-primary"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{
                              duration: 1.2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Checkmark for completed */}
                  {isCompleted && (
                    <span className="ml-auto text-success text-sm">&#10003;</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Estimated Time */}
        {estimatedTime > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-text-muted text-sm">
              {t('processing.estimatedTime')}
            </p>
            <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-accent-secondary mt-1">
              {formatTime(estimatedTime)}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
