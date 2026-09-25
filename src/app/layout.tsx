import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/Toast';
import { ToneProvider } from '@/components/ToneProvider';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'FlowFunds',
  description: 'Dark-first AI-powered personal finance tracker',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FlowFunds',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#5f259f',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ backgroundColor: '#0b071a', color: '#f5f7ff' }} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body style={{ backgroundColor: '#0b071a', color: '#f5f7ff', minHeight: '100vh', margin: 0 }}>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('dark');localStorage.setItem('theme','dark');`,
          }}
        />
        <SessionProvider>
          <ThemeProvider>
            <ToneProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </ToneProvider>
          </ThemeProvider>
        </SessionProvider>
        <Script id="sw-register" strategy="lazyOnload">
          {`if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`}
        </Script>
      </body>
    </html>
  );
}
