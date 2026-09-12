"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldLevel: number;
  newLevel: number;
  levelsGained?: number;
  characterName?: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  oldLevel,
  newLevel,
  levelsGained = 1,
  characterName = "Adventurer",
}: LevelUpModalProps) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const modalTransition: Transition = shouldReduceMotion
    ? { duration: 0.05 }
    : { type: "spring", stiffness: 350, damping: 25 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          {/* Animated Card Container */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { scale: 0.85, opacity: 0, y: 20 }}
            transition={modalTransition}
            className="relative w-full max-w-md rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-8 shadow-[0_0_60px_rgba(245,158,11,0.25)] text-center overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Celebratory Icon Crest */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { scale: 0 }}
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { scale: 1, rotate: [0, -10, 10, 0] }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.05 }
                  : { delay: 0.15, type: "spring", stiffness: 300, damping: 15 }
              }
              className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              <div className="flex h-full w-full items-center justify-center rounded-2xl bg-slate-950">
                <Trophy className="h-12 w-12 text-amber-400 animate-bounce" />
              </div>
            </motion.div>

            {/* Subheading */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2"
            >
              <Sparkles className="h-3.5 w-3.5" /> Breakthrough Achieved
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase"
            >
              Level Up!
            </motion.h2>

            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Your disciplined dedication has yielded greater power, {characterName}.
            </p>

            {/* Level Transition Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="my-6 p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-center gap-5"
            >
              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Previous
                </span>
                <span className="text-2xl font-black font-mono text-slate-300">
                  Lv.{oldLevel}
                </span>
              </div>

              <div className="flex items-center text-amber-400">
                <ArrowRight className="h-6 w-6 animate-pulse" />
              </div>

              <div className="text-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Ascended
                </span>
                <span className="text-3xl font-black font-mono text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                  Lv.{newLevel}
                </span>
              </div>
            </motion.div>

            {/* Multi-level notice if applicable */}
            {levelsGained > 1 && (
              <p className="text-xs font-semibold text-amber-400 mb-4">
                Phenomenal Surge! +{levelsGained} Levels Gained in a single triumph!
              </p>
            )}

            {/* Perks description */}
            <div className="space-y-1.5 text-xs text-slate-400 mb-6 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Higher Rank Multipliers & Prestige Unlocked
              </div>
            </div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="gold"
                size="lg"
                onClick={onClose}
                className="w-full font-bold text-sm tracking-wide uppercase py-3 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                Claim Glory
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
