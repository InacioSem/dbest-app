'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const navLinks = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/processing`, label: t('processing') },
    { href: `/${locale}/storyboard`, label: t('storyboard') },
    { href: `/${locale}/gallery`, label: t('gallery') },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 group">
          <span className="font-[family-name:var(--font-heading)] text-2xl font-black tracking-tight">
            <span className="text-white group-hover:text-accent-primary transition-colors duration-200">
              dbest
            </span>
            <span className="text-accent-secondary">.app</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href={`/${locale}`}
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-sm font-semibold bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white border border-accent-primary/30 hover:border-accent-primary transition-all duration-200"
          >
            {t('createVideo')}
          </Link>
          <button className="px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-white hover:bg-white/5 transition-all duration-200">
            {t('signIn')}
          </button>
        </div>
      </div>
    </motion.header>
  );
}
