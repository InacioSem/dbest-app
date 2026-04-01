'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { CREATIVE_PARAM_DEFINITIONS, PARAM_CATEGORIES } from '@shared/creativeParams';
import type { CreativeParameters } from '@shared/types';

interface CreativeParamsProps {
  values: Partial<CreativeParameters>;
  onChange: (params: Partial<CreativeParameters>) => void;
}

// Map shared option labelKeys to the actual JSON message keys.
// The shared definitions use keys like 'params.cameraMovement.slowPan'
// but the JSON messages use keys like 'params.cameraMovement.options.static'.
// We extract the last part of the shared labelKey and look it up in <paramKey>.options.<optionName>.
function getOptionMessageKey(optLabelKey: string): string {
  // 'params.cameraMovement.slowPan' -> ['params', 'cameraMovement', 'slowPan']
  const parts = optLabelKey.replace('params.', '').split('.');
  if (parts.length >= 2) {
    return `${parts[0]}.options.${parts[1]}`;
  }
  return optLabelKey;
}

export default function CreativeParams({ values, onChange }: CreativeParamsProps) {
  const t = useTranslations('params');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleSelect = (key: keyof CreativeParameters, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-3">
      {PARAM_CATEGORIES.map((cat) => {
        const params = CREATIVE_PARAM_DEFINITIONS.filter((p) => p.category === cat.key);
        const isOpen = openCategory === cat.key;
        const categoryKey = cat.labelKey.replace('params.', '');

        return (
          <div key={cat.key} className="rounded-xl border border-border-subtle overflow-hidden">
            <button
              onClick={() => setOpenCategory(isOpen ? null : cat.key)}
              className="w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <span className="font-[family-name:var(--font-heading)] text-sm font-semibold text-text-primary">
                {t(categoryKey)}
              </span>
              <motion.svg
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 text-text-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 space-y-5">
                    {params.map((param) => {
                      const paramBase = param.labelKey.replace('params.', '');

                      return (
                        <div key={param.key}>
                          <label className="block text-xs text-text-muted mb-2">
                            {t(`${paramBase}.label`)}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {param.options.map((opt) => {
                              const optKey = getOptionMessageKey(opt.labelKey);

                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => handleSelect(param.key, opt.value)}
                                  className={`
                                    px-3 py-1.5 rounded-lg text-xs transition-all duration-200
                                    ${values[param.key] === opt.value
                                      ? 'bg-accent-primary text-white shadow-md shadow-accent-glow'
                                      : 'glass glass-hover text-text-secondary'}
                                  `}
                                >
                                  {t.has(optKey) ? t(optKey) : opt.value.replace(/_/g, ' ')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
