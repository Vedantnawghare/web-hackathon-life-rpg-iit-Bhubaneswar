"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  Sword,
  Shield,
  Coins,
  ArrowRight,
  Sparkles,
  Zap,
  Trophy,
  Brain,
  Dumbbell,
  Compass,
  Heart,
  Palette,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCharacter, HeroCombatState } from "@/components/rpg/HeroCharacter";
import { HERO_CHAMPIONS, HeroArchetype } from "@/lib/hero-data";
import { GAME_ASSETS } from "@/lib/game-assets";
import { audioManager } from "@/lib/audio-manager";

interface DemoQuest {
  id: string;
  title: string;
  realm: string;
  category: "INT" | "STR" | "DIS" | "VIT" | "CRE";
  xp: number;
  damage: number;
  completed: boolean;
}

export default function LandingPage() {
  // Hero section protagonist switcher
  const heroKeys = ["vanguard_male", "rogue_male", "mage_female", "ranger_female"];
  const [selectedHeroId, setSelectedHeroId] = useState<string>("vanguard_male");
  const [heroActionState, setHeroActionState] = useState<HeroCombatState>("READY");

  // Interactive Quest Combat Loop Simulator
  const [bossHp, setBossHp] = useState<number>(750);
  const maxBossHp = 1000;
  const [combatNotice, setCombatNotice] = useState<string | null>(null);
  const [quests, setQuests] = useState<DemoQuest[]>([
    {
      id: "q1",
      title: "Morning 30-min Calisthenics & Strength",
      realm: "The Iron Grounds",
      category: "STR",
      xp: 60,
      damage: 250,
      completed: false,
    },
    {
      id: "q2",
      title: "Complete 2 DSA Algorithm Challenges",
      realm: "Mindpeak Spire",
      category: "INT",
      xp: 80,
      damage: 350,
      completed: false,
    },
    {
      id: "q3",
      title: "Drink 2.5L Water & Sleep 8 Hours",
      realm: "Springs of Vitalis",
      category: "VIT",
      xp: 40,
      damage: 150,
      completed: false,
    },
  ]);

  const activeHero: HeroArchetype = HERO_CHAMPIONS[selectedHeroId] || HERO_CHAMPIONS.vanguard_male;

  const handleHeroSelect = (id: string) => {
    setSelectedHeroId(id);
    setHeroActionState("ATTACK");
    try {
      audioManager.playSwordSlash();
    } catch {
      // Audio autoplay compliance fallback
    }
    setTimeout(() => {
      setHeroActionState("READY");
    }, 900);
  };

  const handleCompleteDemoQuest = (questId: string) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && !q.completed) {
          const newHp = Math.max(0, bossHp - q.damage);
          setBossHp(newHp);
          setCombatNotice(`⚔️ CRITICAL STRIKE! -${q.damage} DMG dealt to Void Archon! +${q.xp} XP!`);
          try {
            audioManager.playSwordSlash();
          } catch {
            // Audio autoplay compliance fallback
          }
          setHeroActionState("ATTACK_FINISHER");
          setTimeout(() => {
            setHeroActionState("READY");
          }, 1100);
          return { ...q, completed: true };
        }
        return q;
      })
    );
  };

  const handleResetDemo = () => {
    setBossHp(750);
    setCombatNotice(null);
    setQuests((prev) => prev.map((q) => ({ ...q, completed: false })));
  };

  return (
    <div className="min-h-screen bg-[#070c1d] text-slate-100 flex flex-col selection:bg-amber-500/40 font-sans overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. TOP GAME NAVIGATION */}
      {/* ========================================================================= */}
      <header className="h-16 sm:h-20 border-b border-amber-500/30 px-4 sm:px-8 flex items-center justify-between max-w-7xl mx-auto w-full backdrop-blur-xl bg-slate-950/75 sticky top-0 z-50 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-amber-500/30 via-orange-500/20 to-slate-950 border border-amber-400/60 flex items-center justify-center text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform">
            <Flame className="h-6 w-6 fill-amber-400/30 text-amber-300 animate-pulse" />
          </div>
          <div>
            <span className="font-black tracking-widest text-lg sm:text-xl uppercase font-display text-amber-50 block leading-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              Life RPG
            </span>
            <span className="text-[10px] font-mono tracking-widest text-amber-300/90 uppercase block font-bold">
              Adventure World
            </span>
          </div>
        </Link>

        {/* Center Quick Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-display text-xs lg:text-sm font-bold uppercase tracking-wider text-slate-200">
          <a href="#quests" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
            <Sword className="h-4 w-4 text-amber-400" />
            <span>Quests</span>
          </a>
          <a href="#world" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
            <Compass className="h-4 w-4 text-sky-400" />
            <span>World Map</span>
          </a>
          <a href="#heroes" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
            <Shield className="h-4 w-4 text-purple-400" />
            <span>4 Heroes</span>
          </a>
          <a href="#progression" className="hover:text-amber-300 transition-colors flex items-center gap-1.5 py-1">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span>Progression</span>
          </a>
        </nav>

        {/* Right CTA Action Buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-100 hover:text-white hover:bg-slate-800/80 font-sans font-bold text-xs sm:text-sm border border-slate-700/80"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="gold"
              size="sm"
              className="font-display font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] px-4 sm:px-5"
            >
              <span>Start Adventure</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. CINEMATIC HERO SECTION (FIRST VIEWPORT) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden border-b border-amber-500/20 px-4 sm:px-8 py-12 lg:py-16">
        {/* Real Fantasy Background Image */}
        <img
          src={GAME_ASSETS.backgrounds.home}
          alt="Life RPG Fantasy Realm Backdrop"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.06] contrast-[1.05] saturate-115"
        />

        {/* Luminous Multi-Tone Fantasy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#060a1c]/90 via-[#0d1436]/75 to-[#070c20]/85 pointer-events-none z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070c1d] via-transparent to-transparent pointer-events-none z-0" />

        {/* Floating Arcane Ambient Lighting Circles */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* ------------------------------------------------------------- */}
          {/* LEFT: Game Title, Punchy Game Copy & Immediate CTAs */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* Playful Game Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/25 via-amber-500/15 to-purple-500/25 border border-amber-400/60 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-200">
                Authoritative Browser RPG • Turn Habits into Stats
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <span className="text-amber-400 font-display font-black text-xl sm:text-2xl tracking-widest uppercase block drop-shadow-sm">
                LIFE RPG
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black font-display tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]">
                TURN YOUR REAL LIFE <br />
                <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(245,158,11,0.45)]">
                  INTO AN ADVENTURE
                </span>
              </h1>
            </div>

            {/* Punchy Game Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-indigo-100/95 max-w-xl font-medium leading-relaxed drop-shadow">
              &ldquo;Complete quests. Defeat bosses. Earn XP. Build your character.&rdquo;
            </p>

            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed font-sans">
              Transform daily routines into high-octane battle actions. Every workout, study session, and habit deals real damage to today&apos;s arena boss while raising your hero&apos;s stats.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full sm:w-auto gap-3 font-display font-black uppercase tracking-wider text-sm sm:text-base px-8 h-13 sm:h-14 shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:scale-105 transition-all"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto font-display font-bold uppercase tracking-wider text-xs sm:text-sm px-7 h-13 sm:h-14 border-2 border-amber-400/40 bg-slate-950/60 hover:bg-slate-900 text-amber-200 hover:text-white shadow-lg backdrop-blur-md"
                >
                  <span>Enter The Realm</span>
                </Button>
              </Link>
            </div>

            {/* Quick Game Highlights */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 w-full max-w-lg">
              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-rose-500/30 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold font-mono">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Real Damage</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">Habits strike arena bosses</p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-cyan-500/30 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold font-mono">
                  <Shield className="h-3.5 w-3.5" />
                  <span>4 Champions</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">Vanguard, Rogue, Mage, Huntress</p>
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/70 border border-emerald-500/30 backdrop-blur-md text-left">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                  <Coins className="h-3.5 w-3.5" />
                  <span>5 Territories</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">Intellect to Vitality realms</p>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* RIGHT: Large Prominent 3D/Rigged Hero Protagonist Showcase */}
          {/* ------------------------------------------------------------- */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            {/* Interactive Champion Switcher Tabs */}
            <div className="w-full max-w-sm mb-3 flex items-center justify-between p-1 rounded-xl bg-slate-950/80 border border-amber-500/40 backdrop-blur-md shadow-lg z-20">
              {heroKeys.map((key) => {
                const champ = HERO_CHAMPIONS[key];
                const isSelected = selectedHeroId === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleHeroSelect(key)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-display font-bold uppercase tracking-wider transition-all ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.5)] scale-105"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    {champ?.name || key}
                  </button>
                );
              })}
            </div>

            {/* Protagonist Display Box with Arcane Summoning Ring */}
            <div className="relative w-full max-w-md h-[400px] sm:h-[460px] rounded-2xl border-2 border-amber-500/40 bg-gradient-to-b from-[#111936]/80 via-[#0e1633]/90 to-[#070c20]/95 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] flex flex-col items-center justify-end p-6 overflow-hidden">
              {/* Arcane Rune Circle Aura */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Glowing Pedestal Summoning Ring */}
              <div className="absolute bottom-10 w-64 h-20 rounded-full border-2 border-amber-400/50 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-pulse" />
              <div className="absolute bottom-12 w-48 h-14 rounded-full border border-cyan-400/40 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]" />

              {/* Prominent Game Hero Figure */}
              <div className="relative z-10 mb-2 flex items-center justify-center">
                <HeroCharacter
                  heroId={selectedHeroId}
                  state={heroActionState}
                  size="xl"
                  showShadow={true}
                  username={activeHero.name}
                />
              </div>

              {/* Live Character Info Card Overlay */}
              <div className="relative z-20 w-full p-3.5 rounded-xl bg-slate-950/85 border border-amber-400/40 backdrop-blur-md shadow-lg flex items-center justify-between">
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-black text-sm text-amber-200">
                      {activeHero.name}
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                      Lvl 12
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans mt-0.5">
                    {activeHero.title} • {activeHero.weapon}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-cyan-300 block font-bold uppercase">
                    Signature Move
                  </span>
                  <span className="text-xs font-display font-black text-white">
                    {activeHero.signatureMove}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: ⚔️ DAILY QUESTS TO REAL-TIME ARENA BATTLES */}
      {/* ========================================================================= */}
      <section id="quests" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sword className="h-3.5 w-3.5" />
            <span>Interactive Game Concept</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            Complete Daily Habits → Strike Today&apos;s Boss
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            In Life RPG, productivity is never just a boring checklist. Completing real-world tasks triggers authoritative combat attacks in the arena against terrifying raid enemies.
          </p>
        </div>

        {/* Live Interactive Combat Simulation Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-[#0c1433]/90 via-[#0e173a]/80 to-[#090e24]/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)]">
          {/* Left: Quest Checklist Panel */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <span className="font-display font-bold text-base text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="h-4 w-4 text-amber-400" />
                Today&apos;s Active Guild Mandates
              </span>
              <button
                type="button"
                onClick={handleResetDemo}
                className="text-xs font-mono text-slate-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
              >
                Reset Demo
              </button>
            </div>

            <div className="space-y-3">
              {quests.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleCompleteDemoQuest(q.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    q.completed
                      ? "border-emerald-500/50 bg-emerald-950/30 text-slate-400 line-through opacity-75"
                      : "border-slate-700/80 bg-slate-900/80 hover:border-amber-400/60 hover:bg-slate-800/90 shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-all ${
                        q.completed
                          ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "border border-amber-400/50 bg-amber-500/10 text-amber-300"
                      }`}
                    >
                      {q.completed ? <CheckCircle2 className="h-5 w-5" /> : q.category}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-sm sm:text-base text-white">
                        {q.title}
                      </h4>
                      <p className="text-xs text-slate-300 font-sans">
                        {q.realm} • Deals <span className="text-rose-300 font-bold">-{q.damage} Boss DMG</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold whitespace-nowrap">
                      +{q.xp} XP
                    </span>
                    <Button
                      size="sm"
                      variant={q.completed ? "outline" : "gold"}
                      className="text-xs font-display uppercase tracking-wider"
                      disabled={q.completed}
                    >
                      {q.completed ? "Done" : "Strike"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {combatNotice && (
              <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/50 text-amber-200 text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{combatNotice}</span>
              </div>
            )}
          </div>

          {/* Right: Simulated Arena Boss Health & Feedback */}
          <div className="lg:col-span-5 p-6 rounded-2xl border border-rose-500/40 bg-slate-950/80 backdrop-blur-md shadow-xl flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/20 border border-rose-400/60 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]">
              <Flame className="h-7 w-7 fill-rose-500/30" />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                Arena Boss Raid
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-display text-white">
                Astral Void Archon
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Lvl 12 Dimensional Terror • Threat Level: Severe
              </p>
            </div>

            {/* Boss Health Bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold">
                <span className="text-rose-300">Boss HP</span>
                <span className="text-white">
                  {bossHp} / {maxBossHp}
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-900 rounded-full border border-slate-700/80 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-600 via-orange-500 to-amber-400 transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                  style={{ width: `${(bossHp / maxBossHp) * 100}%` }}
                />
              </div>
            </div>

            <div className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 text-left space-y-1 leading-relaxed">
              <p className="font-bold text-amber-200">💡 Direct Feedback Loop:</p>
              <p>
                Clicking tasks above proves how Life RPG translates discipline into visceral combat victories. Zero artificial grind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: 🗺️ THE 5 ASCENSION REALMS (WORLD EXPLORATION) */}
      {/* ========================================================================= */}
      <section id="world" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Compass className="h-3.5 w-3.5" />
            <span>5 Sovereign Territories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            The 5 Realms of Ascension
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Every aspect of your real life maps to an expansive fantasy territory. Complete tasks in specific life domains to claim territorial mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* Realm 1: Intellect */}
          <div className="group rounded-2xl border-2 border-sky-500/40 bg-[#0a122c]/90 overflow-hidden shadow-lg hover:border-sky-400 hover:shadow-[0_0_25px_rgba(14,165,233,0.35)] transition-all flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.mindpeak}
                alt="Mindpeak Spire"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a122c] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-lg bg-sky-500/30 border border-sky-400/60 text-sky-200 backdrop-blur-md">
                <Brain className="h-5 w-5" />
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-sky-300 bg-slate-950/80 px-2 py-0.5 rounded border border-sky-500/40">
                +120 XP Pool
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
                  Intellect Domain
                </span>
                <h3 className="text-lg font-black font-display text-white mt-0.5">
                  Mindpeak Spire
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Coding, reading, technical skill acquisition, research, and deep cognitive focus.
                </p>
              </div>
            </div>
          </div>

          {/* Realm 2: Strength */}
          <div className="group rounded-2xl border-2 border-rose-500/40 bg-[#160b1e]/90 overflow-hidden shadow-lg hover:border-rose-400 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] transition-all flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.ironCrags}
                alt="The Iron Grounds"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160b1e] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-lg bg-rose-500/30 border border-rose-400/60 text-rose-200 backdrop-blur-md">
                <Dumbbell className="h-5 w-5" />
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-rose-300 bg-slate-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                +100 XP Pool
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                  Strength Domain
                </span>
                <h3 className="text-lg font-black font-display text-white mt-0.5">
                  The Iron Grounds
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Strength training, calisthenics, athletic conditioning, endurance, and raw physical power.
                </p>
              </div>
            </div>
          </div>

          {/* Realm 3: Discipline */}
          <div className="group rounded-2xl border-2 border-emerald-500/40 bg-[#091817]/90 overflow-hidden shadow-lg hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition-all flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.discipline}
                alt="Sanctum of Discipline"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#091817] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-lg bg-emerald-500/30 border border-emerald-400/60 text-emerald-200 backdrop-blur-md">
                <Compass className="h-5 w-5" />
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                +150 XP Pool
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  Discipline Domain
                </span>
                <h3 className="text-lg font-black font-display text-white mt-0.5">
                  Sanctum of Discipline
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Daily streak preservation, punctuality, habit integrity, and iron willpower.
                </p>
              </div>
            </div>
          </div>

          {/* Realm 4: Vitality */}
          <div className="group rounded-2xl border-2 border-amber-500/40 bg-[#191408]/90 overflow-hidden shadow-lg hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.vitalis}
                alt="Springs of Vitalis"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#191408] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-lg bg-amber-500/30 border border-amber-400/60 text-amber-200 backdrop-blur-md">
                <Heart className="h-5 w-5" />
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-amber-300 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                +110 XP Pool
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Vitality Domain
                </span>
                <h3 className="text-lg font-black font-display text-white mt-0.5">
                  Springs of Vitalis
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Restorative sleep, hydration, wholesome nutrition, recovery, and holistic well-being.
                </p>
              </div>
            </div>
          </div>

          {/* Realm 5: Creativity */}
          <div className="group rounded-2xl border-2 border-purple-500/40 bg-[#150a25]/90 overflow-hidden shadow-lg hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] transition-all flex flex-col">
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={GAME_ASSETS.zones.arcanum}
                alt="The Arcanum"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#150a25] via-transparent to-transparent" />
              <div className="absolute top-3 left-3 p-2 rounded-lg bg-purple-500/30 border border-purple-400/60 text-purple-200 backdrop-blur-md">
                <Palette className="h-5 w-5" />
              </div>
              <span className="absolute bottom-2 right-3 text-[10px] font-mono font-bold text-purple-300 bg-slate-950/80 px-2 py-0.5 rounded border border-purple-500/40">
                +90 XP Pool
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                  Creativity Domain
                </span>
                <h3 className="text-lg font-black font-display text-white mt-0.5">
                  The Arcanum
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Creative writing, music, graphic design, architectural thought, and innovative invention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: 🧙 THE 4 PLAYABLE CHAMPIONS */}
      {/* ========================================================================= */}
      <section id="heroes" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <UserCheck className="h-3.5 w-3.5" />
            <span>4 Playable Champions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            Choose Your Legendary Avatar
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Select between 2 male and 2 female heroes, each boasting distinctive weapon rigging, signature moves, and tailored combat stances.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {heroKeys.map((key) => {
            const hero = HERO_CHAMPIONS[key];
            const isSelected = selectedHeroId === key;
            return (
              <div
                key={key}
                onClick={() => handleHeroSelect(key)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-400 bg-slate-900/90 shadow-[0_0_30px_rgba(245,158,11,0.35)] scale-102"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800/80 text-amber-300 border border-amber-500/30">
                      {hero.gender === "male" ? "♂ Male Hero" : "♀ Female Hero"}
                    </span>
                    <span className="text-xs font-mono text-cyan-300">
                      {hero.weaponType.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div className="h-44 w-full flex items-center justify-center relative overflow-hidden rounded-xl bg-gradient-to-b from-slate-900/50 to-slate-950/80 mb-4 border border-slate-800">
                    <div className="scale-75 origin-center">
                      <HeroCharacter heroId={key} state="READY" size="lg" showShadow={false} />
                    </div>
                  </div>

                  <h3 className="text-xl font-black font-display text-white">{hero.name}</h3>
                  <p className="text-xs text-amber-300 font-semibold">{hero.title}</p>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {hero.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Signature:</span>
                  <span className="text-white font-bold">{hero.signatureMove}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION: 🏆 AUTHORITATIVE PROGRESSION PIPELINE */}
      {/* ========================================================================= */}
      <section id="progression" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full relative">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Trophy className="h-3.5 w-3.5" />
            <span>Authoritative Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight">
            How The Progression Cycle Works
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
            Zero client-side spoofing. Every XP gain, level upgrade, and gold coin is verified by the backend engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <Sword className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">Step 01</span>
            <h3 className="text-lg font-bold font-display text-white mt-1">1. Quests & Habits</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Complete daily mandates and guild deeds mapped to your personal real-world goals.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4">
              <Flame className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-rose-400 font-bold uppercase">Step 02</span>
            <h3 className="text-lg font-bold font-display text-white mt-1">2. Arena Boss Damage</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your task completions automatically inflict heavy damage on the daily 3D arena boss.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <Coins className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Step 03</span>
            <h3 className="text-lg font-bold font-display text-white mt-1">3. XP & Gold Multipliers</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Maintain multi-day streaks to unlock up to a +30% XP bonus multiplier across every deed.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Step 04</span>
            <h3 className="text-lg font-bold font-display text-white mt-1">4. Guild Bazaar Relics</h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Spend gold to unlock cosmetic particle themes, hero titles, and ceremonial badges.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="p-8 sm:p-12 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-950/80 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6">
          <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase block">
            Your Campaign Awaits
          </span>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight leading-tight">
            Ready to Forge Your Life into a Legend?
          </h2>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl mx-auto font-sans leading-relaxed">
            Join adventurers who turned procrastination into real-time boss victories. Create your hero in less than 30 seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                variant="gold"
                size="lg"
                className="w-full sm:w-auto font-display font-black uppercase tracking-wider text-sm px-8 h-12 shadow-[0_0_25px_rgba(245,158,11,0.4)]"
              >
                <span>Create Character Now</span> <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="ghost"
                size="lg"
                className="w-full sm:w-auto text-slate-200 hover:text-white font-sans font-bold text-xs"
              >
                Existing Adventurer? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. COMPACT GAME FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-400 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span className="font-display font-bold text-slate-200">LIFE RPG</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300/90 font-medium">A SparkX Production</span>
          </div>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="text-slate-400 font-mono text-[11px]">© 2026 SparkX · Life RPG</span>
        </div>
        <div className="flex items-center gap-6 text-slate-300 font-mono">
          <Link href="/login" className="hover:text-amber-300 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="hover:text-amber-300 transition-colors">
            Signup
          </Link>
          <a href="#world" className="hover:text-amber-300 transition-colors">
            World
          </a>
          <a href="#heroes" className="hover:text-amber-300 transition-colors">
            Heroes
          </a>
        </div>
      </footer>
    </div>
  );
}
