import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DesignSystemProvider } from '@zephyr/ui';
import type { ReactNode } from 'react';
import { colors } from '../config/colors';
import { siteConfig } from '../config/site';

const SofiaProSoft = localFont({
  src: './fonts/SofiaProSoftReg.woff2',
  variable: '--font-sofia-pro-soft',
  weight: '100 900',
});

const _SofiaProSoftMed = localFont({
  src: './fonts/SofiaProSoftMed.woff2',
  variable: '--font-sofia-pro-soft-med',
  weight: '100 900',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: colors.light.primary },
    { media: '(prefers-color-scheme: dark)', color: colors.dark.primary },
  ],
};

const _SofiaProSoftBold = localFont({
  src: './fonts/SofiaProSoftBold.woff2',
  variable: '--font-sofia-pro-soft-bold',
  weight: '100 900',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [...siteConfig.authors],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@zephyyrr',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/favicon/maskable_icon.png',
        color: colors.light.primary,
      },
    ],
  },
  manifest: 'site.webmanifest',
  verification: {
    google: 'your-google-site-verification',
    yandex: 'your-yandex-verification',
    me: ['your-personal-website'],
  },
};

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        href="/favicon/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <meta
        name="theme-color"
        content="#F85522"
        media="(prefers-color-scheme: light)"
      />
      <meta
        name="theme-color"
        content="#F85522"
        media="(prefers-color-scheme: dark)"
      />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Zephyr" />
      <link rel="manifest" href="/site.webmanifest" />
      <script
        defer
        src="https://analytics-umami.zephyyrr.in/script.js"
        data-website-id="fcacb118-4db6-446b-909f-0f95a3ccf0a3"
      />
    </head>
    <body
      className={`${SofiaProSoft.variable} min-h-screen font-sofiaProSoft antialiased`}
    >
      <DesignSystemProvider>{children}</DesignSystemProvider>
    </body>
  </html>
);

export default RootLayout;
