"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, AlertCircle, Lock, Loader2, Sword, Check } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Character, CharacterCreatePayload } from "@/types/character";
import { HERO_LIST, HeroArchetype } from "@/lib/hero-data";
import { HeroCharacter } from "@/components/rpg/HeroCharacter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { audioManager } from "@/lib/audio-manager";
import { GAME_ASSETS } from "@/lib/game-assets";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const [selectedHeroId, setSelectedHeroId] = useState<string>("vanguard_male");
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("Novice Champion");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { session, loading: authLoading, isAuthenticated } = useAuth();

  // If user is already authenticated and has a character, redirect straight to dashboard
  const { data: character } = useQuery<Character>({
    queryKey: ["character", "me"],
    queryFn: () => apiClient<Character>("/characters/me"),
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (character) {
      router.push("/dashboard");
    }
  }, [character, router]);

  const handleSelectHero = (hero: HeroArchetype) => {
    setSelectedHeroId(hero.id);
    setTitle(hero.title);
    audioManager.playCoinSound();
  };

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !session?.access_token) {
      setError("Active authenticated session required. Please sign in first.");
      return;
    }

    if (!username.trim()) {
      setError("Please name your champion before awakening.");
      return;
    }

    setLoading(true);
    setError(null);

    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    const payload: CharacterCreatePayload = {
      username: username.trim(),
      title: title.trim(),
      timezone: userTimezone,
      hero_class: selectedHeroId,
    };

    try {
      await apiClient<Character>("/characters/me/onboarding", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      audioManager.playFanfare();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to initialize character. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking authentication session
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-amber-500/30">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
            Attuning to Adventurer Leyline...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated gate: prevents unauthenticated character creation requests
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold font-cinzel text-slate-100">
            Authentication Required
          </h2>
          <p className="text-xs text-slate-400 font-rajdhani">
            You must be signed in to perform the Awakening Ritual.
          </p>
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-bold font-cinzel transition-colors bg-amber-600 hover:bg-amber-500 text-slate-950 h-10 px-4 py-2"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  const selectedHero = HERO_LIST.find((h) => h.id === selectedHeroId) || HERO_LIST[0];

  return (
    <div className="relative min-h-screen text-slate-100 p-4 sm:p-8 flex flex-col items-center justify-center selection:bg-amber-500/30 overflow-hidden">
      {/* Real Fantasy Hero Awakening Chamber Environment */}
      <img
        src={GAME_ASSETS.backgrounds.heroSelect}
        alt="Hero Awakening Chamber"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[0.90] contrast-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/65 pointer-events-none z-0" />
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center gap-6">
        {/* Ritual Title */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-bold font-rajdhani flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> The Awakening Ritual
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500">
            CHOOSE YOUR HERO
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-rajdhani max-w-md mx-auto">
            Select your champion for the Realm of Ascension. Your hero will fight in the Arena and embody your real-life conquests.
          </p>
        </div>

        {/* 4 Hero Character Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {HERO_LIST.map((hero) => {
            const isSelected = selectedHeroId === hero.id;
            return (
              <motion.div
                key={hero.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectHero(hero)}
                className={cn(
                  "relative rounded-2xl border-2 p-4 flex flex-col items-center cursor-pointer transition-all duration-300 backdrop-blur-md",
                  isSelected
                    ? "bg-slate-900/90 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] ring-1 ring-amber-400"
                    : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 opacity-75 hover:opacity-100"
                )}
              >
                {/* Active Checkmark Pill */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}

                {/* Hero Vector Rig */}
                <div className="h-44 sm:h-52 flex items-center justify-center my-2">
                  <HeroCharacter
                    heroId={hero.id}
                    state={isSelected ? "READY" : "IDLE"}
                    size="sm"
                    showShadow={true}
                  />
                </div>

                {/* Hero Meta */}
                <div className="w-full text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 font-rajdhani">
                    {hero.gender === "male" ? "? Male Champion" : "? Female Champion"}
                  </span>
                  <h3 className="text-lg font-bold font-cinzel text-slate-100">
                    {hero.name}
                  </h3>
                  <span className="text-xs text-slate-400 font-rajdhani block">
                    {hero.archetype}
                  </span>

                  {/* Weapon Pill */}
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-amber-300 font-rajdhani font-semibold mt-1">
                    <Sword className="w-3 h-3 text-amber-400" />
                    {hero.weapon}
                  </div>

                  <p className="text-[11px] text-slate-400 font-rajdhani line-clamp-2 pt-2 leading-relaxed">
                    {hero.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Hero Identity Form & Awakening Button */}
        <form onSubmit={handleOnboarding} className="w-full max-w-md space-y-4">
          <div className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-amber-500/30">
            <div>
              <label htmlFor="username" className="block text-xs font-bold font-cinzel text-amber-300 mb-1">
                Name Your Champion
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ShadowValen, LadyAria"
                maxLength={30}
                required
                className="bg-slate-950 border-slate-700 text-white focus:border-amber-400 font-rajdhani text-sm"
              />
            </div>

            <div>
              <label htmlFor="title" className="block text-xs font-bold font-cinzel text-slate-400 mb-1">
                Champion Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                maxLength={50}
                className="bg-slate-950 border-slate-700 text-slate-300 font-rajdhani text-sm"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full h-11 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black font-cinzel text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Awakening {selectedHero.name}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Awaken {selectedHero.name}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
