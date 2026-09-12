import type { Metadata } from "next";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life RPG — Level Up Your Real Life",
  description: "Transform your daily habits and real-world quests into an immersive RPG progression system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-200">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
