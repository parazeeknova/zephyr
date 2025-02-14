import type { ThemeProviderProps } from 'next-themes';
import ReactQueryProvider from './providers/query';
import { ThemeProvider } from './providers/theme';
import { VerificationProvider } from './providers/verification';
import { Toaster } from './shadui/toaster';

type DesignSystemProviderProperties = ThemeProviderProps;

export const DesignSystemProvider = ({
  children,
  ...properties
}: DesignSystemProviderProperties) => (
  <ReactQueryProvider>
    <ThemeProvider {...properties}>
      <VerificationProvider>{children}</VerificationProvider>
      <Toaster />
    </ThemeProvider>
  </ReactQueryProvider>
);
