import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig = {
  // Serve the client directory as the app source
};

export default withNextIntl(nextConfig);
