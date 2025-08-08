import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={inter.className} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
