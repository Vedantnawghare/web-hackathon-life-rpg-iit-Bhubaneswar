"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Character, DailyProgress } from "@/types/character";
import { HeroSprite, HeroBattleState } from "@/components/rpg/HeroSprite";
import { EnemySprite, EnemyBattleState, getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import { audioManager } from "@/lib/audio-manager";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ArenaBattleProps {
  character?: Character;
  quests: Quest[];
  dailyProgress?: DailyProgress;
  onCompleteQuest: (questId: string) => Promise<QuestCompleteResponse>;
  isCompleting?: boolean;
  onLevelUp?: (data: { oldLevel: number; newLevel: number; levelsGained: number }) => void;
}

export function ArenaBattle({
  character,
  quests = [],
  dailyProgress,
  onCompleteQuest,
  isCompleting = false,
  onLevelUp,
}: ArenaBattleProps) {
  const shouldReduceMotion = useReducedMotion();

  // Active uncompleted quests take priority
  const availableQuests = useMemo(() => {
    return quests.filter((q) => !q.is_completed_for_period);
  }, [quests]);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeQuest = availableQuests[activeIndex] || quests[0] || null;

  // Battle Choreography States
  const [heroState, setHeroState] = useState<HeroBattleState>("IDLE");
  const [enemyState, setEnemyState] = useState<EnemyBattleState>("IDLE");
  const [enemyHp, setEnemyHp] = useState(100);
  const [isBattling, setIsBattling] = useState(false);
  const [damageNumber, setDamageNumber] = useState<string | null>(null);
  const [showLoot, setShowLoot] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestCompleteResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Screen reader announcement ref
  const [srAnnouncement, setSrAnnouncement] = useState<string>("");

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const clearAllBattleTimers = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
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

  const finishBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(false);
    setHeroState("IDLE");
    setEnemyState("IDLE");
    setEnemyHp(100);
    setDamageNumber(null);
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

  // Execute the Battle Choreography upon backend success
  const startBattleSequence = useCallback((data: QuestCompleteResponse) => {
    clearAllBattleTimers();
    setIsBattling(true);
    setCompletedReward(data);
    setShowLoot(false);
    setDamageNumber(null);
    setEnemyHp(100);

    // Announce to screen readers
    setSrAnnouncement(
      `Quest confirmed: ${data.quest_title}. Hero engaging enemy. Gained ${data.earned_xp} XP and ${data.earned_gold} Gold.`
    );

    // 0.0s - Switch to Battle BGM
    audioManager.startBattleMusic();

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

    // 0.0s - 0.5s: Focus & Hero enters attack pose
    const t0 = setTimeout(() => {
      setHeroState("ATTACK");
    }, 450);

    // 1.2s: Lunge forward & impact
    const t1 = setTimeout(() => {
      audioManager.playHitSound();
      setDamageNumber(`-${data.earned_xp} XP CRIT!`);
      setEnemyState("HIT");
      setEnemyHp(20);
    }, 1200);

    // 2.0s: Enemy defeat
    const t2 = setTimeout(() => {
      audioManager.playDefeatSound();
      setEnemyState("DEFEATED");
      setEnemyHp(0);
      setHeroState("VICTORY");
    }, 2100);

    // 2.8s: Fanfare & Loot reveal
    const t3 = setTimeout(() => {
      audioManager.playFanfare();
      setShowLoot(true);
      audioManager.playCoinSound();
    }, 2800);

    // 4.8s: Transition back to calm ambient music and advance to next encounter
    const t4 = setTimeout(() => {
      finishBattleSequence(data);
    }, 4800);

    timeoutRefs.current.push(t0, t1, t2, t3, t4);
  }, [clearAllBattleTimers, shouldReduceMotion, finishBattleSequence]);

  // Skip battle shortcut
  const handleSkipBattle = () => {
    if (!completedReward) return;
    finishBattleSequence(completedReward);
  };

  // Primary action: user completed the real-world deed, clicks to claim bounty
  const handleEngageEncounter = async () => {
    if (!activeQuest || isCompleting || isBattling) return;
    setActionError(null);

    try {
      const result = await onCompleteQuest(activeQuest.id);
      // ONLY NOW start battle animation after server confirmation
      startBattleSequence(result);
    } catch (err: unknown) {
      // If server completion fails, NEVER show battle victory
      setIsBattling(false);
      setHeroState("IDLE");
      setEnemyState("IDLE");
      setActionError(
        err instanceof Error ? err.message : "Failed to conquer encounter. Please verify your connection."
      );
    }
  };

  const enemyInfo = activeQuest
    ? getEnemyArchetypeInfo(activeQuest.primary_attribute, activeQuest.difficulty)
    : { name: "Shadow Wanderer", title: "Unbound Threat", primaryColor: "#38bdf8", glowColor: "rgba(56,189,248,0.5)" };

  const dailyXpEarned = dailyProgress?.daily_xp_earned ?? 0;
  const dailyXpGoal = dailyProgress?.daily_xp_goal ?? 200;
  const dailyPercent = Math.min(100, Math.round((dailyXpEarned / (dailyXpGoal || 1)) * 100));
  const isGoalReached = dailyProgress?.is_goal_reached || dailyXpEarned >= dailyXpGoal;

  return (
    <section
      aria-label="Real-Time Arena Encounter"
      className="relative rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden"
    >
      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" role="status">
        {srAnnouncement}
      </div>

      {/* Atmospheric Battle Arena Vignette & Radial Light */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.15)_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none opacity-40" />

      {/* Ambient Combat Edge Glow when Battling */}
      {isBattling && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 border-4 border-amber-500/50 rounded-3xl pointer-events-none z-30"
        />
      )}

      {/* 1. TOP ARENA HUD: Daily XP Goal + Soundscape Control */}
      <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
        {/* Daily XP Target Progress */}
        <div className="flex-1 max-w-lg">
          <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-display">
                <Trophy className="h-3.5 w-3.5 text-amber-400" /> Today&apos;s XP Goal
              </span>
              {isGoalReached && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.3)] animate-pulse">
                  Goal Complete!
                </span>
              )}
            </div>
            <span className="font-bold text-amber-300">
              {dailyXpEarned} / {dailyXpGoal} XP ({dailyPercent}%)
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={dailyPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Daily XP Goal: ${dailyPercent} percent complete`}
            className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[1px] shadow-inner"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dailyPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full transition-all shadow-[0_0_12px_rgba(245,158,11,0.5)]",
                isGoalReached
                  ? "bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-400"
                  : "bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300"
              )}
            />
          </div>
        </div>

        {/* Tactical Audio & Arena Controls */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {isBattling && (
            <button
              type="button"
              onClick={handleSkipBattle}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-mono border border-slate-700 transition-colors cursor-pointer"
              title="Skip Battle Sequence"
            >
              <FastForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !isAudioMuted;
              setIsAudioMuted(next);
              audioManager.setMuted(next);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-300 hover:border-amber-500/40 text-xs font-mono transition-colors cursor-pointer"
            aria-label={isAudioMuted ? "Unmute tactical audio" : "Mute tactical audio"}
          >
            {isAudioMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-rose-400" />
                <span className="hidden sm:inline">Sound Off</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">Adaptive BGM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Error Alert if quest completion failed */}
      {actionError && (
        <div className="relative z-20 mt-3 flex items-center justify-between p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button type="button" onClick={() => setActionError(null)} className="p-1 text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 2. CENTER: ARENA COMBAT STAGE */}
      <div className="relative z-10 my-4 sm:my-6 min-h-[300px] sm:min-h-[340px] rounded-2xl bg-gradient-to-b from-slate-950/80 via-slate-900/90 to-slate-950/95 border border-slate-800/80 flex flex-col justify-between p-4 sm:p-6 overflow-hidden shadow-inner">
        {/* Stage Environmental Backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(245,158,11,0.06),transparent_60%)] pointer-events-none" />

        {/* Top Encounter Title Banner */}
        <div className="text-center relative z-20">
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400/80 block">
            {activeQuest ? `Active Encounter: ${enemyInfo.title}` : "Arena Awaiting Bounties"}
          </span>
          <h3 className="text-base sm:text-xl font-black tracking-tight text-white font-display mt-0.5 max-w-xl mx-auto truncate">
            {activeQuest ? activeQuest.title : "No active bounty contracts"}
          </h3>
        </div>

        {/* Floating Combat Damage Text Burst */}
        <AnimatePresence>
          {damageNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: [1, 1.4, 1], y: -50 }}
              exit={{ opacity: 0, y: -80 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-sm sm:text-lg shadow-[0_0_25px_rgba(245,158,11,0.6)] border-2 border-yellow-200"
            >
              {damageNumber}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combatants Grid: Hero (Left) vs Enemy (Right) */}
        <div className="relative z-20 flex items-center justify-between px-2 sm:px-12 py-2">
          {/* Hero Combatant */}
          <div className="flex flex-col items-center">
            <HeroSprite
              state={heroState}
              username={character?.username || "Champion"}
              equippedTheme={character?.equipped_theme}
            />
          </div>

          {/* Center Battle Field Clash Rune */}
          <div className="flex flex-col items-center justify-center px-2 pointer-events-none select-none">
            <motion.div
              animate={{
                scale: isBattling ? [1, 1.25, 1] : 1,
                rotate: isBattling ? [0, 180, 360] : 0,
              }}
              transition={{ duration: 1.2, repeat: isBattling ? Infinity : 0 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-400 font-display font-black text-sm shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              VS
            </motion.div>
          </div>

          {/* Enemy Combatant & Threat Health Bar */}
          <div className="flex flex-col items-center">
            {/* Enemy Threat Health Bar */}
            <div className="w-28 sm:w-36 mb-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-400 mb-0.5">
                <span>Threat</span>
                <span>{enemyHp}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  animate={{ width: `${enemyHp}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>

            <EnemySprite
              state={enemyState}
              attribute={activeQuest?.primary_attribute || "INTELLECT"}
              difficulty={activeQuest?.difficulty || "MEDIUM"}
              name={enemyInfo.name}
            />
          </div>
        </div>

        {/* Loot & Reward Reveal Banner upon Victory */}
        <AnimatePresence>
          {showLoot && completedReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="relative z-30 mx-auto w-full max-w-md p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] text-center"
            >
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-300 block">
                Enemy Vanquished • Bounty Claimed!
              </span>
              <div className="flex items-center justify-center gap-3 mt-1.5 flex-wrap font-mono font-bold text-xs">
                <span className="text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> +{completedReward.earned_xp} XP
                </span>
                <span className="text-yellow-300 flex items-center gap-1 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/30">
                  <Coins className="h-3.5 w-3.5 text-yellow-400" /> +{completedReward.earned_gold} Gold
                </span>
                <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  +{completedReward.attribute_gain} {completedReward.attribute_increased}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM: ACTIVE QUEST CONSOLE & ENGAGEMENT BUTTON */}
      {activeQuest ? (
        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/30 backdrop-blur-md">
          {/* Quest Metadata & Loot Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono font-bold uppercase text-slate-300 text-[10px]">
                {activeQuest.category}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 text-[11px] font-mono font-semibold">
                {activeQuest.difficulty} Tier
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 text-[11px] font-mono">
                {activeQuest.recurrence === "DAILY" ? "Daily Mandate" : activeQuest.recurrence === "WEEKLY" ? "Weekly Crusade" : "One-Off Deed"}
              </span>
            </div>

            <h4 className="font-bold text-sm text-slate-100 font-display">
              {activeQuest.title}
            </h4>

            {/* Rewards Bounty Preview */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold pt-1">
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> +{activeQuest.base_xp} XP
              </span>
              <span className="text-amber-300 flex items-center gap-1">
                <Coins className="h-3.5 w-3.5" /> +{activeQuest.base_gold} G
              </span>
              <span className="text-emerald-400">
                +{activeQuest.primary_attribute.slice(0, 3)} Dominion
              </span>
            </div>
          </div>

          {/* Encounter Navigation & Primary Action Button */}
          <div className="flex items-center gap-3">
            {/* Previous / Next Encounter Selectors */}
            {availableQuests.length > 1 && (
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  disabled={isBattling || isCompleting}
                  onClick={() =>
                    setActiveIndex((prev) => (prev > 0 ? prev - 1 : availableQuests.length - 1))
                  }
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Previous Encounter"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-[10px] font-mono text-slate-400 px-1 font-bold">
                  {activeIndex + 1}/{availableQuests.length}
                </span>
                <button
                  type="button"
                  disabled={isBattling || isCompleting}
                  onClick={() =>
                    setActiveIndex((prev) => (prev < availableQuests.length - 1 ? prev + 1 : 0))
                  }
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  aria-label="Next Encounter"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Primary Engagement Button: Claim Bounty (Engage) */}
            <Button
              variant="gold"
              size="lg"
              disabled={isCompleting || isBattling}
              onClick={handleEngageEncounter}
              className="font-display font-bold uppercase tracking-wider text-xs sm:text-sm min-h-[48px] px-6 gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
            >
              {isCompleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating Deed...</span>
                </>
              ) : isBattling ? (
                <>
                  <Sword className="h-4 w-4 animate-bounce" />
                  <span>In Combat!</span>
                </>
              ) : (
                <>
                  <Sword className="h-4 w-4" />
                  <span>Claim Bounty (Engage)</span>
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative z-20 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-mono">
            All active contracts conquered! Visit the Guild Bounty Board to inscribe your next adventure.
          </p>
        </div>
      )}
    </section>
  );
}
