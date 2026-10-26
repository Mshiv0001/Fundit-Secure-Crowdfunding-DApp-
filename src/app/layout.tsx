import type { Metadata } from 'next';
import './globals.css';
import { Web3Provider } from '@/context/Web3Context';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';

export const metadata: Metadata = {
  title: 'Fund It | Secure Quadratic Crowdfunding & Escrow Protocol',
  description: 'Enterprise-grade Web3 crowdfunding platform featuring milestone-based escrow payouts, pull-refund protection, and anti-whale quadratic DAO governance.',
  keywords: ['blockchain', 'crowdfunding', 'quadratic voting', 'escrow', 'smart contracts', 'ethereum', 'web3', 'DAO', 'fund it'],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" data-theme="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" type="image/png" href="/icon.png" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="bg-[var(--bg)] text-[var(--text)] antialiased min-h-screen relative transition-colors duration-300">
        <ThemeProvider>
          <CurrencyProvider>
            <Web3Provider>
              {/* Full Liquid Glass Ambient Background Refraction Layers */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                {/* Primary Theme Orb */}
                <div className="liquid-orb-1 absolute -top-[15%] -left-[10%] w-[750px] h-[750px] rounded-full blur-[140px] opacity-70" />

                {/* Success Theme Orb */}
                <div className="liquid-orb-2 absolute top-[25%] -right-[15%] w-[850px] h-[850px] rounded-full blur-[160px] opacity-60" />

                {/* Locked / Warm Accent Theme Orb */}
                <div className="liquid-orb-3 absolute bottom-[5%] left-[5%] w-[750px] h-[750px] rounded-full blur-[150px] opacity-55" />

                {/* Deep Ambient Fill Node */}
                <div className="liquid-orb-4 absolute top-[60%] right-[15%] w-[600px] h-[600px] rounded-full blur-[130px] opacity-50" />

                {/* Micro Caustic Grid Shimmer */}
                <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
              </div>

              {/* Main App Content on Glass Surface */}
              <div className="relative z-10 flex flex-col min-h-screen">
                {children}
              </div>
            </Web3Provider>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
