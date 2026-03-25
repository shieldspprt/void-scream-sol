import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Historian Pickup - Seduce History's Greatest Minds",
  description: "Send pickup lines to historical figures! Will Cleopatra, Einstein, or Shakespeare roast you or flirt back?",
  keywords: ["pickup lines", "historian", "AI", "Cleopatra", "Einstein", "Shakespeare", "fun", "roast", "flirt"],
  authors: [{ name: "Historian Pickup" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Historian Pickup",
    description: "Seduce history's greatest minds with your best pickup lines!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Historian Pickup",
    description: "Seduce history's greatest minds with your best pickup lines!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
