import type { ThemeProviderProps } from 'next-themes';
import localFont from 'next/font/local';
import ReactQueryProvider from './providers/query';
import { ThemeProvider } from './providers/theme';
import { VerificationProvider } from './providers/verification';
import { Toaster } from './shadui/toaster';

export const SofiaProSoft = localFont({
  src: [
    { path: './fonts/SofiaProSoftReg.woff2', weight: '400', style: 'normal' },
    { path: './fonts/SofiaProSoftMed.woff2', weight: '500', style: 'normal' },
    { path: './fonts/SofiaProSoftBold.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-sofia-pro-soft',
  display: 'swap',
});

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ReactQueryProvider>
    <ThemeProvider {...properties}>
      <VerificationProvider>{children}</VerificationProvider>
      <Toaster position="bottom-right" containerClassName="mb-4 mr-4" />
    </ThemeProvider>
  </ReactQueryProvider>
);
