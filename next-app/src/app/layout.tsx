import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Montserrat, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AdSenseScript, DEFAULT_AD_CONFIG } from "@/components/ads";
import { GoogleAnalytics } from '@next/third-parties/google';

// Ana font - UI ve Dashboard için optimize edilmiş
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

// Başlıklar için güçlü ve profesyonel
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Sayılar ve metrikler için monospace
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Traderlar.com - Trading Topluluğu",
  description: "Türkiye'nin en büyük trader topluluğuna hoş geldiniz. Stratejiler, analizler, tartışmalar ve profesyonel içerikler için doğru yerdesiniz.",
  keywords: "trading, trader, borsa, forex, kripto, strateji, analiz, topluluk",
  authors: [{ name: "Traderlar.com" }],
  openGraph: {
    title: "Traderlar.com - Trading Topluluğu",
    description: "Türkiye'nin en büyük trader topluluğuna hoş geldiniz.",
    url: "https://traderlar.com",
    siteName: "Traderlar.com",
    type: "website",
  },
};

import Navbar from "@/components/layout/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="tr" 
      className={`${plusJakartaSans.variable} ${montserrat.variable} ${jetbrainsMono.variable}`} 
      suppressHydrationWarning
    >
      <body className="antialiased font-jakarta">
        <AdSenseScript publisherId={DEFAULT_AD_CONFIG.publisherId} />
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
