"use client";

import { motion, Variants, useReducedMotion } from "framer-motion";
import { CharacterAttribute, QuestDifficulty } from "@/types/quest";
import { cn } from "@/lib/utils";

export type EnemyBattleState = "IDLE" | "HIT" | "DEFEATED";

interface EnemySpriteProps {
  state: EnemyBattleState;
  attribute: CharacterAttribute;
  difficulty: QuestDifficulty;
  name?: string;
  className?: string;
}

export function getEnemyArchetypeInfo(attribute: CharacterAttribute, difficulty: QuestDifficulty): {
  name: string;
  title: string;
  primaryColor: string;
  glowColor: string;
  bgRune: string;
} {
  switch (attribute) {
    case "INTELLECT":
      return {
        name: difficulty === "EPIC" ? "Void Archon" : difficulty === "HARD" ? "Mindbinder Phantom" : "Arcane Wolf",
        title: "Master of Forbidden Knowledge",
        primaryColor: "#818cf8",
        glowColor: "rgba(129, 140, 248, 0.45)",
        bgRune: "✦",
      };
    case "STRENGTH":
      return {
        name: difficulty === "EPIC" ? "Basalt Colossus" : difficulty === "HARD" ? "Gorgon Behemoth" : "Stone Brute",
        title: "Unyielding Granite Titan",
        primaryColor: "#f87171",
        glowColor: "rgba(248, 113, 113, 0.45)",
        bgRune: "⚔",
      };
    case "DISCIPLINE":
      return {
        name: difficulty === "EPIC" ? "Dread Warden" : difficulty === "HARD" ? "Ironclad Inquisitor" : "Shadow Wraith",
        title: "Stalker of Unfocused Hours",
        primaryColor: "#c084fc",
        glowColor: "rgba(192, 132, 252, 0.45)",
        bgRune: "👁",
      };
    case "VITALITY":
      return {
        name: difficulty === "EPIC" ? "Verdant Wyrm" : difficulty === "HARD" ? "Bramble Abomination" : "Mossfang Beast",
        title: "Corruptor of Inner Stamina",
        primaryColor: "#34d399",
        glowColor: "rgba(52, 211, 153, 0.45)",
        bgRune: "🌿",
      };
    case "CREATIVITY":
    default:
      return {
        name: difficulty === "EPIC" ? "Chaos Chimera" : difficulty === "HARD" ? "Astral Illusionist" : "Prism Imp",
        title: "Thief of Sparkling Inspiration",
        primaryColor: "#fbbf24",
        glowColor: "rgba(251, 191, 36, 0.45)",
        bgRune: "✧",
      };
  }
}

export function EnemySprite({
  state = "IDLE",
  attribute,
  difficulty,
  className,
}: EnemySpriteProps) {
  const shouldReduceMotion = useReducedMotion();
  const archetype = getEnemyArchetypeInfo(attribute, difficulty);
  const displayName = archetype.name;

  // Animations based on battle state
  const enemyVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, opacity: 1 }
      : {
          y: [0, -8, 0],
          transition: {
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.5 }
      : {
          x: [0, 28, -12, 18, 0],
          y: [0, -6, 2, -2, 0],
          scale: [1, 0.92, 1.05, 0.98, 1],
          transition: {
            duration: 0.6,
            ease: "easeInOut",
          },
        },
    DEFEATED: shouldReduceMotion
      ? { opacity: 0 }
      : {
          scale: [1, 1.25, 0],
          opacity: [1, 0.9, 0],
          rotate: [0, 15, -25],
          y: [0, -20, 40],
          transition: {
            duration: 0.9,
            ease: "easeIn",
          },
        },
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Pedestal Shadow & Threat Aura */}
      <div className="absolute -bottom-3 w-32 h-8 bg-black/60 rounded-full blur-sm pointer-events-none" />
      <div
        className="absolute -bottom-2 w-28 h-6 rounded-full border border-slate-700/40 opacity-75 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${archetype.glowColor}, transparent 70%)`,
        }}
      />

      {/* Animated Enemy Vector Canvas */}
      <motion.div
        variants={enemyVariants}
        animate={state}
        className="relative z-10 w-36 h-48 sm:w-44 sm:h-56 flex items-center justify-center"
      >
        {/* Flash Effect on HIT */}
        {state === "HIT" && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-white/70 rounded-full blur-md z-30 pointer-events-none"
          />
        )}

        {/* Dynamic Archetype Vector SVG */}
        <svg
          viewBox="0 0 160 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.7)]"
          aria-label={`Enemy ${displayName} in state ${state}`}
        >
          <defs>
            <filter id={`enemy-glow-${attribute}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <radialGradient id={`core-grad-${attribute}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor={archetype.primaryColor} />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>
          </defs>

          {/* 1. INTELLECT — Astral Arcane Wolf */}
          {attribute === "INTELLECT" && (
            <g transform="translate(0, 15)">
              {/* Floating Star Crystals */}
              <polygon points="26,45 32,32 38,45 32,58" fill={archetype.primaryColor} filter={`url(#enemy-glow-${attribute})`} />
              <polygon points="128,40 134,28 140,40 134,52" fill={archetype.primaryColor} filter={`url(#enemy-glow-${attribute})`} />
              <polygon points="80,12 86,2 92,12 86,22" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />

              {/* Wolf Body & Mane */}
              <path
                d="M 40 145 C 30 110 45 75 75 60 C 105 75 120 110 110 145 C 95 165 55 165 40 145 Z"
                fill="#0f172a"
                stroke={archetype.primaryColor}
                strokeWidth="2.5"
              />
              {/* Wolf Ears */}
              <polygon points="52,65 44,30 68,52" fill="#1e293b" stroke={archetype.primaryColor} strokeWidth="2" />
              <polygon points="98,65 106,30 82,52" fill="#1e293b" stroke={archetype.primaryColor} strokeWidth="2" />
              {/* Glowing Eyes */}
              <ellipse cx="64" cy="85" rx="5" ry="3" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              <ellipse cx="86" cy="85" rx="5" ry="3" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              {/* Arcane Snout & Fangs */}
              <polygon points="75,95 72,112 78,112" fill={archetype.primaryColor} />
              <polygon points="68,114 75,124 82,114" fill="#020617" stroke={archetype.primaryColor} strokeWidth="1.5" />
              {/* Forelegs */}
              <rect x="52" y="140" width="14" height="28" rx="6" fill="#1e293b" stroke={archetype.primaryColor} strokeWidth="1.5" />
              <rect x="84" y="140" width="14" height="28" rx="6" fill="#1e293b" stroke={archetype.primaryColor} strokeWidth="1.5" />
            </g>
          )}

          {/* 2. STRENGTH — Basalt Stone Brute */}
          {attribute === "STRENGTH" && (
            <g transform="translate(0, 10)">
              {/* Spiked Horns */}
              <polygon points="45,55 24,20 55,42" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
              <polygon points="105,55 126,20 95,42" fill="#881337" stroke="#f43f5e" strokeWidth="2" />
              {/* Massive Stone Shoulders */}
              <path
                d="M 25 80 L 75 52 L 125 80 L 115 150 L 35 150 Z"
                fill="#1c1917"
                stroke="#f43f5e"
                strokeWidth="3"
              />
              {/* Magma Fissure Core */}
              <circle cx="75" cy="108" r="16" fill={`url(#core-grad-${attribute})`} filter={`url(#enemy-glow-${attribute})`} />
              {/* Fierce Visor Eye Slit */}
              <polygon points="56,72 94,72 88,80 62,80" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              {/* Stone Fists */}
              <rect x="18" y="112" width="22" height="34" rx="8" fill="#292524" stroke="#f43f5e" strokeWidth="2" />
              <rect x="110" y="112" width="22" height="34" rx="8" fill="#292524" stroke="#f43f5e" strokeWidth="2" />
            </g>
          )}

          {/* 3. DISCIPLINE — Sanctum Shadow Wraith */}
          {attribute === "DISCIPLINE" && (
            <g transform="translate(0, 12)">
              {/* Floating Spectral Hood */}
              <path
                d="M 75 35 C 45 35 38 75 42 120 C 50 168 100 168 108 120 C 112 75 105 35 75 35 Z"
                fill="#022c22"
                stroke="#10b981"
                strokeWidth="2.5"
              />
              {/* Void Face with Piercing Green Orbs */}
              <ellipse cx="75" cy="82" rx="22" ry="26" fill="#020617" />
              <circle cx="66" cy="80" r="4" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              <circle cx="84" cy="80" r="4" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              {/* Floating Jade Spirit Daggers */}
              <polygon points="24,80 28,62 32,80 28,98" fill="#10b981" filter={`url(#enemy-glow-${attribute})`} />
              <polygon points="120,80 124,62 128,80 124,98" fill="#10b981" filter={`url(#enemy-glow-${attribute})`} />
              {/* Swirling Wisp Tail */}
              <path d="M 52 155 Q 75 185 98 155" stroke="#10b981" strokeWidth="3" fill="none" strokeDasharray="4 4" />
            </g>
          )}

          {/* 4. VITALITY — Springs Vitalis Wyrm */}
          {attribute === "VITALITY" && (
            <g transform="translate(0, 15)">
              {/* Sunstone Antlers / Horns */}
              <path d="M 58 45 C 40 25 35 10 45 4" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 92 45 C 110 25 115 10 105 4" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Serpent Wyrm Coils */}
              <path
                d="M 50 65 C 30 90 40 145 75 155 C 110 145 120 90 100 65 C 90 48 60 48 50 65 Z"
                fill="#451a03"
                stroke="#f59e0b"
                strokeWidth="2.5"
              />
              {/* Golden Sun Scales */}
              <circle cx="75" cy="100" r="14" fill={`url(#core-grad-${attribute})`} filter={`url(#enemy-glow-${attribute})`} />
              {/* Glowing Amber Eyes */}
              <circle cx="64" cy="74" r="4" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              <circle cx="86" cy="74" r="4" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              {/* Flourishing Leaf Tendrils */}
              <circle cx="42" cy="115" r="5" fill="#fef08a" />
              <circle cx="108" cy="115" r="5" fill="#fef08a" />
            </g>
          )}

          {/* 5. CREATIVITY — The Arcanum Chaos Sprite */}
          {attribute === "CREATIVITY" && (
            <g transform="translate(0, 15)">
              {/* Orbiting Arcane Rune Diamonds */}
              <polygon points="26,75 32,62 38,75 32,88" fill="#c084fc" filter={`url(#enemy-glow-${attribute})`} />
              <polygon points="118,75 124,62 130,75 124,88" fill="#c084fc" filter={`url(#enemy-glow-${attribute})`} />
              <polygon points="75,22 81,12 87,22 81,32" fill="#ffffff" filter={`url(#enemy-glow-${attribute})`} />
              {/* Prismatic Core */}
              <polygon
                points="75,45 112,82 75,145 38,82"
                fill="#581c87"
                stroke="#c084fc"
                strokeWidth="2.5"
              />
              {/* Inner Radiant Crystal */}
              <polygon points="75,60 98,82 75,125 52,82" fill={`url(#core-grad-${attribute})`} filter={`url(#enemy-glow-${attribute})`} />
              {/* Glowing Arcane Eye Ring */}
              <circle cx="75" cy="82" r="7" fill="#ffffff" />
              <circle cx="75" cy="82" r="3" fill="#3b0764" />
            </g>
          )}
        </svg>
      </motion.div>

      {/* Threat Name & Domain Indicator */}
      <div className="relative z-20 -mt-2 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-slate-700 text-[10px] font-mono font-bold flex items-center gap-1.5 shadow">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: archetype.primaryColor }} />
        <span className="text-slate-200">{displayName}</span>
      </div>
    </div>
  );
}
