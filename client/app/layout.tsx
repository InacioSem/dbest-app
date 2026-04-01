import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'dbest.app — AI Music Video Generator',
  description:
    'Transform your songs and artist photos into stunning music videos with AI. Support for Kreyol, French, English, and Spanish.',
  metadataBase: new URL('https://dbest.app'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
