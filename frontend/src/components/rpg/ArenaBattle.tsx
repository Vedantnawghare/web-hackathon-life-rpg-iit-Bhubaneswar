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
  const [heroHp, setHeroHp] = useState(100);
  const [damageNumber, setDamageNumber] = useState<string | null>(null);
  const [combatClash, setCombatClash] = useState<"NONE" | "HERO_HIT" | "ENEMY_COUNTER" | "FINISHER">("NONE");

  // Battle Flow & Results
  const [isBattling, setIsBattling] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestCompleteResponse | null>(null);
  const [showLoot, setShowLoot] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Audio & Accessibility State
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [srAnnouncement, setSrAnnouncement] = useState("");

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  // Filter available active quests
  const availableQuests = useMemo(() => {
    return quests.filter((q) => q.status === "ACTIVE" && !q.is_completed_for_period);
  }, [quests]);

  const activeQuest = availableQuests[activeIndex] || availableQuests[0] || null;

  // Clear timers on unmount or reset
  const clearAllBattleTimers = useCallback(() => {
    timeoutRefs.current.forEach((t) => clearTimeout(t));
    timeoutRefs.current = [];
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

  // Complete battle cleanup & result state
  const finishBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(false);
    setHeroState("IDLE");
    setEnemyState("IDLE");
    setEnemyHp(100);
    setHeroHp(100);
    setDamageNumber(null);
    setCombatClash("NONE");
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

  // Multi-Stage Fighting Game Combat Choreography (4–7 seconds)
  const startBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(true);
    setCompletedReward(data);
    setShowLoot(false);
    setDamageNumber(null);
    setCombatClash("NONE");
    setEnemyHp(100);
    setHeroHp(100);

    // Announce to screen readers
    setSrAnnouncement(
      `Quest confirmed: ${data.quest_title}. Combat sequence initiated. Gained ${data.earned_xp} XP and ${data.earned_gold} Gold.`
    );

    // 0.0s - Transition to Battle BGM & READY stance
    audioManager.startBattleMusic();
    setHeroState("READY");
    setEnemyState("IDLE");

    if (shouldReduceMotion) {
      // Reduced motion: concise instant transition
      setHeroState("ATTACK");
      setEnemyState("HIT");
      setDamageNumber(`-${data.earned_xp} XP!`);
      audioManager.playHitSound();

      const t1 = setTimeout(() => {
        setHeroState("VICTORY");
        setEnemyState("DEFEATED");
        setEnemyHp(0);
        audioManager.playDefeatSound();
        audioManager.playFanfare();
        setShowLoot(true);
      }, 700);

      const t2 = setTimeout(() => {
        finishBattleSequence(data);
      }, 3000);

      timeoutRefs.current.push(t1, t2);
      return;
    }

    // Stage 1 (0.6s): Both combatants step forward towards center
    const t0 = setTimeout(() => {
      setHeroState("READY");
    }, 600);

    // Stage 2 (1.4s): Hero first strike & damage burst
    const t1 = setTimeout(() => {
      setHeroState("ATTACK");
      setEnemyState("HIT");
      setCombatClash("HERO_HIT");
      setDamageNumber(`-${Math.round(data.earned_xp * 0.4)} CRIT!`);
      setEnemyHp(60);
      audioManager.playHitSound();
    }, 1400);

    // Stage 3 (2.2s): Enemy retaliates / counter strike
    const t2 = setTimeout(() => {
      setHeroState("READY");
      setEnemyState("IDLE");
      setCombatClash("ENEMY_COUNTER");
    }, 2200);

    // Stage 4 (2.8s): Hero parries / prepares finisher
    const t3 = setTimeout(() => {
      setCombatClash("NONE");
      setHeroState("READY");
    }, 2800);

    // Stage 5 (3.4s): Hero Finisher Strike!
    const t4 = setTimeout(() => {
      setHeroState("ATTACK");
      setEnemyState("HIT");
      setCombatClash("FINISHER");
      setDamageNumber(`-${data.earned_xp} XP FINISHER!`);
      setEnemyHp(0);
      audioManager.playHitSound();
    }, 3400);

    // Stage 6 (4.2s): Enemy collapses / dissolves
    const t5 = setTimeout(() => {
      setCombatClash("NONE");
      setHeroState("VICTORY");
      setEnemyState("DEFEATED");
      audioManager.playDefeatSound();
    }, 4200);

    // Stage 7 (5.0s): Fanfare, Victory Stinger & Loot Explosion
    const t6 = setTimeout(() => {
      audioManager.playFanfare();
      audioManager.playCoinSound();
      setShowLoot(true);
    }, 5000);

    // Stage 8 (6.6s): Return to calm ambient music and reset arena
    const t7 = setTimeout(() => {
      finishBattleSequence(data);
    }, 6600);

    timeoutRefs.current.push(t0, t1, t2, t3, t4, t5, t6, t7);
  }, [clearAllBattleTimers, shouldReduceMotion, finishBattleSequence]);

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
    <div className="relative w-full rounded-2xl overflow-hidden border-2 border-amber-900/40 bg-slate-950 shadow-[0_16px_40px_rgba(0,0,0,0.7)] flex flex-col select-none">
      {/* Screen Reader Announcement */}
      <div className="sr-only" aria-live="polite">
        {srAnnouncement}
      </div>

      {/* 1. TOP COMBAT HUD & DAILY XP GOAL */}
      <div className="relative z-30 px-4 py-3 bg-slate-950/80 border-b border-amber-900/30 backdrop-blur-md flex flex-col gap-2">
        {/* Authoritative Daily XP Goal Bar */}
        {dailyProgress && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              <span className="text-xs font-bold font-cinzel text-amber-300">
                Today&apos;s Adventure XP Goal
              </span>
              <span className="text-xs font-rajdhani font-semibold text-slate-300">
                {dailyProgress.daily_xp_earned} / {dailyProgress.daily_xp_goal} XP
              </span>
            </div>

            <div className="flex items-center gap-3 flex-1 sm:max-w-xs">
              <div className="relative w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
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
              <span className="text-xs font-rajdhani font-bold text-amber-400 min-w-[36px]">
                {dailyProgress.progress_percentage}%
              </span>
            </div>

            {dailyProgress.is_goal_reached && (
              <span className="text-[11px] font-bold text-emerald-400 font-rajdhani uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                ? Daily Resolve Complete!
              </span>
            )}
          </div>
        )}

        {/* Arcade Combat Meters: Hero HP (Left) vs Enemy HP (Right) */}
        <div className="grid grid-cols-12 items-center gap-2 sm:gap-4">
          {/* Hero HP & Nameplate (Left) */}
          <div className="col-span-5 flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg border-2 border-amber-500/60 bg-slate-900 flex items-center justify-center font-bold text-sm text-amber-400 font-cinzel shadow-md">
              {character?.current_level || 1}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200 font-cinzel truncate max-w-[100px] sm:max-w-none">
                  {character?.username || "Hero"} ({heroArchetype.name})
                </span>
                <span className="font-rajdhani text-emerald-400 font-semibold">{heroHp}% HP</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                  style={{ width: `${heroHp}%` }}
                />
              </div>
            </div>
          </div>

          {/* VS Badge & Round (Center) */}
          <div className="col-span-2 flex flex-col items-center justify-center">
            <div className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 font-bold font-cinzel text-xs shadow-lg animate-pulse">
              VS
            </div>
            <span className="text-[9px] text-slate-400 font-rajdhani uppercase tracking-wider">
              Encounter
            </span>
          </div>

          {/* Enemy HP & Nameplate (Right) */}
          <div className="col-span-5 flex items-center gap-2 justify-end">
            <div className="flex-1 flex flex-col text-right">
              <div className="flex justify-between items-center text-xs">
                <span className="font-rajdhani text-rose-400 font-semibold">{enemyHp}% HP</span>
                <span className="font-bold text-slate-200 font-cinzel truncate max-w-[100px] sm:max-w-none">
                  {enemyInfo ? enemyInfo.name : "No Encounter"}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <motion.div
                  className="h-full bg-gradient-to-l from-rose-600 to-rose-400"
                  animate={{ width: `${enemyHp}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <div className="w-9 h-9 rounded-lg border-2 border-rose-500/60 bg-slate-900 flex items-center justify-center font-bold text-sm text-rose-400 font-cinzel shadow-md">
              ?
            </div>
          </div>
        </div>
      </div>

      {/* 2. ARENA COMBAT STAGE */}
      <div className="relative w-full h-[320px] sm:h-[380px] overflow-hidden flex items-center justify-between px-4 sm:px-16">
        {/* Layered Living Fantasy Environment Backdrop */}
        <ArenaBackground attribute={activeQuest?.primary_attribute} />

        {/* Ambient Clash Screen Flare */}
        <AnimatePresence>
          {combatClash !== "NONE" && (
            <motion.div
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className={cn(
                "absolute inset-0 z-20 pointer-events-none",
                combatClash === "FINISHER" ? "bg-amber-400/40" : "bg-white/40"
              )}
            />
          )}
        </AnimatePresence>

        {/* Floating Damage Number */}
        <AnimatePresence>
          {damageNumber && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.6 }}
              animate={{ opacity: 1, y: -40, scale: 1.3 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute z-40 top-1/3 right-1/4 text-2xl sm:text-3xl font-black font-rajdhani text-yellow-300 drop-shadow-[0_4px_12px_rgba(239,68,68,0.9)] pointer-events-none"
            >
              {damageNumber}
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT FIGHTER: Hero Character */}
        <div className="relative z-20 flex flex-col items-center">
          <HeroCharacter
            heroId={character?.hero_class || "vanguard_male"}
            state={heroState}
            equippedTheme={character?.equipped_theme}
            username={character?.username}
            size="md"
          />
        </div>

        {/* CENTER BOUNTY CARD & NOTICE */}
        {activeQuest && !isBattling && (
          <div className="relative z-20 max-w-[220px] sm:max-w-xs px-3 py-2 rounded-xl bg-slate-950/80 border border-amber-500/40 backdrop-blur-md shadow-xl text-center hidden md:flex flex-col items-center gap-1">
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase font-rajdhani flex items-center gap-1">
              <Sword className="w-3 h-3 text-amber-400" /> Current Bounty
            </span>
            <h4 className="text-sm font-bold text-slate-100 font-cinzel line-clamp-1">
              {activeQuest.title}
            </h4>
            {activeQuest.due_time && (
              <span className="text-[10px] text-sky-400 font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Due {activeQuest.due_time}
              </span>
            )}
            <div className="flex items-center gap-2 text-xs font-rajdhani font-bold text-amber-300">
              <span>+{activeQuest.base_xp} XP</span>
              <span>•</span>
              <span>+{activeQuest.base_gold} Gold</span>
            </div>
          </div>
        )}

        {/* RIGHT FIGHTER: Quest Enemy Archetype */}
        <div className="relative z-20 flex flex-col items-center">
          {activeQuest && enemyInfo ? (
            <EnemySprite
              state={enemyState}
              attribute={activeQuest.primary_attribute}
              difficulty={activeQuest.difficulty}
              name={enemyInfo.name}
            />
          ) : (
            <div className="w-36 h-48 sm:w-44 sm:h-56 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-2xl bg-black/40 text-center p-4">
              <Trophy className="w-10 h-10 text-amber-500/40 mb-2" />
              <span className="text-xs font-cinzel text-slate-400">All Bounties Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. REWARD LOOT MODAL OVERLAY */}
      <AnimatePresence>
        {showLoot && completedReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4"
          >
            <div className="relative max-w-sm w-full p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-black border-2 border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center gap-3">
              <button
                onClick={() => finishBattleSequence(completedReward)}
                className="absolute top-3 right-3 text-slate-400 hover:text-white"
                aria-label="Close victory report"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shadow-lg animate-bounce">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>

              <h3 className="text-xl font-black font-cinzel text-amber-300">
                VICTORY ACHIEVED!
              </h3>
              <p className="text-xs text-slate-300 font-rajdhani">
                Bounty cleared: <span className="text-white font-bold">{completedReward.quest_title}</span>
              </p>

              {/* Reward Chips */}
              <div className="flex flex-wrap justify-center gap-2 my-2">
                <div className="px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center gap-1.5 text-amber-300 font-bold font-rajdhani text-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  +{completedReward.earned_xp} XP
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-yellow-950/80 border border-yellow-500/40 flex items-center gap-1.5 text-yellow-300 font-bold font-rajdhani text-sm">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  +{completedReward.earned_gold} Gold
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center gap-1.5 text-purple-300 font-bold font-rajdhani text-sm">
                  <Shield className="w-4 h-4 text-purple-400" />
                  +{completedReward.attribute_gain} {completedReward.attribute_increased}
                </div>
              </div>

              <Button
                onClick={() => finishBattleSequence(completedReward)}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold font-cinzel text-sm shadow-md"
              >
                Claim & Advance
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. BOTTOM COMMAND BAR & ACTIONS */}
      <div className="relative z-30 px-4 py-3 bg-slate-950/90 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Encounter Cycling */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={activeIndex === 0 || isBattling}
            onClick={() => { const newIdx = Math.max(0, activeIndex - 1); setActiveIndex(newIdx); if (availableQuests[newIdx]) onSelectQuest?.(availableQuests[newIdx]); }}
            className="h-8 border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs font-rajdhani text-slate-400 min-w-[70px] text-center">
            {availableQuests.length > 0
              ? `${activeIndex + 1} of ${availableQuests.length} Bounties`
              : "0 Bounties"}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={activeIndex >= availableQuests.length - 1 || isBattling}
            onClick={() => { const newIdx = Math.min(availableQuests.length - 1, activeIndex + 1); setActiveIndex(newIdx); if (availableQuests[newIdx]) onSelectQuest?.(availableQuests[newIdx]); }}
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
              className="h-9 px-3 border-slate-700 text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <FastForward className="w-3.5 h-3.5" /> Skip
            </Button>
          )}

          <Button
            onClick={handleEngageEncounter}
            disabled={!activeQuest || isCompleting || isBattling}
            className={cn(
              "flex-1 sm:flex-none h-9 px-6 font-bold font-cinzel text-xs sm:text-sm tracking-wider shadow-lg flex items-center justify-center gap-2",
              activeQuest
                ? "bg-gradient-to-r from-rose-600 via-amber-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950"
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
                <Sword className="w-4 h-4 animate-spin text-slate-950" />
                <span>In Combat...</span>
              </>
            ) : (
              <>
                <Sword className="w-4 h-4 text-slate-950" />
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
            className="h-8 w-8 p-0 text-slate-400 hover:text-amber-400"
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {actionError && (
        <div className="px-4 py-2 bg-rose-950/80 border-t border-rose-800 text-xs text-rose-300 flex items-center justify-between">
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

