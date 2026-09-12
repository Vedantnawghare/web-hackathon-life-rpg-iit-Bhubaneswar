import Link from "next/link";
import { Flame, Sword, Shield, Coins, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30">
      {/* Navigation */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="h-5 w-5 fill-amber-400/20" />
          </div>
          <span className="font-bold tracking-wider text-base uppercase">Life RPG</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="gold" size="sm">
              Begin Adventure
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Real-Life RPG Progression Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-3xl leading-tight sm:leading-tight">
          Turn Your Daily Habits Into an{" "}
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
            Epic RPG Quest
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Clear real-world quests. Level up your Strength, Intellect, Discipline, Vitality, and Creativity. Maintain daily streaks, earn authoritative Gold, and equip mythical Guild Shop cosmetics.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/signup">
            <Button variant="gold" size="lg" className="gap-2">
              Create Your Character <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Enter the Realm
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-left w-full">
          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Sword className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Daily Quests</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Log daily and weekly quests across 4 difficulty tiers: Easy, Medium, Hard, and Epic.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-200">5 Attributes</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Improve Strength, Intellect, Discipline, Vitality, and Creativity through targeted real-life actions.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Streak Bonuses</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Consecutive days unlock up to a +30% XP bonus multiplier on every completed quest.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Coins className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Guild Shop</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Spend authoritative Gold on virtual themes, avatar frames, titles, and exclusive badges.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-14 border-t border-slate-800/80 px-6 flex items-center justify-between text-xs text-slate-500 max-w-7xl mx-auto w-full">
        <span>Life RPG &copy; 2026. Authoritative Productivity Engine.</span>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-slate-300 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-slate-300 transition-colors">
            Signup
          </Link>
        </div>
      </footer>
    </div>
  );
}
