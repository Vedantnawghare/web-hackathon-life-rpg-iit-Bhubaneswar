import Link from "next/link";
import {
  Flame,
  Sword,
  Shield,
  Coins,
  ArrowRight,
  Sparkles,
  Compass,
  Brain,
  Dumbbell,
  Heart,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/25 via-slate-950 to-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 font-sans">
      {/* Top Game Navigation */}
      <header className="h-16 border-b border-amber-500/20 px-4 sm:px-8 flex items-center justify-between max-w-7xl mx-auto w-full backdrop-blur-md bg-slate-950/60 sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-950/80 to-slate-950 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Flame className="h-5 w-5 fill-amber-400/30 animate-pulse" />
          </div>
          <div>
            <span className="font-black tracking-widest text-base uppercase font-display text-white block leading-tight">
              Life RPG
            </span>
            <span className="text-[9px] font-mono tracking-widest text-amber-400/90 uppercase block font-semibold">
              Adventure World
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white font-mono text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="gold" size="sm" className="font-display font-bold uppercase tracking-wider text-xs shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <span>Begin Adventure</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-20 max-w-5xl mx-auto relative overflow-hidden">
        {/* Arcane World Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Authoritative Real-World RPG Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-tight sm:leading-tight font-display">
          Forge Your Daily Habits into a{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]">
            Legendary Realm
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed font-sans">
          Conquer guild bounty contracts. Ascend the 5 territorial zones of Intellect, Strength, Discipline, Vitality, and Creativity. Preserve unstoppable streaks, earn authoritative gold, and unlock ceremonial relics.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button variant="gold" size="lg" className="gap-2 font-display font-bold uppercase tracking-wider text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] min-h-[48px] px-6">
              <span>Create Character</span> <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-slate-700 hover:border-amber-500/40 text-slate-200 font-mono text-xs min-h-[48px] px-6">
              Enter The Realm
            </Button>
          </Link>
        </div>

        {/* 5 Zones of Ascension Interactive Preview Cards */}
        <div className="mt-20 w-full text-left">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-amber-400 font-bold block">
              Geographical Progression
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white mt-1">
              The 5 Zones of Ascension
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Zone 1 */}
            <div className="p-4 rounded-xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 to-slate-950 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 w-fit mb-3">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 font-display">Mindpeak Spire</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Coding, reading, technical skill mastery, and deep intellectual study.
              </p>
            </div>

            {/* Zone 2 */}
            <div className="p-4 rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/30 to-slate-950 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 w-fit mb-3">
                <Dumbbell className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 font-display">The Iron Grounds</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Strength training, calisthenics, athletic conditioning, and raw stamina.
              </p>
            </div>

            {/* Zone 3 */}
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-950 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 w-fit mb-3">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 font-display">Sanctum of Discipline</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Daily streak maintenance, timely execution, and iron habit consistency.
              </p>
            </div>

            {/* Zone 4 */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-slate-950 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 w-fit mb-3">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 font-display">Springs of Vitalis</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Restorative sleep, hydration, nutrition, and whole-body vitality.
              </p>
            </div>

            {/* Zone 5 */}
            <div className="p-4 rounded-xl border border-purple-500/30 bg-gradient-to-b from-purple-950/30 to-slate-950 backdrop-blur-md">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 w-fit mb-3">
                <Palette className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-100 font-display">The Arcanum</h3>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Writing, music, visual design, architecture, and lateral creative breakthroughs.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 text-left w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 w-full">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Sword className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 font-display">Guild Bounty Notices</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Conquer Daily Mandates, Weekly Crusades, and One-Off Deeds across 4 rarity tiers.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 font-display">Authoritative Progression</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Zero client-side spoofing. Every XP point, level rollover, and gold transaction is server-verified.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
                <Flame className="h-5 w-5 fill-orange-400/30" />
              </div>
              <h3 className="font-bold text-slate-100 font-display">Dynamic Streak Multipliers</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Consecutive days unlock up to a +30% XP bonus multiplier across every cleared deed.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Coins className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-100 font-display">Guild Bazaar Relics</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Exchange hard-won gold for cosmetic themes, avatar crests, titles, and exclusive badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-16 border-t border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-500 max-w-7xl mx-auto w-full">
        <span className="font-mono">Life RPG &copy; 2026. Authoritative Productivity Engine.</span>
        <div className="flex items-center gap-4 font-mono">
          <Link href="/login" className="hover:text-amber-400 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-amber-400 transition-colors">
            Signup
          </Link>
        </div>
      </footer>
    </div>
  );
}
