"use client";
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Quest, QuestCompleteResponse } from "@/types/quest";
import { Character, DailyProgress } from "@/types/character";
import { HeroCharacter, HeroCombatState } from "@/components/rpg/HeroCharacter";
import { EnemySprite, EnemyBattleState, getEnemyArchetypeInfo } from "@/components/rpg/EnemySprite";
import { audioManager } from "@/lib/audio-manager";
import { getHeroArchetype } from "@/lib/hero-data";
import { GAME_ASSETS } from "@/lib/game-assets";
import { apiClient } from "@/lib/api-client";
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
  Sparkles,
  Zap,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Flame,
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
  const queryClient = useQueryClient();
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

  // Fighter Position Offset (Controlled via D-Pad)
  const [heroPosX, setHeroPosX] = useState(0); // -20px to +120px

  // Projectile Flight Animation State
  const [activeProjectile, setActiveProjectile] = useState<"arcane_orb" | "arrow" | "sword_arc" | "dual_slash" | null>(null);

  // Fighting Camera & VFX
  const [cameraZoom, setCameraZoom] = useState(false);
  const [combatAlert, setCombatAlert] = useState<string | null>(null);
  const [damageNumber, setDamageNumber] = useState<{ text: string; isCrit: boolean; isHero: boolean } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [redScreenFlash, setRedScreenFlash] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // Cinematic Boss Encounter Intro on Mount (2.5s)
  const [showBossIntro, setShowBossIntro] = useState(true);
  const introPlayedRef = useRef(false);

  useEffect(() => {
    if (!introPlayedRef.current) {
      introPlayedRef.current = true;
      setCameraZoom(true);
      setShowBossIntro(true);
      const tRoar = setTimeout(() => {
        audioManager.playEnemyRoar();
      }, 500);
      const tEnd = setTimeout(() => {
        setCameraZoom(false);
        setShowBossIntro(false);
      }, 2600);
      return () => {
        clearTimeout(tRoar);
        clearTimeout(tEnd);
      };
    }
  }, []);

  // Battle Flow & Results
  const [isBattling, setIsBattling] = useState(false);
  const [completedReward, setCompletedReward] = useState<QuestCompleteResponse | null>(null);
  const [showLoot, setShowLoot] = useState(false);
  const [, setActionError] = useState<string | null>(null);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

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
  }, []);

  useEffect(() => {
    return () => clearAllBattleTimers();
  }, [clearAllBattleTimers]);

  // Active Hero Details
  const heroArchetype = useMemo(() => {
    return getHeroArchetype(activeHeroClass);
  }, [activeHeroClass]);

  // Active Enemy Details
  const enemyInfo = useMemo(() => {
    return getEnemyArchetypeInfo(
      activeQuest?.primary_attribute || "STRENGTH",
      activeQuest?.difficulty || "MEDIUM"
    );
  }, [activeQuest]);

  // Sound Launchers
  const triggerHeroAttackSound = useCallback(() => {
    const hid = activeHeroClass.toLowerCase();
    if (hid.includes("mage") || hid.includes("weaver") || hid.includes("lyra")) {
      audioManager.playMagicCast();
    } else if (hid.includes("ranger") || hid.includes("huntress") || hid.includes("aria") || hid.includes("bow")) {
      audioManager.playBowShot();
    } else if (hid.includes("rogue") || hid.includes("kaelen") || hid.includes("dual")) {
      audioManager.playDualBladeCombo();
    } else {
      audioManager.playHeavySwordSlash();
    }
  }, [activeHeroClass]);

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

  // Choreographed Mini-Combat Scene for Task Completion
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

    const damageAmount = Math.max(1, enemyHp - calculatedNewHp);

    // PHASE 1 (0.0s): Stance & Focus Anticipation
    setHeroState("READY");
    setCameraZoom(true);
    setCombatAlert(`⚔️ ${heroArchetype.name} channels willpower into ${heroArchetype.signatureMove}!`);

    // PHASE 2 (0.25s): Approach / Lunge Forward
    const t0 = setTimeout(() => {
      setHeroState("APPROACH");
      setCombatAlert(`⚔️ ${heroArchetype.name} advances into striking range!`);
    }, 250);

    // PHASE 3 (0.55s): Weapon Attack & Projectile Traversal
    const t1 = setTimeout(() => {
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
      setCombatAlert(`💥 ${heroArchetype.name} executes ${heroArchetype.signatureMove}!`);
    }, 550);

    // PHASE 4 (1.15s): Impact on Boss, Screen Shake & Damage Roll
    const t2 = setTimeout(() => {
      setActiveProjectile(null);
      triggerHeroImpactSound();
      audioManager.playEnemyHurt();
      setScreenShake(true);
      setEnemyState("HIT");
      setEnemyHp(calculatedNewHp);
      setCombatAlert(`🔥 ${damageAmount} CRITICAL DAMAGE SHATTERS THE BOSS!`);
      setDamageNumber({
        text: `-${damageAmount} HP`,
        isCrit: calculatedNewHp === 0,
        isHero: false,
      });

      setTimeout(() => setEnemyTrailingHp(calculatedNewHp), 200);
      setTimeout(() => setScreenShake(false), 280);
    }, 1150);

    // PHASE 5 (1.75s): Hero Recovery & Boss Stagger / Enrage
    const t3 = setTimeout(() => {
      setHeroState("READY");
      setCombatAlert(null);
      setDamageNumber(null);

      if (calculatedNewHp > 0) {
        audioManager.playEnemyRoar();
        setEnemyState("APPROACH");
        setCombatAlert(`⚠️ ${enemyInfo.name} ROARS & CHARGES OCULAR DEATH BEAM!`);
      } else {
        setEnemyState("DEFEATED");
        audioManager.playEnemyDeathRoar();
        audioManager.playDefeatSound();
        audioManager.playFanfare();
        setCombatAlert("🏆 VICTORY! DAILY RAID BOSS DEFEATED!");
      }
    }, 1750);

    let t4: NodeJS.Timeout | null = null;
    let t5: NodeJS.Timeout | null = null;

    if (calculatedNewHp > 0) {
      // PHASE 6 (2.3s): Boss Counterattack - Eye Laser Locks onto Hero
      t4 = setTimeout(() => {
        setEnemyState("ATTACK");
        audioManager.playEnemyLaserBeam();
        audioManager.playEnemyCounterImpact();
        setCombatAlert(`⚡ ${enemyInfo.name} FIRES CONCENTRATED OCULAR LASER AT HERO!`);

        // Laser connects with Hero chest
        const tRetaliate = setTimeout(() => {
          setHeroState("HIT");
          setHeroHp((prev) => Math.max(20, prev - 12));
          setRedScreenFlash(true);
          setScreenShake(true);
          setDamageNumber({
            text: "-12 HP",
            isCrit: false,
            isHero: true,
          });

          setTimeout(() => setHeroTrailingHp((prev) => Math.max(20, prev - 12)), 200);
          setTimeout(() => setRedScreenFlash(false), 250);
          setTimeout(() => setScreenShake(false), 280);
        }, 320);

        timeoutRefs.current.push(tRetaliate);
      }, 2300);

      // PHASE 7 (3.3s): Round Concludes & Smooth Return to Idle
      t5 = setTimeout(() => {
        setEnemyState("IDLE");
        setHeroState("IDLE");
        setCombatAlert(null);
        setDamageNumber(null);
        setCameraZoom(false);
        setIsBattling(false);
        audioManager.startAmbientMusic();

        if (data.has_leveled_up && onLevelUp) {
          onLevelUp({
            oldLevel: data.old_level,
            newLevel: data.new_level,
            levelsGained: data.levels_gained,
          });
        }
      }, 3300);
    } else {
      // Boss Defeated Path (2.4s)
      t5 = setTimeout(() => {
        setIsBattling(false);
        setShowLoot(true);
        setCameraZoom(false);
        audioManager.startAmbientMusic();

        if (data.has_leveled_up && onLevelUp) {
          onLevelUp({
            oldLevel: data.old_level,
            newLevel: data.new_level,
            levelsGained: data.levels_gained,
          });
        }
      }, 2400);
    }

    timeoutRefs.current.push(t0, t1, t2, t3);
    if (t4) timeoutRefs.current.push(t4);
    if (t5) timeoutRefs.current.push(t5);
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

  // Fighting Game Action: Arcade Attack
  const handleControllerAttack = useCallback(() => {
    if (isBattling) return;
    setActiveButton("ATTACK");
    triggerHeroAttackSound();
    setHeroState("ATTACK");
    setCombatAlert(` ${heroArchetype.name} strikes with ${heroArchetype.weapon}!`);

    setTimeout(() => {
      triggerHeroImpactSound();
      audioManager.playEnemyHurt();
      setEnemyState("HIT");
      setScreenShake(true);
      setDamageNumber({ text: "-15 DMG", isCrit: false, isHero: false });

      setTimeout(() => {
        setHeroState("IDLE");
        setEnemyState("IDLE");
        setScreenShake(false);
        setDamageNumber(null);
        setCombatAlert(null);
        setActiveButton(null);
      }, 500);
    }, 280);
  }, [isBattling, heroArchetype, triggerHeroAttackSound, triggerHeroImpactSound]);

  // Fighting Game Action: Arcade Special
  const handleControllerSpecial = useCallback(() => {
    if (isBattling) return;
    setActiveButton("SPECIAL");
    triggerHeroAttackSound();
    setHeroState("READY");
    setCameraZoom(true);
    setCombatAlert(` SPECIAL: ${heroArchetype.signatureMove}!`);

    const hid = activeHeroClass.toLowerCase();
    if (hid.includes("mage") || hid.includes("lyra")) {
      setActiveProjectile("arcane_orb");
    } else if (hid.includes("ranger") || hid.includes("aria")) {
      setActiveProjectile("arrow");
    } else if (hid.includes("rogue") || hid.includes("kaelen")) {
      setActiveProjectile("dual_slash");
    } else {
      setActiveProjectile("sword_arc");
    }

    setTimeout(() => {
      setActiveProjectile(null);
      triggerHeroImpactSound();
      audioManager.playEnemyHurt();
      setEnemyState("HIT");
      setScreenShake(true);
      setDamageNumber({ text: "CRIT! -35 DMG", isCrit: true, isHero: false });

      setTimeout(() => {
        setHeroState("IDLE");
        setEnemyState("IDLE");
        setScreenShake(false);
        setCameraZoom(false);
        setDamageNumber(null);
        setCombatAlert(null);
        setActiveButton(null);
      }, 700);
    }, 650);
  }, [isBattling, heroArchetype, activeHeroClass, triggerHeroAttackSound, triggerHeroImpactSound]);

  // Fighting Game Action: Arcade Dodge
  const handleControllerDodge = useCallback(() => {
    if (isBattling) return;
    setActiveButton("DODGE");
    audioManager.playHeroDodge();
    setHeroState("DODGE");
    setHeroPosX((prev) => Math.max(-30, prev - 40));
    setCombatAlert(" EVASIVE ROLL! Perfect Dodge Timing!");

    setTimeout(() => {
      setHeroState("IDLE");
      setCombatAlert(null);
      setActiveButton(null);
    }, 550);
  }, [isBattling]);

  // Fighting Game Action: D-Pad Movement
  const handleControllerMove = useCallback((dir: -1 | 1) => {
    if (isBattling) return;
    setActiveButton(dir === -1 ? "LEFT" : "RIGHT");
    setHeroPosX((prev) => Math.max(-30, Math.min(130, prev + dir * 35)));
    setHeroState("READY");
    setTimeout(() => {
      setHeroState("IDLE");
      setActiveButton(null);
    }, 200);
  }, [isBattling]);

  // Complete Quest with Full Boss Battle Choreography
  const handleStrikeActiveQuest = useCallback(async () => {
    if (!activeQuest || isBattling || isCompleting) return;
    setActionError(null);

    try {
      const newDoneCount = completedDailyTasks + 1;
      const newBossHp =
        totalDailyTasks > 0
          ? Math.max(0, Math.min(100, Math.round(100 * (1 - newDoneCount / totalDailyTasks))))
          : 0;

      const result = await onCompleteQuest(activeQuest.id);
      startCombatExchange(result, newBossHp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to strike quest";
      setActionError(msg);
      setCombatAlert(`❌ Strike Failed: ${msg}`);
      setTimeout(() => setCombatAlert(null), 3000);
    }
  }, [activeQuest, isBattling, isCompleting, completedDailyTasks, totalDailyTasks, onCompleteQuest, startCombatExchange]);

  // Quick Demo Complete
  const handleQuickDemoComplete = useCallback(async () => {
    if (isBattling) return;

    if (activeQuest) {
      await handleStrikeActiveQuest();
    } else {
      const simulatedNewHp = Math.max(0, enemyHp - 25);
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
      startCombatExchange(simulatedResponse, simulatedNewHp);
    }
  }, [isBattling, activeQuest, handleStrikeActiveQuest, enemyHp, character, startCombatExchange]);

  // Keyboard Controller Hooks (A, S, D, F, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is typing in form inputs
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "a" || e.key === "A") {
        handleControllerAttack();
      } else if (e.key === "s" || e.key === "S") {
        handleControllerSpecial();
      } else if (e.key === "d" || e.key === "D") {
        handleControllerDodge();
      } else if (e.key === "f" || e.key === "F" || e.key === " ") {
        handleQuickDemoComplete();
      } else if (e.key === "ArrowLeft") {
        handleControllerMove(-1);
      } else if (e.key === "ArrowRight") {
        handleControllerMove(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleControllerAttack,
    handleControllerSpecial,
    handleControllerDodge,
    handleControllerMove,
    handleQuickDemoComplete,
  ]);

  // Showcase Demo: Reset Boss HP to 100 (0 of 4 tasks cleared)
  const handleResetBossDemo = async () => {
    clearAllBattleTimers();
    setIsBattling(false);
    setEnemyHp(100);
    setEnemyTrailingHp(100);
    setHeroHp(100);
    setHeroTrailingHp(100);
    setHeroPosX(0);
    setCameraZoom(false);
    setEnemyState("IDLE");
    setHeroState("IDLE");
    setActiveProjectile(null);
    setCombatAlert("⚔️ Daily Boss HP Reset to 100/100 (All tasks active)!");
    audioManager.startAmbientMusic();
    try {
      await apiClient("/quests/demo-reset?mode=fresh", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["quests"] });
      await queryClient.invalidateQueries({ queryKey: ["character"] });
    } catch {
      // Offline fallback
    }
    setTimeout(() => setCombatAlert(null), 2500);
  };

  // Showcase Demo: Restore Mid-Raid State (50 HP - 2 tasks cleared)
  const handleRestoreMidBossDemo = async () => {
    clearAllBattleTimers();
    setIsBattling(false);
    setEnemyHp(50);
    setEnemyTrailingHp(50);
    setHeroHp(100);
    setHeroTrailingHp(100);
    setHeroPosX(0);
    setCameraZoom(false);
    setEnemyState("IDLE");
    setHeroState("IDLE");
    setActiveProjectile(null);
    setCombatAlert("⚡ Restored Demo Raid State: 2 Tasks Cleared (Boss at 50/100 HP)!");
    audioManager.startAmbientMusic();
    try {
      await apiClient("/quests/demo-reset?mode=mid", { method: "POST" });
      await queryClient.invalidateQueries({ queryKey: ["quests"] });
      await queryClient.invalidateQueries({ queryKey: ["character"] });
    } catch {
      // Offline fallback
    }
    setTimeout(() => setCombatAlert(null), 2500);
  };

  // Showcase Demo: Cycle Champion
  const handleCycleChampion = () => {
    const champions = ["vanguard_male", "rogue_male", "mage_female", "ranger_female"];
    const currentIdx = champions.indexOf(activeHeroClass);
    const nextClass = champions[(currentIdx + 1) % champions.length];
    setDemoHeroClass(nextClass);
    const heroInfo = getHeroArchetype(nextClass);
    setCombatAlert(` Champion Switched: ${heroInfo.name} (${heroInfo.weapon})`);
    setTimeout(() => setCombatAlert(null), 2200);
  };

  return (
    <div className="relative w-full flex flex-col gap-5 select-none">
      {/* 1. TOP STATUS & SHOWCASE BAR (Brighter Royal Indigo + Amber) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#141b44]/90 via-[#182357]/90 to-[#121942]/90 border border-amber-400/50 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 border border-amber-300 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
            <Swords className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <span className="text-sm font-cinzel font-black text-amber-200 tracking-wider uppercase block">
              Daily Boss Battle Arena
            </span>
            <span className="text-xs font-rajdhani text-indigo-200 font-medium">
              Every completed daily task strikes and damages today&apos;s adversary
            </span>
          </div>
        </div>

        {/* Fast Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Button
            size="sm"
            onClick={handleCycleChampion}
            disabled={isBattling}
            variant="outline"
            className="h-7 sm:h-8 px-2 sm:px-3 text-[11px] sm:text-xs font-rajdhani font-bold border-cyan-400/50 text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/60 shadow-sm"
            title="Cycle Champion to preview unique animations & projectiles"
          >
            <Swords className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 text-cyan-300" />
            <span>Hero: {heroArchetype.name}</span>
          </Button>

          <Button
            size="sm"
            onClick={handleQuickDemoComplete}
            disabled={isBattling}
            className="h-7 sm:h-8 px-2.5 sm:px-3.5 text-[11px] sm:text-xs font-rajdhani font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          >
            <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5 fill-slate-950" />
            <span>Strike Task</span>
          </Button>

          <Button
            size="sm"
            onClick={handleRestoreMidBossDemo}
            disabled={isBattling}
            variant="outline"
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-rajdhani font-semibold border-amber-500/40 text-amber-300 bg-amber-950/40 hover:bg-amber-900/60"
            title="Restore Hackathon Demo State: 2 of 4 tasks cleared, Boss at 50/100 HP"
          >
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-amber-400" />
            <span>50 HP Demo</span>
          </Button>

          <Button
            size="sm"
            onClick={handleResetBossDemo}
            disabled={isBattling}
            variant="outline"
            className="h-7 sm:h-8 px-2 sm:px-2.5 text-[11px] sm:text-xs font-rajdhani font-semibold border-indigo-400/40 text-indigo-200 bg-indigo-950/40 hover:bg-indigo-900/60"
            title="Reset Daily Boss HP to 100/100 (0 of 4 tasks cleared)"
          >
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-indigo-300" />
            <span>Reset (100 HP)</span>
          </Button>
        </div>
      </div>

      {/* 2. THE MAIN REAL FANTASY ARENA STAGE (Vibrant, Sunset Lighting, Readable) */}
      <motion.div
        animate={{
          scale: cameraZoom ? 1.05 : 1.0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative w-full h-[390px] xs:h-[430px] sm:h-[500px] md:h-[550px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col justify-between transition-all",
          screenShake && "animate-[bounce_0.2s_infinite]"
        )}
      >
        {/* Real Fantasy Arena Background (Bright, Saturated Artwork) */}
        <img
          src={GAME_ASSETS.backgrounds.arena}
          alt="Battle Arena Colosseum"
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0 brightness-[1.05] contrast-[1.08] saturate-110"
        />

        {/* Soft atmospheric gradient (Leaves 70% of the artwork clearly visible) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f29]/55 via-transparent to-[#0d1436]/35 pointer-events-none z-0" />

        {/* Red Screen Flash on Player Damage */}
        {redScreenFlash && (
          <div className="absolute inset-0 bg-rose-600/30 pointer-events-none z-20 animate-pulse" />
        )}

        {/* Cinematic 3D Boss Intro Overlay */}
        <AnimatePresence>
          {showBossIntro && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -30 }}
              transition={{ duration: 0.45 }}
              className="absolute inset-0 z-40 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none p-4 text-center"
            >
              <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-amber-300 uppercase bg-[#0d143b]/90 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.5)] mb-2 sm:mb-3">
                ⚔️ TODAY&apos;S 3D RAID BOSS
              </span>
              <h2 className="text-2xl sm:text-5xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-300 to-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.9)]">
                {enemyInfo.name}
              </h2>
              <p className="text-[11px] sm:text-sm font-rajdhani font-semibold text-slate-200 mt-1 max-w-md">
                {enemyInfo.title} &bull; Digital Twin Encounter
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HUD TOP ROW: HERO & BOSS VITALITY GAUGES */}
        <div className="relative z-30 p-2 sm:p-6 flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Hero Vitality Gauge */}
            <div className="flex-1 min-w-0 max-w-[48%] sm:max-w-sm flex flex-col gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl bg-slate-950/75 border border-cyan-400/40 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] sm:text-xs font-rajdhani gap-1">
                <span className="font-bold text-cyan-200 flex items-center gap-1 sm:gap-1.5 truncate">
                  <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{character?.username || "Hero"} ({heroArchetype.name})</span>
                </span>
                <span className="font-mono font-black text-cyan-100 shrink-0 text-[10px] sm:text-xs">{heroHp}/100</span>
              </div>
              <div className="relative h-3 sm:h-4 w-full rounded-full bg-slate-950/80 border border-cyan-500/50 overflow-hidden shadow-inner p-0.5">
                <motion.div
                  className="h-full rounded-full bg-cyan-400/30"
                  animate={{ width: `${heroTrailingHp}%` }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0.5 left-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-300 shadow-[0_0_14px_rgba(6,182,212,0.9)]"
                  animate={{ width: `${heroHp}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>

            {/* Center: Stage Emblem */}
            <div className="hidden sm:flex flex-col items-center justify-center">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border-2 border-amber-400/70 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md">
                <Swords className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            {/* Right: Daily Boss Health Gauge */}
            <div className="flex-1 min-w-0 max-w-[48%] sm:max-w-sm flex flex-col gap-1 sm:gap-1.5 items-end p-1.5 sm:p-2 rounded-xl bg-slate-950/75 border border-rose-500/40 backdrop-blur-md">
              <div className="flex items-center justify-between w-full text-[11px] sm:text-xs font-rajdhani gap-1">
                <span className="font-mono font-black text-rose-200 shrink-0 text-[10px] sm:text-xs">{enemyHp}/100</span>
                <span className="font-bold text-rose-300 flex items-center gap-1 sm:gap-1.5 truncate">
                  <span className="truncate">{enemyInfo.name}</span>
                  <Skull className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
                </span>
              </div>
              <div className="relative h-3 sm:h-4 w-full rounded-full bg-slate-950/80 border border-rose-500/50 overflow-hidden shadow-inner p-0.5">
                <motion.div
                  className="h-full rounded-full bg-rose-400/30 ml-auto"
                  animate={{ width: `${enemyTrailingHp}%` }}
                  transition={{ duration: 0.4 }}
                />
                <motion.div
                  className="absolute inset-y-0.5 right-0.5 rounded-full bg-gradient-to-l from-rose-500 to-amber-400 shadow-[0_0_14px_rgba(244,63,94,0.9)]"
                  animate={{ width: `${enemyHp}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Combat Alert Banner */}
          <AnimatePresence>
            {combatAlert && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="self-center max-w-[95%] px-3 sm:px-5 py-1.5 rounded-full bg-[#0c1236]/90 border border-amber-400/80 shadow-[0_0_25px_rgba(245,158,11,0.5)] text-[11px] sm:text-sm font-cinzel font-black text-amber-200 tracking-wider text-center backdrop-blur-md truncate"
              >
                {combatAlert}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* COMBAT CHARACTERS STAGE (Hero + Digital Boss) */}
        <div className="relative z-10 w-full px-2 sm:px-14 flex items-end justify-between pb-2 sm:pb-8 overflow-hidden">
          {/* Left: Player Champion Sprite (Position Shiftable via D-Pad) */}
          <motion.div
            animate={{ x: heroPosX }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative flex flex-col items-center"
          >
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
                  className="absolute -top-12 z-30 font-display font-black text-xl text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,1)]"
                >
                  {damageNumber.text}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* PROJECTILES & WEAPON ARCS */}
          <div className="absolute inset-x-12 sm:inset-x-20 bottom-24 h-36 pointer-events-none z-20 flex items-center">
            {activeProjectile === "arcane_orb" && (
              <motion.div
                initial={{ x: 20, y: -15, opacity: 0, scale: 0.5 }}
                animate={{
                  x: [20, 280, 560],
                  y: [-15, -45, -8],
                  opacity: [0, 1, 1, 0],
                  scale: [0.7, 1.5, 2.0],
                }}
                transition={{ duration: 0.55, ease: "easeIn" }}
                className="absolute"
              >
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 animate-spin shadow-[0_0_45px_rgba(168,85,247,1)]" />
                  <div className="absolute -left-8 w-10 h-10 rounded-full bg-cyan-400/70 blur-sm animate-pulse" />
                  <div className="absolute -left-16 w-6 h-6 rounded-full bg-purple-500/50 blur-md" />
                </div>
              </motion.div>
            )}

            {activeProjectile === "arrow" && (
              <motion.div
                initial={{ x: 20, y: 8, opacity: 0, scale: 0.6 }}
                animate={{
                  x: [20, 300, 580],
                  y: [8, -14, 0],
                  opacity: [0, 1, 1, 0],
                  scale: [0.8, 1.3, 1.5],
                }}
                transition={{ duration: 0.55, ease: "easeIn" }}
                className="absolute"
              >
                <div className="relative w-24 h-8 flex items-center">
                  <div className="w-6 h-6 rotate-45 bg-amber-300 shadow-[0_0_30px_rgba(245,158,11,1)]" />
                  <div className="w-20 h-2 bg-gradient-to-r from-transparent via-emerald-400 to-amber-300 shadow-[0_0_20px_rgba(16,185,129,0.95)]" />
                </div>
              </motion.div>
            )}

            {activeProjectile === "sword_arc" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, x: 220 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.6, 2.0], x: [220, 380, 480] }}
                transition={{ duration: 0.55 }}
                className="absolute"
              >
                <svg className="w-48 h-48 text-amber-300 drop-shadow-[0_0_35px_rgba(245,158,11,1)]" viewBox="0 0 100 100">
                  <path d="M 15 85 A 50 50 0 0 1 85 15" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" />
                </svg>
              </motion.div>
            )}

            {activeProjectile === "dual_slash" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.4, x: 220 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.6, 1.5, 1.9], x: [220, 380, 480] }}
                transition={{ duration: 0.55 }}
                className="absolute"
              >
                <svg className="w-44 h-44 text-cyan-300 drop-shadow-[0_0_35px_rgba(6,182,212,1)]" viewBox="0 0 100 100">
                  <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                  <line x1="85" y1="15" x2="15" y2="85" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                </svg>
              </motion.div>
            )}

            {/* Boss Ocular Laser Beam Attack (Shoots directly from boss eyes to player chest) */}
            {enemyState === "ATTACK" && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0.2 }}
                animate={{ opacity: [0, 1, 1, 0.9, 0], scaleY: [0.2, 1.6, 1.1, 1.4, 0] }}
                transition={{ duration: 0.7, times: [0, 0.15, 0.5, 0.8, 1] }}
                className="absolute inset-x-4 sm:inset-x-12 bottom-16 sm:bottom-24 h-24 pointer-events-none z-30 flex items-center origin-right -rotate-2"
              >
                <div className="w-full h-5 sm:h-7 bg-gradient-to-r from-cyan-400 via-rose-500 to-amber-300 shadow-[0_0_40px_rgba(244,63,94,1)] rounded-full blur-[1px] relative">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 sm:h-3 bg-white rounded-full shadow-[0_0_25px_rgba(255,255,255,1)]" />
                </div>
                {/* Corona flare at boss eye source */}
                <div className="absolute right-0 w-24 h-24 rounded-full bg-rose-400 blur-md animate-ping" />
                {/* Searing impact flare directly on player hero */}
                <div className="absolute left-0 w-28 h-28 rounded-full bg-cyan-300 blur-lg animate-pulse" />
              </motion.div>
            )}
          </div>

          {/* Right: Daily Boss Sprite (No Black Box, 3D Digital Creature) */}
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
                  animate={{ opacity: 1, y: -50, scale: 1.35 }}
                  exit={{ opacity: 0, y: -80 }}
                  className="absolute -top-12 z-30 font-display font-black text-2xl text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,1)]"
                >
                  {damageNumber.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Victory Modal */}
        <AnimatePresence>
          {showLoot && completedReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-[0_0_35px_rgba(245,158,11,0.6)] mb-3">
                🏆
              </div>
              <h3 className="text-2xl font-black font-cinzel text-amber-200">
                DAILY ADVERSARY VANQUISHED!
              </h3>
              <p className="text-sm font-rajdhani text-slate-200 max-w-sm mt-1">
                All daily conquests completed. Realm peace restored!
              </p>
              <div className="flex items-center gap-4 mt-4 px-6 py-3 rounded-2xl bg-indigo-950/80 border border-amber-400/50">
                <span className="text-amber-300 font-black font-mono">+{completedReward.earned_xp} XP</span>
                <span className="text-indigo-400">|</span>
                <span className="text-yellow-300 font-black font-mono">+{completedReward.earned_gold} GOLD</span>
                <span className="text-indigo-400">|</span>
                <span className="text-rose-300 font-black font-mono">{completedReward.current_streak} DAY STREAK</span>
              </div>
              <Button
                onClick={() => setShowLoot(false)}
                className="mt-6 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-cinzel font-black px-8 py-3 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)]"
              >
                Claim Realm Spoils
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ========================================================================= */}
      {/* 3. FIGHTING GAME ARCADE / CONSOLE CONTROLLER HUD DOCK                      */}
      {/* ========================================================================= */}
      <div className="w-full p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#10173e]/95 via-[#162157]/95 to-[#10173e]/95 border-2 border-amber-400/40 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-5">
        {/* Left Side: Arcade D-Pad Cross */}
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl bg-black/50 border border-indigo-500/40 shadow-inner">
            <div />
            <button
              onClick={() => handleControllerMove(1)}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950/80 border border-indigo-400/50 flex items-center justify-center text-indigo-300 hover:bg-indigo-800 hover:text-white transition-all active:scale-95 shadow-md",
                activeButton === "UP" && "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              )}
              title="Jump / Stance [▲]"
            >
              <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div />

            <button
              onClick={() => handleControllerMove(-1)}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950/80 border border-indigo-400/50 flex items-center justify-center text-indigo-300 hover:bg-indigo-800 hover:text-white transition-all active:scale-95 shadow-md",
                activeButton === "LEFT" && "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              )}
              title="Step Back [◀ or Left Arrow]"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-black/60 flex items-center justify-center text-[10px] font-mono text-indigo-400/60">
              •
            </div>

            <button
              onClick={() => handleControllerMove(1)}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950/80 border border-indigo-400/50 flex items-center justify-center text-indigo-300 hover:bg-indigo-800 hover:text-white transition-all active:scale-95 shadow-md",
                activeButton === "RIGHT" && "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              )}
              title="Advance Forward [▶ or Right Arrow]"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <div />
            <button
              onClick={() => handleControllerMove(-1)}
              className={cn(
                "w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950/80 border border-indigo-400/50 flex items-center justify-center text-indigo-300 hover:bg-indigo-800 hover:text-white transition-all active:scale-95 shadow-md",
                activeButton === "DOWN" && "bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              )}
              title="Crouch / Guard [▼]"
            >
              <ArrowDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div />
          </div>

          <div className="hidden sm:flex flex-col">
            <span className="text-xs font-cinzel font-bold text-amber-200 uppercase tracking-wider">
              Combat Stick
            </span>
            <span className="text-[10px] font-rajdhani text-indigo-200">
              Use [←] [→] Arrows to position fighter
            </span>
          </div>
        </div>

        {/* Right Side: Arcade Fighting Action Cluster */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
          {/* Action [A]: ATTACK */}
          <button
            onClick={handleControllerAttack}
            disabled={isBattling}
            className={cn(
              "group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-cinzel text-[11px] sm:text-xs font-black transition-all active:scale-95 shadow-lg",
              activeButton === "ATTACK"
                ? "bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.9)] scale-105"
                : "bg-gradient-to-b from-[#241a45] to-[#161131] border-amber-500/50 text-amber-200 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            )}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-amber-300">
              A
            </span>
            <Sword className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>ATTACK</span>
          </button>

          {/* Action [S]: SPECIAL */}
          <button
            onClick={handleControllerSpecial}
            disabled={isBattling}
            className={cn(
              "group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-cinzel text-[11px] sm:text-xs font-black transition-all active:scale-95 shadow-lg",
              activeButton === "SPECIAL"
                ? "bg-purple-500 text-white border-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.9)] scale-105"
                : "bg-gradient-to-b from-[#26134b] to-[#170c30] border-purple-500/50 text-purple-200 hover:border-purple-400 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            )}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-purple-500/20 border border-purple-400/60 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-purple-300">
              S
            </span>
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            <span>SPECIAL</span>
          </button>

          {/* Action [D]: DODGE */}
          <button
            onClick={handleControllerDodge}
            disabled={isBattling}
            className={cn(
              "group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border font-cinzel text-[11px] sm:text-xs font-black transition-all active:scale-95 shadow-lg",
              activeButton === "DODGE"
                ? "bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.9)] scale-105"
                : "bg-gradient-to-b from-[#122847] to-[#0c1a30] border-cyan-500/50 text-cyan-200 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            )}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-cyan-300">
              D
            </span>
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span>DODGE</span>
          </button>

          {/* Action [F]: TASK FINISHER */}
          <button
            onClick={handleQuickDemoComplete}
            disabled={isBattling}
            className={cn(
              "group relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl border font-cinzel text-[11px] sm:text-xs font-black transition-all active:scale-95 shadow-lg",
              activeButton === "FINISHER"
                ? "bg-rose-500 text-white border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.9)] scale-105"
                : "bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-slate-950 border-amber-300 hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.5)]"
            )}
          >
            <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-black/30 border border-black/50 flex items-center justify-center text-[9px] sm:text-[10px] font-mono text-white">
              F
            </span>
            <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 fill-slate-950" />
            <span>FINISHER</span>
          </button>
        </div>
      </div>

      {/* 4. TODAY'S BOSS & TASK MANIFEST CHECKLIST (Translucent Sapphire Blue + Amber) */}
      <div className="w-full rounded-3xl bg-[#11183d]/90 border border-indigo-400/40 p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/30 pb-3">
          <div>
            <h4 className="text-base font-cinzel font-black text-amber-200 tracking-wide flex items-center gap-2">
              <span>Today&apos;s Boss Manifest: {enemyInfo.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-400/60 text-rose-200 font-mono font-bold">
                {enemyHp} / 100 HP
              </span>
            </h4>
            <p className="text-xs font-rajdhani text-indigo-200 mt-0.5">
              Complete each real-life task on your bounty list to strike and weaken the boss throughout the day.
            </p>
          </div>

          <div className="text-xs font-rajdhani font-bold px-3 py-1.5 rounded-xl bg-black/40 border border-indigo-400/40 text-amber-300 self-start sm:self-auto">
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
                  "flex items-center justify-between p-3.5 rounded-2xl border transition-all",
                  isDone
                    ? "bg-emerald-950/30 border-emerald-400/40 text-emerald-200 opacity-85"
                    : "bg-[#16204d]/80 border-indigo-400/40 hover:border-amber-400/70 text-slate-100 shadow-md"
                )}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-amber-400/70 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-semibold truncate",
                        isDone ? "line-through text-slate-400" : "text-slate-100"
                      )}
                    >
                      {quest.title}
                    </span>
                    <span className="text-[11px] text-indigo-200 font-rajdhani block">
                      +{quest.base_xp} XP &bull; +{quest.base_gold} Gold &bull; {quest.difficulty}
                    </span>
                  </div>
                </div>

                {!isDone && (
                  <Button
                    size="sm"
                    disabled={isBattling || isCompleting}
                    onClick={() => {
                      const idx = availableQuests.findIndex((q) => q.id === quest.id);
                      if (idx !== -1) setActiveIndex(idx);
                      handleStrikeActiveQuest();
                    }}
                    className="h-8 px-3 text-xs font-rajdhani font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  >
                    {isCompleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Strike Task"}
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