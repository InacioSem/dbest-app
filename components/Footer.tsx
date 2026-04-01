'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function Footer() {
  const t = useTranslations('footer');
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & tagline */}
          <div className="text-center md:text-left">
            <Link href={`/${locale}`} className="inline-block">
              <span className="font-[family-name:var(--font-heading)] text-xl font-black">
                <span className="text-white">dbest</span>
                <span className="text-accent-secondary">.app</span>
              </span>
            </Link>
            <p className="text-text-muted text-sm mt-1">{t('tagline')}</p>
          </div>

          {/* Made with */}
          <p className="text-text-muted text-sm italic">
            {t('madeWith')}
          </p>

          {/* Copyright */}
          <p className="text-text-muted text-xs">
            {t('copyright', { year: String(year) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
