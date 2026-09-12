"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Character, DailyProgress } from "@/types/character";
import { HeroCharacter, HeroCombatState } from "@/components/rpg/HeroCharacter";
import { EnemySprite, EnemyBattleState, getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import { ArenaBackground } from "@/components/rpg/ArenaBackground";
import { audioManager } from "@/lib/audio-manager";
import { getHeroArchetype } from "@/lib/hero-data";
import { Button } from "@/components/ui/button";
import {
  Sword,
  Sparkles,
  Coins,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Loader2,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  FastForward,
  Flame,
  Shield,
  Clock,
  Zap,
  Swords,
  Skull,
  Award,
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
  dailyProgress,
  onCompleteQuest,
  isCompleting = false,
  onLevelUp,
  onSelectQuest,
  focusedQuestId,
}: ArenaBattleProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  // Synchronize with external focusedQuestId from Daily Roadmap if provided
  useEffect(() => {
    if (focusedQuestId) {
      const idx = quests.findIndex((q) => q.id === focusedQuestId);
      if (idx !== -1) {
        setActiveIndex(idx);
      }
    }
  }, [focusedQuestId, quests]);

  // Combat States
  const [heroState, setHeroState] = useState<HeroCombatState>("IDLE");
  const [enemyState, setEnemyState] = useState<EnemyBattleState>("IDLE");
  const [enemyHp, setEnemyHp] = useState(100);
  const [enemyTrailingHp, setEnemyTrailingHp] = useState(100);
  const [heroHp, setHeroHp] = useState(100);
  const [heroTrailingHp, setHeroTrailingHp] = useState(100);
  const [focusMeter, setFocusMeter] = useState(0); // 0 to 100%
  const [roundTimer, setRoundTimer] = useState(99);

  // Dynamic Fighting Game Alerts
  const [combatAlert, setCombatAlert] = useState<string | null>(null);
  const [damageNumber, setDamageNumber] = useState<{ text: string; isCrit: boolean; isHero: boolean } | null>(null);
  const [combatClash, setCombatClash] = useState<"NONE" | "HERO_HIT" | "ENEMY_COUNTER" | "FINISHER">("NONE");
  const [screenShake, setScreenShake] = useState(false);

  // Battle Flow & Results
  const [isBattling, setIsBattling] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestCompleteResponse | null>(null);
  const [showLoot, setShowLoot] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Audio & Accessibility State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState("");

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const intervalRefs = useRef<NodeJS.Timeout[]>([]);

  // Filter available active quests
  const availableQuests = useMemo(() => {
    return quests.filter((q) => q.status === "ACTIVE" && !q.is_completed_for_period);
  }, [quests]);

  const activeQuest = availableQuests[activeIndex] || availableQuests[0] || null;

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
      audioManager.stopAllBgm();
    };
  }, [clearAllBattleTimers]);

  // Keep active index within bounds
  useEffect(() => {
    if (activeIndex >= availableQuests.length && availableQuests.length > 0) {
      setActiveIndex(0);
    }
  }, [availableQuests.length, activeIndex]);

  // Ensure ambient music plays while browsing
  useEffect(() => {
    if (!isBattling) {
      audioManager.startAmbientMusic();
    }
  }, [isBattling]);

  const heroArchetype = getHeroArchetype(character?.hero_class);
  const enemyInfo = activeQuest
    ? getEnemyArchetypeInfo(activeQuest.primary_attribute, activeQuest.difficulty)
    : null;

  // Trigger weapon attack sound based on hero class
  const playHeroAttackSound = useCallback(() => {
    const heroId = character?.hero_class || "";
    if (heroId.includes("assassin") || heroId.includes("rogue") || heroId.includes("dual")) {
      audioManager.playDualBladeCombo();
    } else if (heroId.includes("mage") || heroId.includes("mystic") || heroId.includes("sorcerer")) {
      audioManager.playMagicCast();
      setTimeout(() => audioManager.playMagicImpact(), 250);
    } else if (heroId.includes("ranger") || heroId.includes("hunter") || heroId.includes("bow")) {
      audioManager.playBowShot();
      setTimeout(() => audioManager.playHitSound(), 200);
    } else {
      audioManager.playSwordSlash();
      setTimeout(() => audioManager.playHitSound(), 180);
    }
  }, [character?.hero_class]);

  // Complete battle cleanup & result state
  const finishBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(false);
    setHeroState("IDLE");
    setEnemyState("IDLE");
    setEnemyHp(100);
    setEnemyTrailingHp(100);
    setHeroHp(100);
    setHeroTrailingHp(100);
    setFocusMeter(0);
    setRoundTimer(99);
    setDamageNumber(null);
    setCombatAlert(null);
    setCombatClash("NONE");
    setScreenShake(false);
    setShowLoot(false);

    // Crossfade back to calm ambient music
    audioManager.startAmbientMusic();

    // Trigger level up modal if leveled up
    if (data.has_leveled_up && onLevelUp) {
      audioManager.playLevelUpSound();
      onLevelUp({
        oldLevel: data.old_level,
        newLevel: data.new_level,
        levelsGained: data.levels_gained,
      });
    }

    // Trigger achievement sound if unlocked
    if (data.unlocked_achievements && data.unlocked_achievements.length > 0) {
      audioManager.playAchievementSound();
    }
  }, [clearAllBattleTimers, onLevelUp]);

  // 12-Second Choreographed Multi-Exchange Fighting Sequence
  const startBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(true);
    setCompletedReward(data);
    setShowLoot(false);
    setDamageNumber(null);
    setCombatAlert(null);
    setCombatClash("NONE");
    setEnemyHp(100);
    setEnemyTrailingHp(100);
    setHeroHp(100);
    setHeroTrailingHp(100);
    setFocusMeter(0);
    setRoundTimer(99);

    // Announce to screen readers
    setSrAnnouncement(
      `Combat initiated against ${enemyInfo?.name || "Encounter"}. Bounty: ${data.quest_title}. Reward: ${data.earned_xp} XP and ${data.earned_gold} Gold.`
    );

    // 0.0s - Switch to 128 BPM Battle Music & Initial Round Display
    audioManager.startBattleMusic();
    setHeroState("READY");
    setEnemyState("IDLE");
    setCombatAlert("ROUND 1... FIGHT!");

    // Timer countdown interval
    const timerInterval = setInterval(() => {
      setRoundTimer((prev) => Math.max(1, prev - 1));
    }, 1000);
    intervalRefs.current.push(timerInterval);

    if (shouldReduceMotion) {
      // Accessible reduced motion flow: quick strike and victory
      const t0 = setTimeout(() => {
        setHeroState("ATTACK");
        setEnemyState("HIT");
        playHeroAttackSound();
        setEnemyHp(0);
        setEnemyTrailingHp(0);
        setDamageNumber({ text: `-${data.earned_xp} XP!`, isCrit: true, isHero: false });
        setCombatAlert("K.O.!");
      }, 500);

      const t1 = setTimeout(() => {
        setHeroState("VICTORY");
        setEnemyState("DEFEATED");
        audioManager.playDefeatSound();
        audioManager.playFanfare();
        setShowLoot(true);
      }, 1500);

      const t2 = setTimeout(() => {
        finishBattleSequence(data);
      }, 4000);

      timeoutRefs.current.push(t0, t1, t2);
      return;
    }

    // EXCHANGE 1: Hero Approaches & First Rapid Combo (0.8s - 2.5s)
    const t1 = setTimeout(() => {
      setCombatAlert(null);
      setHeroState("APPROACH");
      setFocusMeter(25);
    }, 800);

    const t2 = setTimeout(() => {
      setHeroState("ATTACK_COMBO");
      playHeroAttackSound();
      setScreenShake(true);
      setCombatClash("HERO_HIT");
      setEnemyState("HIT");
      setEnemyHp(65);
      setCombatAlert("3-HIT COMBO!");
      setDamageNumber({
        text: `-${Math.round(data.earned_xp * 0.35)} DMG`,
        isCrit: false,
        isHero: false,
      });

      // Trailing HP bar catches up smoothly after 300ms
      setTimeout(() => setEnemyTrailingHp(65), 350);
      setTimeout(() => setScreenShake(false), 250);
    }, 1700);

    // EXCHANGE 2: Mutual Trade - Enemy Recovers, Lunges & Counter-Slams (3.0s - 4.8s)
    const t3 = setTimeout(() => {
      setCombatClash("NONE");
      setCombatAlert(null);
      setDamageNumber(null);
      setHeroState("READY");
      setEnemyState("APPROACH");
    }, 3000);

    const t4 = setTimeout(() => {
      setEnemyState("ATTACK");
      audioManager.playEnemyAttack();
      setScreenShake(true);
      setCombatClash("ENEMY_COUNTER");
      setHeroState("HIT");
      setHeroHp(75);
      setFocusMeter(70); // Counter attack charges hero's Super meter!
      setCombatAlert("COUNTER ATTACK!");
      setDamageNumber({
        text: "-250 RESIST",
        isCrit: false,
        isHero: true,
      });

      setTimeout(() => setHeroTrailingHp(75), 400);
      setTimeout(() => setScreenShake(false), 300);
    }, 3900);

    // EXCHANGE 3: Hero Rebounds, Focus Hits MAX! (5.2s - 6.2s)
    const t5 = setTimeout(() => {
      setCombatClash("NONE");
      setDamageNumber(null);
      setHeroState("READY");
      setEnemyState("IDLE");
      setFocusMeter(100);
      setCombatAlert("★ MAX FOCUS READY! ★");
    }, 5200);

    // EXCHANGE 4: Lethal Finisher Unleashed! (6.5s - 8.2s)
    const t6 = setTimeout(() => {
      setHeroState("ATTACK_FINISHER");
      audioManager.playFinisherImpact();
      setScreenShake(true);
      setCombatClash("FINISHER");
      setEnemyState("HIT");
      setEnemyHp(0);
      setCombatAlert("CRITICAL FINISHER!");
      setDamageNumber({
        text: `-${data.earned_xp} XP CRITICAL!`,
        isCrit: true,
        isHero: false,
      });

      setTimeout(() => setEnemyTrailingHp(0), 400);
      setTimeout(() => setScreenShake(false), 450);
    }, 6600);

    // EXCHANGE 5: K.O. & Enemy Defeat (8.4s - 9.8s)
    const t7 = setTimeout(() => {
      setCombatClash("NONE");
      setDamageNumber(null);
      setCombatAlert("K.O.!");
      setEnemyState("DEFEATED");
      audioManager.playDefeatSound();
    }, 8400);

    // EXCHANGE 6: Victory Fanfare & Reward Showcase (10.0s)
    const t8 = setTimeout(() => {
      setCombatAlert(null);
      setHeroState("VICTORY");
      audioManager.playFanfare();
      audioManager.playCoinSound();
      setShowLoot(true);
    }, 10000);

    timeoutRefs.current.push(t1, t2, t3, t4, t5, t6, t7, t8);
  }, [clearAllBattleTimers, shouldReduceMotion, enemyInfo?.name, playHeroAttackSound, finishBattleSequence]);

  // Skip battle shortcut
  const handleSkipBattle = () => {
    if (completedReward) {
      finishBattleSequence(completedReward);
    }
  };

  // Trigger quest completion with backend verification
  const handleEngageEncounter = async () => {
    if (!activeQuest || isCompleting || isBattling) return;
    setActionError(null);

    try {
      const response = await onCompleteQuest(activeQuest.id);
      startBattleSequence(response);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to complete quest bounty. Please try again.";
      setActionError(msg);
    }
  };

  // Mute / Unmute
  const toggleAudio = () => {
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    audioManager.setMuted(nextMute);
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden border-2 border-amber-900/60 bg-slate-950 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex flex-col select-none transition-transform duration-75",
        screenShake && "translate-x-1 -translate-y-1"
      )}
    >
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      {/* 1. AUTHENTIC FIGHTING GAME TOP HUD (Street Fighter / Frame-Fighter aesthetic) */}
      <div className="relative z-30 px-3 sm:px-6 pt-3 pb-2 bg-gradient-to-b from-black/90 via-slate-950/80 to-transparent backdrop-blur-md flex flex-col gap-2">
        {/* Authoritative Daily XP Goal Bar */}
        {dailyProgress && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-3 py-1 rounded-lg bg-black/60 border border-amber-900/40">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-[11px] font-bold font-cinzel text-amber-300">
                Daily Adventure Goal
              </span>
              <span className="text-[11px] font-rajdhani font-semibold text-slate-300">
                {dailyProgress.daily_xp_earned} / {dailyProgress.daily_xp_goal} XP
              </span>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
              <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    dailyProgress.is_goal_reached
                      ? "bg-gradient-to-r from-emerald-500 to-amber-400"
                      : "bg-gradient-to-r from-amber-600 to-amber-400"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${dailyProgress.progress_percentage}%` }}
                />
              </div>
              <span className="text-[10px] font-rajdhani font-bold text-amber-400 min-w-[32px]">
                {dailyProgress.progress_percentage}%
              </span>
            </div>

            {dailyProgress.is_goal_reached && (
              <span className="text-[10px] font-bold text-emerald-400 font-rajdhani uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ★ Day Goal Complete!
              </span>
            )}
          </div>
        )}

        {/* Dual Fighter HP Bars + Center Round Timer Emblem */}
        <div className="grid grid-cols-12 items-center gap-1 sm:gap-4 mt-1">
          {/* HERO HEALTH METER (Left) */}
          <div className="col-span-5 flex items-center gap-2">
            {/* Fighter Crest / Level Badge */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 border-amber-400 bg-gradient-to-br from-amber-600 via-amber-900 to-slate-950 flex items-center justify-center font-black text-xs sm:text-sm text-amber-200 font-cinzel shadow-[0_0_12px_rgba(245,158,11,0.5)]">
              {character?.current_level || 1}
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-black flex items-center justify-center">
                <Shield className="w-2 h-2 text-black fill-black" />
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-black text-xs sm:text-sm text-amber-100 font-cinzel tracking-wide truncate">
                  {character?.username || "Hero"} ({heroArchetype.name})
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400">
                  {heroHp} / 100
                </span>
              </div>

              {/* Segmented HP Bar with Delayed Trailing Damage Bar */}
              <div className="relative w-full h-3 sm:h-4 bg-slate-900 rounded border border-amber-900/60 overflow-hidden shadow-inner">
                {/* Delayed Trailing Red Bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-red-600/80 transition-all duration-700 ease-out"
                  style={{ width: `${heroTrailingHp}%` }}
                />
                {/* Active Health Bar */}
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${heroHp}%` }}
                />
                {/* Slash segments overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_19%,rgba(0,0,0,0.4)_20%)] bg-[length:20%_100%] pointer-events-none" />
              </div>

              {/* Super / Focus Meter */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black font-rajdhani text-amber-400 uppercase tracking-widest flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 text-amber-400" /> FOCUS
                </span>
                <div className="flex-1 h-1.5 bg-slate-950 rounded-full border border-amber-950 overflow-hidden">
                  <motion.div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      focusMeter >= 100
                        ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 animate-pulse"
                        : "bg-gradient-to-r from-blue-600 to-cyan-400"
                    )}
                    style={{ width: `${focusMeter}%` }}
                  />
                </div>
                {focusMeter >= 100 && (
                  <span className="text-[8px] font-black font-cinzel text-amber-300 animate-bounce">
                    MAX
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CENTER ROUND TIMER / VS EMBLEM */}
          <div className="col-span-2 flex flex-col items-center justify-center -mt-1">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-amber-500 via-amber-700 to-amber-950 border-2 border-amber-300 p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="font-black text-amber-300 font-rajdhani text-base sm:text-xl tracking-tight">
                    {isBattling ? roundTimer : 99}
                  </span>
                </div>
              </div>
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-400 font-cinzel tracking-widest uppercase mt-0.5">
              {isBattling ? "BATTLE" : "ENCOUNTER"}
            </span>
          </div>

          {/* ENEMY HEALTH METER (Right) */}
          <div className="col-span-5 flex items-center gap-2 justify-end">
            <div className="flex-1 flex flex-col gap-0.5 min-w-0 text-right">
              <div className="flex justify-between items-baseline flex-row-reverse">
                <span className="font-black text-xs sm:text-sm text-rose-100 font-cinzel tracking-wide truncate">
                  {enemyInfo ? enemyInfo.name : "Wild Encounter"}
                </span>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-rose-400">
                  {enemyHp} / 100
                </span>
              </div>

              {/* Segmented HP Bar with Delayed Trailing Damage Bar (Right-aligned) */}
              <div className="relative w-full h-3 sm:h-4 bg-slate-900 rounded border border-rose-900/60 overflow-hidden shadow-inner">
                {/* Delayed Trailing Red Bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-red-600/80 transition-all duration-700 ease-out"
                  style={{ width: `${enemyTrailingHp}%` }}
                />
                {/* Active Health Bar */}
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l from-rose-600 via-red-500 to-amber-500 transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  style={{ width: `${enemyHp}%` }}
                />
                {/* Slash segments overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_19%,rgba(0,0,0,0.4)_20%)] bg-[length:20%_100%] pointer-events-none" />
              </div>

              {/* Archetype & Difficulty Badge */}
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                {activeQuest && (
                  <span className="text-[9px] font-bold font-rajdhani text-rose-400 uppercase tracking-wider">
                    {activeQuest.primary_attribute} • {activeQuest.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Enemy Skull Crest */}
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg border-2 border-rose-500 bg-gradient-to-br from-rose-700 via-rose-950 to-slate-950 flex items-center justify-center font-black text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
              <Skull className="w-5 h-5 text-rose-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. LIVING ARENA BATTLEGROUND */}
      <div className="relative w-full h-[330px] sm:h-[400px] overflow-hidden flex items-end justify-between px-6 sm:px-20 pb-8">
        {/* Layered Fantasy Environment Backdrop (Ref Images 2 & 3) */}
        <ArenaBackground attribute={activeQuest?.primary_attribute} />

        {/* Dynamic Combat Alerts ("ROUND 1... FIGHT!", "3-HIT COMBO!", "K.O.!") */}
        <AnimatePresence>
          {combatAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ opacity: 1, scale: 1.1, y: 0 }}
              exit={{ opacity: 0, scale: 1.4 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              className="absolute z-40 inset-x-0 top-1/4 flex justify-center pointer-events-none"
            >
              <div className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600/90 via-red-600/90 to-amber-600/90 border-2 border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.8)] backdrop-blur-md">
                <span className="font-black font-cinzel text-xl sm:text-3xl text-yellow-100 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  {combatAlert}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Clash Screen Flare */}
        <AnimatePresence>
          {combatClash !== "NONE" && (
            <motion.div
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "absolute inset-0 z-20 pointer-events-none",
                combatClash === "FINISHER"
                  ? "bg-amber-300/50"
                  : combatClash === "ENEMY_COUNTER"
                  ? "bg-rose-600/40"
                  : "bg-white/40"
              )}
            />
          )}
        </AnimatePresence>

        {/* Floating Combat Damage Numbers */}
        <AnimatePresence>
          {damageNumber && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.6 }}
              animate={{ opacity: 1, y: -50, scale: damageNumber.isCrit ? 1.4 : 1.1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className={cn(
                "absolute z-40 top-1/3 font-black font-rajdhani pointer-events-none tracking-tight",
                damageNumber.isHero ? "left-1/4 text-rose-400 drop-shadow-[0_4px_12px_rgba(244,63,94,0.9)]" : "right-1/4 text-yellow-300 drop-shadow-[0_4px_12px_rgba(234,179,8,0.9)]",
                damageNumber.isCrit ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              )}
            >
              {damageNumber.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT FIGHTER: Hero Character (Ground aligned with depth shadow) */}
        <div className="relative z-20 flex flex-col items-center">
          <HeroCharacter
            heroId={character?.hero_class || "vanguard_male"}
            state={heroState}
            equippedTheme={character?.equipped_theme}
            username={character?.username}
            size="lg"
          />
          {/* Ground Contact Shadow */}
          <div className="w-28 sm:w-36 h-4 -mt-2 bg-black/60 rounded-full blur-sm" />
        </div>

        {/* CENTER BOUNTY CARD & NOTICE (When idle) */}
        {activeQuest && !isBattling && (
          <div className="relative z-20 max-w-[240px] sm:max-w-xs px-4 py-3 rounded-xl bg-slate-950/85 border border-amber-500/50 backdrop-blur-md shadow-2xl text-center hidden md:flex flex-col items-center gap-1.5 mb-10">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-rajdhani flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5 text-amber-400" /> Active Bounty Contract
            </span>
            <h4 className="text-sm font-bold text-slate-100 font-cinzel line-clamp-2">
              {activeQuest.title}
            </h4>
            {activeQuest.due_time && (
              <span className="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {activeQuest.due_time}
              </span>
            )}
            <div className="flex items-center gap-3 text-xs font-rajdhani font-bold text-amber-300 pt-1 border-t border-amber-900/40 w-full justify-center">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> +{activeQuest.base_xp} XP
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-400" /> +{activeQuest.base_gold} Gold
              </span>
            </div>
          </div>
        )}

        {/* RIGHT FIGHTER: Enemy Archetype (Ground aligned with depth shadow) */}
        <div className="relative z-20 flex flex-col items-center">
          {activeQuest && enemyInfo ? (
            <>
              <EnemySprite
                state={enemyState}
                attribute={activeQuest.primary_attribute}
                difficulty={activeQuest.difficulty}
                name={enemyInfo.name}
              />
              {/* Ground Contact Shadow */}
              <div className="w-28 sm:w-36 h-4 -mt-2 bg-black/60 rounded-full blur-sm" />
            </>
          ) : (
            <div className="w-36 h-48 sm:w-44 sm:h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-black/50 text-center p-4">
              <Trophy className="w-10 h-10 text-amber-500/40 mb-2" />
              <span className="text-xs font-cinzel text-slate-400">All Bounties Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. AUTHENTIC VICTORY REWARDS REVEAL (Ref Image 3: Frame-Fighter / RPG Victory Screen) */}
      <AnimatePresence>
        {showLoot && completedReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 30 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative max-w-md w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500 shadow-[0_0_60px_rgba(245,158,11,0.4)] text-center flex flex-col items-center gap-4"
            >
              <button
                onClick={() => finishBattleSequence(completedReward)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close victory report"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Golden Laurel Victory Crest */}
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border-2 border-yellow-200 flex items-center justify-center shadow-[0_0_30px_rgba(234,179,8,0.7)] animate-pulse">
                  <Award className="w-10 h-10 sm:w-12 sm:h-12 text-slate-950" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-black font-rajdhani tracking-widest text-amber-400 uppercase">
                  Encounter Overcome
                </span>
                <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
                  VICTORY ACHIEVED!
                </h3>
                <p className="text-xs text-slate-300 font-rajdhani">
                  Deed Fulfilled: <span className="text-white font-bold">{completedReward.quest_title}</span>
                </p>
              </div>

              {/* Reward Showcase Badges */}
              <div className="grid grid-cols-3 gap-2 w-full my-2">
                <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-500/50 flex flex-col items-center justify-center gap-1 shadow-md">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-sm sm:text-base font-black font-rajdhani text-amber-300">
                    +{completedReward.earned_xp}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-cinzel">XP</span>
                </div>

                <div className="p-3 rounded-xl bg-yellow-950/70 border border-yellow-500/50 flex flex-col items-center justify-center gap-1 shadow-md">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm sm:text-base font-black font-rajdhani text-yellow-300">
                    +{completedReward.earned_gold}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-cinzel">GOLD</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/70 border border-purple-500/50 flex flex-col items-center justify-center gap-1 shadow-md">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-sm sm:text-base font-black font-rajdhani text-purple-300">
                    +{completedReward.attribute_gain}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-cinzel truncate max-w-full">
                    {completedReward.attribute_increased}
                  </span>
                </div>
              </div>

              {/* Level Up Notice if Applicable */}
              {completedReward.has_leveled_up && (
                <div className="w-full px-4 py-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold font-cinzel flex items-center justify-center gap-2 animate-bounce">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  LEVEL UP! Reached Level {completedReward.new_level}!
                </div>
              )}

              {/* Continue Expedition Button */}
              <Button
                onClick={() => finishBattleSequence(completedReward)}
                className="w-full h-11 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black font-cinzel text-sm sm:text-base tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              >
                Claim Spoils & Advance
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BOTTOM COMMAND ACTION BAR */}
      <div className="relative z-30 px-4 py-3 bg-slate-950/95 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Bounty Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={activeIndex === 0 || isBattling}
            onClick={() => {
              const newIdx = Math.max(0, activeIndex - 1);
              setActiveIndex(newIdx);
              if (availableQuests[newIdx]) onSelectQuest?.(availableQuests[newIdx]);
            }}
            className="h-8 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-rajdhani font-semibold text-slate-300 min-w-[75px] text-center">
            {availableQuests.length > 0
              ? `${activeIndex + 1} of ${availableQuests.length} Bounties`
              : "0 Bounties"}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={activeIndex >= availableQuests.length - 1 || isBattling}
            onClick={() => {
              const newIdx = Math.min(availableQuests.length - 1, activeIndex + 1);
              setActiveIndex(newIdx);
              if (availableQuests[newIdx]) onSelectQuest?.(availableQuests[newIdx]);
            }}
            className="h-8 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Primary Engagement Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isBattling && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkipBattle}
              className="h-9 px-3 border-amber-700/60 bg-slate-900/80 text-xs text-amber-300 hover:text-white flex items-center gap-1.5 shadow-md"
            >
              <FastForward className="w-3.5 h-3.5" /> Skip Animation
            </Button>
          )}

          <Button
            onClick={handleEngageEncounter}
            disabled={!activeQuest || isCompleting || isBattling}
            className={cn(
              "flex-1 sm:flex-none h-10 px-7 font-black font-cinzel text-xs sm:text-sm tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all",
              activeQuest
                ? "bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            )}
          >
            {isCompleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Verifying Deed...</span>
              </>
            ) : isBattling ? (
              <>
                <Swords className="w-4 h-4 animate-spin text-slate-950" />
                <span>In Combat...</span>
              </>
            ) : (
              <>
                <Swords className="w-4 h-4 text-slate-950" />
                <span>Claim Bounty (Engage)</span>
              </>
            )}
          </Button>
        </div>

        {/* Audio Mute & Sound Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAudio}
            aria-label={isAudioMuted ? "Unmute game audio" : "Mute game audio"}
            className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400 hover:bg-slate-900"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="px-4 py-2 bg-rose-950/90 border-t border-rose-800 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
