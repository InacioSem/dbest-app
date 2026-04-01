'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { Locale } from '@shared/types';

const LOCALE_MAP: Record<Locale, { flag: string; label: string }> = {
  ht: { flag: '🇭🇹', label: 'Kreyol' },
  fr: { flag: '🇫🇷', label: 'Francais' },
  en: { flag: '🇺🇸', label: 'English' },
  es: { flag: '🇪🇸', label: 'Espanol' },
};

const LOCALES: Locale[] = ['ht', 'fr', 'en', 'es'];

export default function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = (params?.locale as Locale) || 'en';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
    setIsOpen(false);
  };

  const current = LOCALE_MAP[currentLocale];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full glass glass-hover text-sm text-text-secondary hover:text-white transition-all duration-200"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline font-medium">{current.label}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 glass-strong rounded-xl overflow-hidden min-w-[160px] shadow-xl shadow-black/30"
          >
            {LOCALES.map((locale) => {
              const info = LOCALE_MAP[locale];
              const isActive = locale === currentLocale;
              return (
                <button
                  key={locale}
                  onClick={() => switchLocale(locale)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-accent-primary/20 text-white'
                      : 'text-text-secondary hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span>{info.flag}</span>
                  <span className="font-medium">{info.label}</span>
                  {isActive && (
                    <span className="ml-auto text-accent-primary text-xs">&#10003;</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
