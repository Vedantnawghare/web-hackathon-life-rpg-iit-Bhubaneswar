import type { Metadata, Viewport } from "next";
import { Inter, Cinzel, Rajdhani } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AudioProvider } from "@/components/providers/audio-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://life-rpg-pi-silk.vercel.app"),
  alternates: {
    canonical: "https://life-rpg-pi-silk.vercel.app/",
  },
  title: {
    default: "Life RPG — Level Up Your Real Life",
    template: "%s | Life RPG",
  },
  description:
    "Transform your daily habits and real-world productivity into an immersive RPG progression system. Conquer daily quests, level up 5 core attributes, maintain streaks, and forge your legend.",
  keywords: [
    "Life RPG",
    "Productivity RPG",
    "Gamification",
    "Habit Tracker",
    "RPG Progression",
    "Level Up",
    "Daily Quests",
    "IIT Bhubaneswar",
    "Tech Zephyr",
  ],
  authors: [{ name: "Life RPG Guild" }],
  openGraph: {
    title: "Life RPG — Level Up Your Real Life",
    description:
      "Transform your daily habits and real-world productivity into an immersive RPG progression system.",
    url: "https://life-rpg-pi-silk.vercel.app/",
    siteName: "Life RPG",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Life RPG — Level Up Your Real Life",
    description:
      "Transform your daily habits and real-world productivity into an immersive RPG progression system.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${cinzel.variable} ${rajdhani.variable}`}>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-200 font-sans">
        <QueryProvider>
          <AudioProvider>{children}</AudioProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

