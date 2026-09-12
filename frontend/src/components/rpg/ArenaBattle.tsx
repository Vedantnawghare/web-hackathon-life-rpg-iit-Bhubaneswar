"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Character, DailyProgress } from "@/types/character";
import { HeroCharacter, HeroCombatState } from "@/components/rpg/HeroCharacter";
import { EnemySprite, EnemyBattleState, getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import { audioManager } from "@/lib/audio-manager";
import { getHeroArchetype } from "@/lib/hero-data";
import { GAME_ASSETS } from "@/lib/game-assets";
import { Button } from "@/components/ui/button";
import {
  Sword,
  Loader2,
  Shield,
  Swords,
  Skull,
  CheckCircle2,
  Circle,
  Play,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArenaBattleProps {
  character?: Character;
  quests: Quest[];
  dailyProgress?: DailyProgress;
  onCompleteQuest: (questId: string) => Promise<QuestCompleteResponse>;
  isCompleting?: boolean;
  onLevelUp?: (data: { oldLevel: number; newLevel: number; levelsGained: number }) => void;
  onSelectQuest?: (quest: Quest) => void;
  focusedQuestId?: string | null;
}

export function ArenaBattle({
  character,
  quests = [],
  onCompleteQuest,
  isCompleting = false,
  onLevelUp,
  focusedQuestId,
}: ArenaBattleProps) {
  // const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  // Showcase Demo Overrides
  const [demoHeroClass, setDemoHeroClass] = useState<string | null>(null);
  const activeHeroClass = demoHeroClass || character?.hero_class || "vanguard_male";

  // Filter available active quests
  const availableQuests = useMemo(() => {
    return quests.filter((q) => q.status === "ACTIVE");
  }, [quests]);

  const activeQuest = availableQuests[activeIndex] || availableQuests[0] || null;

  // Daily Tasks & Boss HP Calculation
  const totalDailyTasks = quests.length;
  const completedDailyTasks = useMemo(() => {
    return quests.filter((q) => q.is_completed_for_period).length;
  }, [quests]);

  // Target Daily Boss HP: 100 * (1 - completedDailyTasks / totalDailyTasks)
  const targetBossHp = useMemo(() => {
    if (totalDailyTasks === 0) return 100;
    return Math.max(0, Math.min(100, Math.round(100 * (1 - completedDailyTasks / totalDailyTasks))));
  }, [totalDailyTasks, completedDailyTasks]);

  // Combat States
  const [heroState, setHeroState] = useState<HeroCombatState>("IDLE");
  const [enemyState, setEnemyState] = useState<EnemyBattleState>("IDLE");
  const [enemyHp, setEnemyHp] = useState(targetBossHp);
  const [enemyTrailingHp, setEnemyTrailingHp] = useState(targetBossHp);
  const [heroHp, setHeroHp] = useState(100);
  const [heroTrailingHp, setHeroTrailingHp] = useState(100);
  // const [focusMeter, setFocusMeter] = useState(0);

  // Projectile Flight Animation State
  const [activeProjectile, setActiveProjectile] = useState<"arcane_orb" | "arrow" | "sword_arc" | "dual_slash" | null>(null);

  // Fighting Alerts & VFX
  const [combatAlert, setCombatAlert] = useState<string | null>(null);
  const [damageNumber, setDamageNumber] = useState<{ text: string; isCrit: boolean; isHero: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [redScreenFlash, setRedScreenFlash] = useState(false);

  // Battle Flow & Results
  const [isBattling, setIsBattling] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestCompleteResponse | null>(null);
  const [showLoot, setShowLoot] = useState(false);
  const [, setActionError] = useState<string | null>(null);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  // Synchronize Boss HP when target changes outside of active battle
  useEffect(() => {
    if (!isBattling) {
      setEnemyHp(targetBossHp);
      setEnemyTrailingHp(targetBossHp);
    }
  }, [targetBossHp, isBattling]);

  // Synchronize with external focusedQuestId from Daily Roadmap
  useEffect(() => {
    if (focusedQuestId) {
      const idx = availableQuests.findIndex((q) => q.id === focusedQuestId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [focusedQuestId, availableQuests]);

  // Clear timers on unmount or reset
  const clearAllBattleTimers = useCallback(() => {
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];
    intervalRefs.current.forEach((i) => clearInterval(i));
    intervalRefs.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearAllBattleTimers();
      if (audioManager.getCurrentTrack() === "battle") {
        audioManager.startAmbientMusic();
      }
    };
  }, [clearAllBattleTimers]);

  // Ensure ambient music plays while browsing
  useEffect(() => {
    if (!isBattling) {
      audioManager.startAmbientMusic();
    }
  }, [isBattling]);

  const heroArchetype = getHeroArchetype(activeHeroClass);
  const enemyInfo = activeQuest
    ? getEnemyArchetypeInfo(activeQuest.primary_attribute, activeQuest.difficulty)
    : getEnemyArchetypeInfo("STRENGTH", "MEDIUM");

  // Hero Attack Sound Launcher
  const triggerHeroAttackSound = useCallback(() => {
    const hid = activeHeroClass.toLowerCase();
    if (hid.includes("mage") || hid.includes("weaver") || hid.includes("lyra")) {
      audioManager.playMagicCast();
    } else if (hid.includes("ranger") || hid.includes("huntress") || hid.includes("aria") || hid.includes("bow")) {
      audioManager.playBowShot();
    } else if (hid.includes("rogue") || hid.includes("kaelen") || hid.includes("dual")) {
      audioManager.playDualBladeCombo();
    } else {
      // Valen Vanguard Solar Greatsword
      audioManager.playHeavySwordSlash();
    }
  }, [activeHeroClass]);

  // Hero Impact Sound Launcher (at visual contact)
  const triggerHeroImpactSound = useCallback(() => {
    const hid = activeHeroClass.toLowerCase();
    if (hid.includes("mage") || hid.includes("weaver") || hid.includes("lyra")) {
      audioManager.playMagicImpact();
    } else if (hid.includes("ranger") || hid.includes("huntress") || hid.includes("aria") || hid.includes("bow")) {
      audioManager.playArrowImpact();
    } else if (hid.includes("rogue") || hid.includes("kaelen") || hid.includes("dual")) {
      audioManager.playHitSound();
    } else {
      audioManager.playFinisherImpact();
    }
  }, [activeHeroClass]);

  // Choreographed Mini-Combat Scene (4-6 Seconds)
  const startCombatExchange = useCallback((data: QuestCompleteResponse, calculatedNewHp: number) => {
    clearAllBattleTimers();
    setIsBattling(true);
    setCompletedReward(data);
    setShowLoot(false);
    setDamageNumber(null);
    setCombatAlert(null);
    audioManager.startBattleMusic();

    const hid = activeHeroClass.toLowerCase();
    const isMage = hid.includes("mage") || hid.includes("lyra");
    const isRanger = hid.includes("ranger") || hid.includes("aria");
    const isRogue = hid.includes("rogue") || hid.includes("kaelen");

    // Damage amount per task
    const damageAmount = Math.max(1, enemyHp - calculatedNewHp);

    // PHASE 1: Hero Prepares & Enters Attack Stance (0.0s - 0.4s)
    setCombatAlert(`⚔️ ${heroArchetype.name} initiates ${heroArchetype.signatureMove}!`);
    setHeroState(isRogue ? "APPROACH" : "READY");

    // Launch Attack & Projectile (0.4s)
    const t0 = setTimeout(() => {
      triggerHeroAttackSound();
      setHeroState(isRogue ? "ATTACK_COMBO" : "ATTACK");

      if (isMage) {
        setActiveProjectile("arcane_orb");
      } else if (isRanger) {
        setActiveProjectile("arrow");
      } else if (isRogue) {
        setActiveProjectile("dual_slash");
      } else {
        setActiveProjectile("sword_arc");
      }
    }, 400);

    // PHASE 2: Visual Impact on Enemy (1.4s)
    const t1 = setTimeout(() => {
      setActiveProjectile(null);
      triggerHeroImpactSound();
      setScreenShake(true);
      setEnemyState("HIT");
      setEnemyHp(calculatedNewHp);
      setCombatAlert(`${damageAmount} DAMAGE DEALT!`);
      setDamageNumber({
        text: `-${damageAmount} HP`,
        isCrit: calculatedNewHp === 0,
        isHero: false,
      });

      // Trailing HP catches up
      setTimeout(() => setEnemyTrailingHp(calculatedNewHp), 350);
      setTimeout(() => setScreenShake(false), 280);
    }, 1400);

    // PHASE 3: Hero Recovers & Enemy Prepares Counter (2.2s)
    const t2 = setTimeout(() => {
      setHeroState("READY");
      setCombatAlert(null);
      setDamageNumber(null);

      if (calculatedNewHp > 0) {
        // Enemy is still alive: Counterattack initiated!
        setEnemyState("APPROACH");
        setCombatAlert(`⚠️ ${enemyInfo.name} COUNTERATTACKS!`);
      } else {
        // Enemy defeated: K.O. sequence
        setEnemyState("DEFEATED");
        audioManager.playDefeatSound();
        audioManager.playFanfare();
        setCombatAlert("★ ENEMY DEFEATED! ★");
        setShowLoot(true);

        if (data.has_leveled_up && onLevelUp) {
          audioManager.playLevelUpSound();
          onLevelUp({
            oldLevel: data.old_level,
            newLevel: data.new_level,
            levelsGained: data.levels_gained,
          });
        }
      }
    }, 2200);

    // PHASE 4: Enemy Counterattack Strike Lands (3.1s)
    const t3 = setTimeout(() => {
      if (calculatedNewHp > 0) {
        setEnemyState("ATTACK");

        // Precise sync at 450ms into claw strike
        const contactTimer = setTimeout(() => {
          audioManager.playEnemyAttack();
          setScreenShake(true);
          setRedScreenFlash(true);
          setHeroState("HIT");
          setHeroHp((prev) => Math.max(40, prev - 15));
          setDamageNumber({
            text: "-15 RESIST",
            isCrit: false,
            isHero: true,
          });

          setTimeout(() => setHeroTrailingHp((prev) => Math.max(40, prev - 15)), 350);
          setTimeout(() => setScreenShake(false), 300);
          setTimeout(() => setRedScreenFlash(false), 350);
        }, 400);
        timeoutRefs.current.push(contactTimer);
      }
    }, 3100);

    // PHASE 5: Combat Concludes & Enemy Remains Alive in Arena (4.6s)
    const t4 = setTimeout(() => {
      setHeroState("IDLE");
      setDamageNumber(null);
      setCombatAlert(null);

      if (calculatedNewHp > 0) {
        setEnemyState("IDLE");
        setCombatAlert(`✦ Boss HP: ${calculatedNewHp}/100 • Enemy Wounded!`);
        setIsBattling(false);
        audioManager.startAmbientMusic();

        // Clear alert after 2.5s
        setTimeout(() => setCombatAlert(null), 2500);
      } else {
        // Battle finished completely
        setTimeout(() => {
          setIsBattling(false);
          audioManager.startAmbientMusic();
        }, 3000);
      }
    }, 4600);

    timeoutRefs.current.push(t0, t1, t2, t3, t4);
  }, [
    activeHeroClass,
    enemyHp,
    heroArchetype,
    enemyInfo,
    triggerHeroAttackSound,
    triggerHeroImpactSound,
    clearAllBattleTimers,
    onLevelUp,
  ]);

  // Execute quest completion via API
  const handleExecuteQuest = async (quest: Quest) => {
    if (isBattling || isCompleting) return;
    setActionError(null);

    // Calculate new HP based on completing this task
    const damagePerTask = totalDailyTasks > 0 ? Math.round(100 / totalDailyTasks) : 25;
    const calculatedNewHp = completedDailyTasks + 1 >= totalDailyTasks ? 0 : Math.max(0, enemyHp - damagePerTask);

    try {
      const response = await onCompleteQuest(quest.id);
      startCombatExchange(response, calculatedNewHp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to claim victory. Check connection.";
      setActionError(msg);
    }
  };

  // Showcase Demo: Complete Next Task or Simulate
  const handleQuickDemoComplete = async () => {
    const nextIncomplete = availableQuests.find((q) => !q.is_completed_for_period);
    if (nextIncomplete) {
      await handleExecuteQuest(nextIncomplete);
    } else {
      // All done or simulated quick strike
      const simulatedResponse: QuestCompleteResponse = {
        quest_id: "demo",
        quest_title: "Hackathon Showcase Bounty",
        earned_xp: 150,
        earned_gold: 50,
        xp_multiplier: 1.0,
        attribute_increased: "STRENGTH",
        attribute_gain: 1,
        streak_extended: true,
        current_streak: (character?.current_streak || 1) + 1,
        has_leveled_up: false,
        old_level: character?.current_level || 1,
        new_level: character?.current_level || 1,
        levels_gained: 0,
        character: character || ({} as unknown as Character),
      };
      startCombatExchange(simulatedResponse, 0);
    }
  };

  // Showcase Demo: Reset Boss HP to 100
  const handleResetBossDemo = () => {
    clearAllBattleTimers();
    setIsBattling(false);
    setEnemyHp(100);
    setEnemyTrailingHp(100);
    setHeroHp(100);
    setHeroTrailingHp(100);
    setEnemyState("IDLE");
    setHeroState("IDLE");
    setActiveProjectile(null);
    setCombatAlert("✦ Daily Boss HP Reset to 100/100 for Demonstration!");
    audioManager.startAmbientMusic();
    setTimeout(() => setCombatAlert(null), 2500);
  };

  // Showcase Demo: Cycle Champion
  const handleCycleChampion = () => {
    const champions = ["vanguard_male", "rogue_male", "mage_female", "ranger_female"];
    const currentIdx = champions.indexOf(activeHeroClass);
    const nextClass = champions[(currentIdx + 1) % champions.length];
    setDemoHeroClass(nextClass);
    const heroInfo = getHeroArchetype(nextClass);
    setCombatAlert(`⚔️ Champion Switched: ${heroInfo.name} (${heroInfo.weapon})`);
    setTimeout(() => setCombatAlert(null), 2200);
  };

  return (
    <div className="relative w-full flex flex-col gap-5 select-none">
      {/* 1. TOP STATUS & SHOWCASE DEMO TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-bold">
            ⚔️
          </div>
          <div>
            <span className="text-xs font-cinzel font-black text-amber-200 tracking-wide uppercase block">
              Daily Boss Arena Encounter
            </span>
            <span className="text-[11px] font-rajdhani text-slate-400">
              Every completed task deals proportional damage to today&apos;s adversary
            </span>
          </div>
        </div>

        {/* Showcase Fast Controls for 90-180s Hackathon Video */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCycleChampion}
            disabled={isBattling}
            variant="outline"
            className="h-8 px-2.5 text-xs font-rajdhani border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/50 hover:text-cyan-200"
            title="Cycle Champion to preview all unique hero animations & projectiles"
          >
            <Swords className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            <span>Hero: {heroArchetype.name}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleQuickDemoComplete}
            disabled={isBattling}
            className="h-8 px-3 text-xs font-rajdhani font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <Play className="w-3.5 h-3.5 mr-1 fill-black" />
            <span>⚡ Strike Task</span>
          </Button>

          <Button
            size="sm"
            onClick={handleResetBossDemo}
            disabled={isBattling}
            variant="outline"
            className="h-8 px-2.5 text-xs font-rajdhani border-slate-700 text-slate-300 hover:bg-slate-800"
            title="Reset Daily Boss HP to 100"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span>Reset (100 HP)</span>
          </Button>
        </div>
      </div>

      {/* 2. THE MAIN REAL FANTASY ARENA STAGE */}
      <div
        className={cn(
          "relative w-full h-[480px] sm:h-[540px] rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-transform",
          screenShake && "animate-[bounce_0.2s_infinite]"
        )}
      >
        {/* Real Fantasy Arena Background Artwork */}
        <img
          src={GAME_ASSETS.backgrounds.arena}
          alt="Battle Arena Colosseum"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[0.95] contrast-[1.05]"
        />

        {/* Ambient Atmosphere Vignette (Does NOT cover the artwork) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/45 pointer-events-none z-0" />

        {/* Red Screen Flash on Player Damage */}
        {redScreenFlash && (
          <div className="absolute inset-0 bg-rose-600/25 pointer-events-none z-20 animate-pulse" />
        )}

        {/* ============================================================= */}
        {/* HUD LAYER: BOSS & HERO HEALTH BARS                            */}
        {/* ============================================================= */}
        <div className="relative z-30 p-4 sm:p-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Hero Vitality Gauge */}
            <div className="flex-1 max-w-xs sm:max-w-sm flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-rajdhani">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  {character?.username || "Hero"} ({heroArchetype.name})
                </span>
                <span className="font-mono font-bold text-slate-200">{heroHp} / 100 HP</span>
              </div>
              <div className="relative h-4 w-full rounded-full bg-slate-950/80 border border-cyan-500/50 overflow-hidden shadow-inner p-0.5">
                <motion.div
                  className="h-full rounded-full bg-cyan-400/30"
                  animate={{ width: `${heroTrailingHp}%` }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0.5 left-0.5 rounded-full bg-gradient-to-r from-cyan-600 to-sky-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                  animate={{ width: `${heroHp}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Center: Stage Emblem */}
            <div className="hidden sm:flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/70 border-2 border-amber-500/60 flex items-center justify-center shadow-lg">
                <Swords className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* Right: Daily Boss Health Gauge */}
            <div className="flex-1 max-w-xs sm:max-w-sm flex flex-col gap-1.5 items-end">
              <div className="flex items-center justify-between w-full text-xs font-rajdhani">
                <span className="font-mono font-bold text-rose-300">{enemyHp} / 100 HP</span>
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  {enemyInfo.name}
                  <Skull className="w-3.5 h-3.5 text-rose-500" />
                </span>
              </div>
              <div className="relative h-4 w-full rounded-full bg-slate-950/80 border border-rose-500/50 overflow-hidden shadow-inner p-0.5">
                <motion.div
                  className="h-full rounded-full bg-rose-400/30 ml-auto"
                  animate={{ width: `${enemyTrailingHp}%` }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0.5 right-0.5 rounded-full bg-gradient-to-l from-rose-600 to-amber-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]"
                  animate={{ width: `${enemyHp}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Combat Alert Text Banner */}
          <AnimatePresence>
            {combatAlert && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="self-center px-4 py-1.5 rounded-full bg-black/85 border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.4)] text-xs sm:text-sm font-cinzel font-black text-amber-300 tracking-wider text-center"
              >
                {combatAlert}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================= */}
        {/* COMBAT CHARACTERS & PROJECTILE ARENA STAGE (Z-10 / Z-20)     */}
        {/* ============================================================= */}
        <div className="relative z-10 w-full px-8 sm:px-16 flex items-end justify-between pb-8">
          {/* Left: Player Champion Sprite */}
          <div className="relative flex flex-col items-center">
            <HeroCharacter
              heroId={activeHeroClass}
              state={heroState}
              username={character?.username}
              size="lg"
            />

            {/* Floating Damage Number over Hero */}
            <AnimatePresence>
              {damageNumber && damageNumber.isHero && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -45, scale: 1.25 }}
                  exit={{ opacity: 0, y: -70 }}
                  className="absolute -top-12 z-30 font-display font-black text-lg text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,1)]"
                >
                  {damageNumber.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* =========================================================== */}
          {/* TRAVELING VISIBLE PROJECTILE & WEAPON SLICE ENTITIES        */}
          {/* =========================================================== */}
          <div className="absolute inset-x-24 bottom-24 h-32 pointer-events-none z-20 flex items-center">
            {/* Lyra: Arcane Orb Traveling Projectile */}
            {activeProjectile === "arcane_orb" && (
              <motion.div
                initial={{ x: 20, y: -10, opacity: 0, scale: 0.5 }}
                animate={{
                  x: [20, 240, 480],
                  y: [-10, -35, -5],
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1.4, 1.8],
                }}
                transition={{ duration: 0.95, ease: "easeInOut" }}
                className="absolute"
              >
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 animate-spin shadow-[0_0_35px_rgba(168,85,247,1)]" />
                  <div className="absolute -left-6 w-8 h-8 rounded-full bg-cyan-400/60 blur-sm animate-pulse" />
                  <div className="absolute -left-12 w-5 h-5 rounded-full bg-purple-500/40 blur-md" />
                </div>
              </motion.div>
            )}

            {/* Aria: Energy Arrow Traveling Projectile */}
            {activeProjectile === "arrow" && (
              <motion.div
                initial={{ x: 20, y: 5, opacity: 0, scale: 0.6 }}
                animate={{
                  x: [20, 260, 490],
                  y: [5, -12, 0],
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1.1, 1.3],
                }}
                transition={{ duration: 0.85, ease: "easeIn" }}
                className="absolute"
              >
                <div className="relative w-20 h-6 flex items-center">
                  <div className="w-5 h-5 rotate-45 bg-amber-300 shadow-[0_0_20px_rgba(245,158,11,1)]" />
                  <div className="w-16 h-1.5 bg-gradient-to-r from-transparent via-emerald-400 to-amber-300 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
                </div>
              </motion.div>
            )}

            {/* Valen: Sunfire Cleave Giant Golden Arc */}
            {activeProjectile === "sword_arc" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: 280 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.4, 1.7] }}
                transition={{ duration: 0.6 }}
                className="absolute"
              >
                <svg className="w-36 h-36 text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,1)]" viewBox="0 0 100 100">
                  <path d="M 15 85 A 50 50 0 0 1 85 15" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                </svg>
              </motion.div>
            )}

            {/* Kaelen: Volt Tempest Twin Cross Slices */}
            {activeProjectile === "dual_slash" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, x: 280 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.3, 1.6] }}
                transition={{ duration: 0.55 }}
                className="absolute"
              >
                <svg className="w-32 h-32 text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,1)]" viewBox="0 0 100 100">
                  <line x1="20" y1="20" x2="80" y2="80" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                  <line x1="80" y1="20" x2="20" y2="80" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
                </svg>
              </motion.div>
            )}
          </div>

          {/* Right: Daily Adversary Sprite with Fatigue */}
          <div className="relative flex flex-col items-center">
            <EnemySprite
              state={enemyState}
              attribute={activeQuest?.primary_attribute || "STRENGTH"}
              difficulty={activeQuest?.difficulty || "MEDIUM"}
              hp={enemyHp}
            />

            {/* Floating Damage Number over Enemy */}
            <AnimatePresence>
              {damageNumber && !damageNumber.isHero && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  animate={{ opacity: 1, y: -50, scale: 1.3 }}
                  exit={{ opacity: 0, y: -80 }}
                  className="absolute -top-12 z-30 font-display font-black text-xl text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,1)]"
                >
                  {damageNumber.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Victory Showcase Banner */}
        <AnimatePresence>
          {showLoot && completedReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(245,158,11,0.5)] mb-3">
                👑
              </div>
              <h3 className="text-2xl font-black font-cinzel text-amber-200">
                DAILY ENCOUNTER CLEARED!
              </h3>
              <p className="text-sm font-rajdhani text-slate-300 max-w-sm mt-1">
                All daily tasks conquered. Realm tranquility restored!
              </p>
              <div className="flex items-center gap-4 mt-4 px-5 py-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40">
                <span className="text-amber-400 font-bold font-mono">+{completedReward.earned_xp} XP</span>
                <span className="text-slate-600">|</span>
                <span className="text-yellow-400 font-bold font-mono">+{completedReward.earned_gold} GOLD</span>
                <span className="text-slate-600">|</span>
                <span className="text-rose-400 font-bold font-mono">{completedReward.current_streak} DAY STREAK</span>
              </div>
              <Button
                onClick={() => setShowLoot(false)}
                className="mt-6 bg-amber-500 hover:bg-amber-400 text-black font-cinzel font-bold px-6"
              >
                Claim Realm Spoils
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. TODAY'S BOSS & TASK MANIFEST CHECKLIST (Mental Model Communicator) */}
      <div className="w-full rounded-2xl bg-slate-950/95 border-2 border-amber-900/60 p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
          <div>
            <h4 className="text-base font-cinzel font-black text-amber-200 tracking-wide flex items-center gap-2">
              <span>Today&apos;s Boss Manifest: {enemyInfo.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-300 font-mono font-bold">
                {enemyHp} / 100 HP
              </span>
            </h4>
            <p className="text-xs font-rajdhani text-slate-400 mt-0.5">
              Complete each real-life task to strike and weaken the adversary.
            </p>
          </div>

          <div className="text-xs font-rajdhani font-bold px-3 py-1.5 rounded-lg bg-black/60 border border-amber-900/50 text-amber-300 self-start sm:self-auto">
            Tasks Completed: {completedDailyTasks} / {totalDailyTasks} ({100 - enemyHp}% Boss HP Depleted)
          </div>
        </div>

        {/* Task Checklist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quests.map((quest) => {
            const isDone = quest.is_completed_for_period;
            return (
              <div
                key={quest.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all",
                  isDone
                    ? "bg-emerald-950/20 border-emerald-500/40 text-slate-400 opacity-80"
                    : "bg-slate-900/80 border-amber-500/30 hover:border-amber-500/60 text-slate-200 shadow-md"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={cn("text-xs font-bold font-rajdhani truncate", isDone && "line-through text-slate-500")}>
                      {quest.title}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span>+{quest.base_xp} XP</span>
                      <span>•</span>
                      <span>+{quest.base_gold} Gold</span>
                      {quest.due_time && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">Due {quest.due_time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!isDone && (
                  <Button
                    size="sm"
                    disabled={isBattling || isCompleting}
                    onClick={() => handleExecuteQuest(quest)}
                    className="shrink-0 h-8 px-3 text-xs font-rajdhani font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-sm"
                  >
                    {isCompleting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Sword className="w-3.5 h-3.5 mr-1 fill-black" />
                        <span>Strike!</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
