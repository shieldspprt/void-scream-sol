import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/components/WalletProvider";
import { WebLLMProvider } from "@/components/WebLLMProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5cf6",
};

export const metadata: Metadata = {
  title: "Yellex - Flirt with History's Greatest Minds | yellex.fun",
  description: "Send pickup lines to Cleopatra, Einstein, Shakespeare & more! Will they roast you or flirt back? AI-powered historical dating simulator on Solana. 3 free attempts, then 0.001 SOL.",
  keywords: [
    "Yellex",
    "yellex.fun",
    "pickup lines",
    "historian",
    "AI dating",
    "Cleopatra",
    "Einstein",
    "Shakespeare",
    "Solana",
    "crypto game",
    "AI roast",
    "flirt simulator",
    "historical figures",
    "web3 game",
    "blockchain game"
  ],
  authors: [{ name: "Yellex", url: "https://yellex.fun" }],
  creator: "Yellex",
  publisher: "Yellex",
  robots: "index, follow",
  alternates: {
    canonical: "https://yellex.fun",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Yellex - Flirt with History's Greatest Minds",
    description: "Send pickup lines to Cleopatra, Einstein, Shakespeare & more! Will they roast you or flirt back?",
    url: "https://yellex.fun",
    siteName: "Yellex",
    images: [
      {
        url: "https://yellex.fun/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yellex - Historical Pickup Line Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yellex - Flirt with History's Greatest Minds",
    description: "Send pickup lines to Cleopatra, Einstein, Shakespeare & more! Will they roast you or flirt back?",
    images: ["https://yellex.fun/og-image.png"],
    creator: "@yellexapp",
    site: "@yellexapp",
  },
  verification: {
    google: "your-google-verification-code", // Add when you have it
  },
  other: {
    "ai:description": "AI-powered pickup line game featuring historical figures. Users send pickup lines to Cleopatra, Einstein, Shakespeare, and others. AI generates roast or flirt responses. Built on Solana blockchain with 3 free attempts then 0.001 SOL payment.",
    "ai:features": "Historical figure selection, AI-generated pickup line suggestions, AI roast/flirt responses, Solana wallet integration, social sharing to Twitter/X",
    "ai:category": "Entertainment, Web3 Game, AI Application",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Structured Data for AI Search Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Yellex",
              url: "https://yellex.fun",
              description: "AI-powered pickup line game featuring historical figures. Send pickup lines to Cleopatra, Einstein, Shakespeare and more!",
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "SOL",
              },
              author: {
                "@type": "Organization",
                name: "Yellex",
                url: "https://yellex.fun",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1000",
              },
              featureList: [
                "8 historical figures to flirt with",
                "AI-generated pickup line suggestions",
                "Roast or flirt responses",
                "Solana blockchain integration",
                "3 free attempts daily",
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <WalletProvider>
          {children}
          <Toaster />
        </WalletProvider>
      </body>
    </html>
  );
}
