"use client";

import { motion, Variants, useReducedMotion } from "framer-motion";
import { getHeroArchetype, HeroArchetype } from "@/lib/hero-data";
import { cn } from "@/lib/utils";

export type HeroCombatState = "IDLE" | "READY" | "APPROACH" | "ATTACK" | "ATTACK_COMBO" | "ATTACK_FINISHER" | "HIT" | "VICTORY" | "DODGE";

interface HeroCharacterProps {
  heroId?: string;
  state?: HeroCombatState;
  equippedTheme?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showShadow?: boolean;
  username?: string;
}

export function HeroCharacter({
  heroId = "vanguard_male",
  state = "IDLE",
  equippedTheme = "default_slate",
  className,
  size = "md",
  showShadow = true,
  username,
}: HeroCharacterProps) {
  const shouldReduceMotion = useReducedMotion();
  const hero: HeroArchetype = getHeroArchetype(heroId);

  // Dimension scaling
  const sizeClasses = {
    sm: "w-24 h-32 sm:w-28 sm:h-36",
    md: "w-28 h-40 sm:w-44 sm:h-56",
    lg: "w-32 h-44 sm:w-56 sm:h-72",
    xl: "w-44 h-60 sm:w-72 sm:h-96",
  };

  // Theme overrides if cosmetic theme equipped
  const getThemeColors = () => {
    switch (equippedTheme) {
      case "theme_sunfire_gold":
        return { primary: "#f59e0b", secondary: "#fbbf24", glow: "rgba(245, 158, 11, 0.6)" };
      case "theme_emerald_forest":
        return { primary: "#10b981", secondary: "#34d399", glow: "rgba(16, 185, 129, 0.6)" };
      case "theme_arcane_violet":
        return { primary: "#a855f7", secondary: "#c084fc", glow: "rgba(168, 85, 247, 0.6)" };
      default:
        return {
          primary: hero.primaryColor,
          secondary: hero.secondaryColor,
          glow: hero.accentGlow,
        };
    }
  };

  const colors = getThemeColors();

  // Motion variants for body rig
  const bodyVariants: Variants = {
    IDLE: shouldReduceMotion
      ? { scale: 1, x: 0, y: 0 }
      : {
          y: [0, -6, 0],
          transition: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    READY: shouldReduceMotion
      ? { scale: 1.02, x: 5 }
      : {
          y: [0, -3, 0],
          x: [0, 4, 0],
          scale: [1, 1.02, 1],
          transition: {
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
    APPROACH: shouldReduceMotion
      ? { x: 30 }
      : {
          x: [0, 45, 30],
          y: [0, -6, 0],
          transition: { duration: 0.5, ease: "easeOut" },
        },
    ATTACK: shouldReduceMotion
      ? { x: 60 }
      : {
          x: [0, -15, 95, 60, 0],
          y: [0, -4, -14, -2, 0],
          transition: {
            duration: 0.85,
            times: [0, 0.2, 0.55, 0.8, 1],
            ease: "easeOut",
          },
        },
    ATTACK_COMBO: shouldReduceMotion
      ? { x: 70 }
      : {
          x: [0, 60, 30, 105, 70, 0],
          y: [0, -10, 0, -16, -4, 0],
          transition: {
            duration: 0.95,
            times: [0, 0.25, 0.45, 0.7, 0.85, 1],
            ease: "easeOut",
          },
        },
    ATTACK_FINISHER: shouldReduceMotion
      ? { x: 90, scale: 1.15 }
      : {
          x: [0, -20, 120, 80, 0],
          y: [0, -18, -25, -6, 0],
          scale: [1, 1.05, 1.3, 1.15, 1],
          transition: {
            duration: 1.1,
            times: [0, 0.25, 0.6, 0.85, 1],
            ease: "easeOut",
          },
        },
    HIT: shouldReduceMotion
      ? { opacity: 0.65, x: -15 }
      : {
          x: [0, -32, -16, 0],
          rotate: [0, -8, -2, 0],
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        },
    DODGE: shouldReduceMotion
      ? { opacity: 0.7, x: -30 }
      : {
          x: [0, -45, -20],
          scale: [1, 0.92, 1],
          opacity: [1, 0.6, 1],
          transition: { duration: 0.45, ease: "easeOut" },
        },
    VICTORY: shouldReduceMotion
      ? { scale: 1.08, y: -8 }
      : {
          y: [0, -18, 0, -10, 0],
          scale: [1, 1.08, 1, 1.04, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        },
  };

  // Weapon swing / discharge animation variants
  const weaponVariants: Variants = {
    IDLE: {
      rotate: [0, 4, 0],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
    },
    READY: {
      rotate: [0, -12, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    APPROACH: {
      rotate: [-10, -25, -15],
      transition: { duration: 0.5 },
    },
    ATTACK: {
      rotate: hero.weaponType === "bow" ? [0, -20, 15, -5, 0] : [0, -50, 85, 30, 0],
      scale: [1, 1.25, 1.45, 1.1, 1],
      transition: { duration: 0.85, times: [0, 0.2, 0.55, 0.8, 1] },
    },
    ATTACK_COMBO: {
      rotate: hero.weaponType === "bow" ? [0, -25, 20, -10, 0] : [-30, 60, -40, 90, 0],
      scale: [1, 1.3, 1.1, 1.4, 1],
      transition: { duration: 0.95 },
    },
    ATTACK_FINISHER: {
      rotate: hero.weaponType === "bow" ? [0, -35, 25, 0] : [-60, 110, 40, 0],
      scale: [1, 1.4, 1.6, 1.1, 1],
      transition: { duration: 1.1 },
    },
    HIT: {
      rotate: [0, -20, 0],
      transition: { duration: 0.5 },
    },
    DODGE: shouldReduceMotion
      ? { opacity: 0.7, x: -30 }
      : {
          x: [0, -45, -20],
          scale: [1, 0.92, 1],
          opacity: [1, 0.6, 1],
          transition: { duration: 0.45, ease: "easeOut" },
        },
    VICTORY: {
      rotate: [-25, -45, -25],
      y: [-6, -14, -6],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className={cn("relative flex flex-col items-center select-none", className)}>
      {/* Ground Contact Shadow & Elemental Energy Ring */}
      {showShadow && (
        <>
          <div className="absolute -bottom-3 w-32 h-8 bg-black/60 rounded-full blur-sm pointer-events-none" />
          <div
            className="absolute -bottom-2 w-28 h-6 rounded-full border border-amber-500/30 opacity-70 pointer-events-none animate-pulse"
            style={{
              background: `radial-gradient(ellipse at center, ${colors.glow}, transparent 70%)`,
            }}
          />
        </>
      )}

      {/* Hero Animated Sprite Rig */}
      <motion.div
        variants={bodyVariants}
        animate={state}
        className={cn("relative z-10 flex items-center justify-center", sizeClasses[size])}
      >
        {/* Dynamic Class-Specific Attack Visual Effects */}
        {(state === "ATTACK" || state === "ATTACK_COMBO" || state === "ATTACK_FINISHER") && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.7 }}
            animate={{
              opacity: [0, 1, 0],
              x: state === "ATTACK_FINISHER" ? 110 : 75,
              scale: state === "ATTACK_FINISHER" ? [0.8, 1.8, 2.2] : [0.7, 1.4, 1.6],
            }}
            transition={{ duration: 0.55, times: [0, 0.45, 1] }}
            className="absolute -right-16 top-1/4 z-40 pointer-events-none flex items-center justify-center"
          >
            {hero.weaponType === "bow" ? (
              /* Mystic Emerald Arrow Projectile */
              <svg viewBox="0 0 100 40" className="w-24 h-10 filter drop-shadow-[0_0_12px_rgba(52,211,153,0.9)]">
                <path d="M0 20 L80 20 M70 12 L90 20 L70 28" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
                <circle cx="85" cy="20" r="5" fill="#ffffff" />
              </svg>
            ) : hero.weaponType === "staff" ? (
              /* Arcane Cosmic Energy Orb */
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 blur-sm shadow-[0_0_25px_rgba(168,85,247,0.9)]" />
                <div className="absolute w-8 h-8 rounded-full bg-white animate-ping" />
              </div>
            ) : hero.weaponType === "dual_blades" ? (
              /* Shadow Cross Slash */
              <svg viewBox="0 0 100 100" className="w-24 h-24 filter drop-shadow-[0_0_15px_rgba(192,132,252,0.9)]">
                <path d="M15 15 L85 85 M85 15 L15 85" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" />
                <path d="M25 25 L75 75 M75 25 L25 75" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              /* Vanguard Golden Blade Cleave Crescent */
              <svg viewBox="0 0 120 120" className="w-28 h-28 filter drop-shadow-[0_0_20px_rgba(245,158,11,0.9)]">
                <path
                  d="M20 20 C 50 40, 85 75, 105 110 C 80 80, 45 45, 10 25 Z"
                  fill="url(#vanguard-cleave-grad)"
                />
                <path
                  d="M30 15 C 60 35, 95 70, 115 105 C 90 75, 55 40, 20 20 Z"
                  fill="#ffffff"
                  opacity="0.9"
                />
                <defs>
                  <linearGradient id="vanguard-cleave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </motion.div>
        )}
        <svg
          viewBox="0 0 160 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(0,0,0,0.65)]"
          aria-label={`Hero character ${hero.name} (${hero.title}) in state ${state}`}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={`${hero.id}-skin`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>

            <linearGradient id={`${hero.id}-armor`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id={`${hero.id}-primary`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>

            <linearGradient id={`${hero.id}-accent`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor={colors.secondary} />
              <stop offset="100%" stopColor={colors.primary} />
            </linearGradient>

            <filter id={`${hero.id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* HERO SPECIFIC CHARACTER RIGS                             */}
          {/* ======================================================== */}

          {/* 1. VALEN  -  THE VANGUARD (HEAVY SWORD FIGHTER MALE) */}
          {hero.id === "vanguard_male" && (
            <g id="valen-vanguard">
              {/* Scarlet Mantle Cape */}
              <path
                d="M50 78 C35 110 32 165 44 185 C58 168 62 120 66 90 Z"
                fill="url(#vanguard_male-primary)"
                opacity="0.9"
              />
              <path
                d="M102 78 C118 110 122 165 110 185 C98 168 94 120 90 90 Z"
                fill="url(#vanguard_male-primary)"
                opacity="0.9"
              />

              {/* Legs / Armored Greaves */}
              <path d="M60 135 L56 182 L70 184 L72 135 Z" fill="#1e293b" />
              <path d="M84 135 L82 184 L96 182 L92 135 Z" fill="#1e293b" />
              <path d="M54 178 L72 178 L74 186 L52 186 Z" fill="#0f172a" />
              <path d="M80 178 L98 178 L100 186 L78 186 Z" fill="#0f172a" />

              {/* Heavy Plate Cuirass */}
              <path
                d="M55 75 L97 75 L102 132 L50 132 Z"
                fill="url(#vanguard_male-armor)"
                stroke="#475569"
                strokeWidth="2"
              />
              {/* Crimson Insignia Crest */}
              <polygon
                points="76,82 86,96 76,110 66,96"
                fill="url(#vanguard_male-primary)"
                filter="url(#vanguard_male-glow)"
              />
              {/* Belt & Buckle */}
              <rect x="52" y="125" width="48" height="9" fill="#0f172a" rx="2" />
              <rect x="71" y="123" width="10" height="13" fill="#f59e0b" rx="2" />

              {/* Spiked Gold Pauldrons */}
              <path
                d="M44 76 C40 68 50 62 60 68 L58 84 L44 82 Z"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1.5"
              />
              <path
                d="M108 76 C112 68 102 62 92 68 L94 84 L108 82 Z"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1.5"
              />

              {/* Head & Warrior Face */}
              <ellipse cx="76" cy="46" rx="14" ry="16" fill="url(#vanguard_male-skin)" />
              {/* Determined Eyes */}
              <rect x="68" y="44" width="4" height="2" rx="1" fill="#0f172a" />
              <rect x="80" y="44" width="4" height="2" rx="1" fill="#0f172a" />
              {/* Golden Warrior Hair Swept Up */}
              <path
                d="M62 44 C60 26 74 20 86 24 C96 28 94 38 90 44 C84 32 72 32 62 44 Z"
                fill="#f59e0b"
                stroke="#b45309"
                strokeWidth="1"
              />

              {/* WEAPON: Solar Claymore naturally gripped in hand */}
              <motion.g
                variants={weaponVariants}
                animate={state}
                style={{ originX: "115px", originY: "95px" }}
              >
                {/* Armored Forearm connecting from pauldron to hilt */}
                <path d="M102 78 L115 94" stroke="#334155" strokeWidth="7" strokeLinecap="round" />
                <path d="M102 78 L115 94" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
                {/* Leather Wrapped Sword Hilt */}
                <path d="M112 90 L118 90 L118 106 L112 106 Z" fill="#78350f" />
                {/* Faceted Gold Pommel */}
                <circle cx="115" cy="108" r="3.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                {/* Gauntlet Hand gripping hilt firmly */}
                <ellipse cx="115" cy="95" rx="5.5" ry="4.5" fill="#475569" stroke="#f59e0b" strokeWidth="1.5" />
                {/* Crossguard with Sunburst Wings */}
                <rect x="103" y="86" width="24" height="5" rx="2" fill="#f59e0b" stroke="#b45309" strokeWidth="0.8" />
                <polygon points="103,88 98,85 103,83" fill="#f59e0b" />
                <polygon points="127,88 132,85 127,83" fill="#f59e0b" />
                {/* Claymore Blade with Runic Glow Channel */}
                <path
                  d="M112 86 L113 18 L115 10 L117 18 L118 86 Z"
                  fill="url(#vanguard_male-accent)"
                  stroke="#ffffff"
                  strokeWidth="1"
                />
                <line
                  x1="115"
                  y1="22"
                  x2="115"
                  y2="82"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  filter="url(#vanguard_male-glow)"
                />
              </motion.g>
            </g>
          )}

          {/* 2. KAELEN  -  THE SHADOW BLADE (AGILE DUAL BLADES ROGUE MALE) */}
          {hero.id === "rogue_male" && (
            <g id="kaelen-rogue">
              {/* Shadow Mist Tendrils */}
              <path
                d="M48 90 C30 115 36 170 48 188 C54 165 56 125 58 95 Z"
                fill="#0f172a"
                opacity="0.85"
              />
              <path
                d="M104 90 C122 115 116 170 104 188 C98 165 96 125 94 95 Z"
                fill="#0f172a"
                opacity="0.85"
              />

              {/* Sleek Agility Leggings */}
              <path d="M62 135 L58 184 L71 185 L74 135 Z" fill="#1e293b" />
              <path d="M82 135 L79 185 L92 184 L88 135 Z" fill="#1e293b" />
              {/* Cyan Runic Boots */}
              <path d="M56 179 L73 179 L75 186 L54 186 Z" fill="#0891b2" />
              <path d="M77 179 L94 179 L96 186 L75 186 Z" fill="#0891b2" />

              {/* Stealth Leather Vest & Electric Cyan Trims */}
              <path
                d="M56 78 L96 78 L100 134 L52 134 Z"
                fill="#0f172a"
                stroke="#0891b2"
                strokeWidth="1.5"
              />
              <line x1="62" y1="92" x2="90" y2="92" stroke="#06b6d4" strokeWidth="2" filter="url(#rogue_male-glow)" />
              <line x1="66" y1="104" x2="86" y2="104" stroke="#06b6d4" strokeWidth="1.5" />
              <line x1="70" y1="116" x2="82" y2="116" stroke="#06b6d4" strokeWidth="1" />

              {/* Hooded Cowl & Shadow Head */}
              <ellipse cx="76" cy="46" rx="13" ry="15" fill="url(#rogue_male-skin)" />
              {/* Deep Shadow Assassin Hood */}
              <path
                d="M58 48 C56 22 72 16 86 18 C98 22 96 46 94 52 C88 32 78 30 64 48 Z"
                fill="#0f172a"
                stroke="#0891b2"
                strokeWidth="1.5"
              />
              {/* Glowing Electric Cyan Mask Eyes */}
              <circle cx="70" cy="46" r="2" fill="#22d3ee" filter="url(#rogue_male-glow)" />
              <circle cx="82" cy="46" r="2" fill="#22d3ee" filter="url(#rogue_male-glow)" />

              {/* WEAPONS: Twin Arc Daggers */}
              {/* Left Dagger (Reverse Grip) */}
              <motion.g
                variants={weaponVariants}
                animate={state}
                style={{ originX: "45px", originY: "105px" }}
              >
                <rect x="42" y="96" width="6" height="12" fill="#1e293b" rx="2" />
                <path
                  d="M45 108 L41 146 L45 152 L49 146 Z"
                  fill="url(#rogue_male-accent)"
                  stroke="#22d3ee"
                  strokeWidth="1"
                  filter="url(#rogue_male-glow)"
                />
              </motion.g>
              {/* Right Dagger (Forward Ready Grip) */}
              <motion.g
                variants={weaponVariants}
                animate={state}
                style={{ originX: "110px", originY: "90px" }}
              >
                <rect x="108" y="92" width="6" height="12" fill="#1e293b" rx="2" />
                <path
                  d="M111 92 L107 42 L111 32 L115 42 Z"
                  fill="url(#rogue_male-accent)"
                  stroke="#22d3ee"
                  strokeWidth="1"
                  filter="url(#rogue_male-glow)"
                />
              </motion.g>
            </g>
          )}

          {/* 3. LYRA  -  THE ARCANE WEAVER (COSMIC MAGE FEMALE) */}
          {hero.id === "mage_female" && (
            <g id="lyra-mage">
              {/* Flowing Astral Robe Train */}
              <path
                d="M48 95 C30 130 32 175 42 192 C56 182 66 145 68 100 Z"
                fill="url(#mage_female-primary)"
                opacity="0.85"
              />
              <path
                d="M104 95 C122 130 120 175 110 192 C96 182 86 145 84 100 Z"
                fill="url(#mage_female-primary)"
                opacity="0.85"
              />

              {/* Runic Skirt */}
              <path
                d="M54 125 L98 125 L106 188 L46 188 Z"
                fill="#1e1b4b"
                stroke="#c084fc"
                strokeWidth="1.5"
              />
              {/* Constellation Runes on Robe */}
              <circle cx="76" cy="148" r="3" fill="#e9d5ff" filter="url(#mage_female-glow)" />
              <circle cx="64" cy="165" r="2.5" fill="#e9d5ff" />
              <circle cx="88" cy="165" r="2.5" fill="#e9d5ff" />
              <line x1="64" y1="165" x2="76" y2="148" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="88" y1="165" x2="76" y2="148" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />

              {/* Mystic Bodice & Jeweled Sash */}
              <path
                d="M58 76 L94 76 L98 128 L54 128 Z"
                fill="#312e81"
                stroke="#818cf8"
                strokeWidth="1.5"
              />
              <polygon points="76,82 84,94 76,106 68,94" fill="#c084fc" filter="url(#mage_female-glow)" />
              <rect x="54" y="122" width="44" height="6" fill="#f59e0b" rx="2" />

              {/* Head & Graceful Features */}
              <ellipse cx="76" cy="46" rx="12" ry="15" fill="url(#mage_female-skin)" />
              {/* Gentle Arcane Eyes */}
              <ellipse cx="71" cy="45" rx="2" ry="2.5" fill="#9333ea" />
              <ellipse cx="81" cy="45" rx="2" ry="2.5" fill="#9333ea" />
              {/* Flowing Lavender Hair & Crescent Circlet */}
              <path
                d="M58 48 C54 26 70 18 84 20 C96 22 96 38 94 54 C92 72 90 92 88 102 C84 94 82 80 84 62 C78 50 70 48 58 48 Z"
                fill="#c084fc"
              />
              <path
                d="M54 52 C50 70 54 90 56 102 C58 92 60 78 62 60 Z"
                fill="#a855f7"
              />
              {/* Crescent Circlet */}
              <path d="M68 34 Q76 30 84 34" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
              <circle cx="76" cy="31" r="2.5" fill="#38bdf8" filter="url(#mage_female-glow)" />

              {/* WEAPON: Starfall Runic Staff with Floating Orb */}
              <motion.g
                variants={weaponVariants}
                animate={state}
                style={{ originX: "115px", originY: "100px" }}
              >
                {/* Staff Shaft */}
                <line x1="115" y1="185" x2="115" y2="35" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
                <line x1="115" y1="185" x2="115" y2="35" stroke="#f59e0b" strokeWidth="1" strokeDasharray="8 8" />
                {/* Staff Head Frame */}
                <path d="M106 36 C106 18 124 18 124 36 C124 46 106 46 106 36 Z" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                {/* Detached Floating Arcane Energy Orb */}
                <circle
                  cx="115"
                  cy="32"
                  r="7"
                  fill="url(#mage_female-accent)"
                  filter="url(#mage_female-glow)"
                />
                <circle cx="115" cy="32" r="3" fill="#ffffff" />
              </motion.g>
            </g>
          )}

          {/* 4. ARIA  -  THE MYSTIC HUNTRESS (SYLVAN RANGER FEMALE) */}
          {hero.id === "ranger_female" && (
            <g id="aria-ranger">
              {/* Forest Scout Cloak */}
              <path
                d="M48 85 C32 115 36 170 46 186 C58 172 62 135 64 95 Z"
                fill="url(#ranger_female-primary)"
                opacity="0.9"
              />
              <path
                d="M104 85 C120 115 116 170 106 186 C94 172 90 135 88 95 Z"
                fill="url(#ranger_female-primary)"
                opacity="0.9"
              />

              {/* Lithe Leather Leggings */}
              <path d="M62 132 L58 184 L70 185 L74 132 Z" fill="#292524" />
              <path d="M82 132 L80 185 L92 184 L88 132 Z" fill="#292524" />
              {/* Hunter Sylvan Boots */}
              <path d="M56 178 L72 178 L74 186 L54 186 Z" fill="#15803d" />
              <path d="M78 178 L94 178 L96 186 L76 186 Z" fill="#15803d" />

              {/* Sylvan Combat Tunic & Golden Leaf Clasp */}
              <path
                d="M56 75 L96 75 L100 132 L52 132 Z"
                fill="#166534"
                stroke="#15803d"
                strokeWidth="1.5"
              />
              <polygon points="76,82 82,92 76,102 70,92" fill="#eab308" filter="url(#ranger_female-glow)" />
              {/* Quiver Straps */}
              <line x1="56" y1="78" x2="98" y2="128" stroke="#78350f" strokeWidth="2.5" />
              {/* Arrows in Quiver (peeking over shoulder) */}
              <line x1="52" y1="72" x2="44" y2="52" stroke="#eab308" strokeWidth="2" />
              <line x1="56" y1="70" x2="50" y2="48" stroke="#eab308" strokeWidth="2" />
              <circle cx="44" cy="52" r="3" fill="#10b981" />
              <circle cx="50" cy="48" r="3" fill="#10b981" />

              {/* Head & Keen-Eyed Face */}
              <ellipse cx="76" cy="46" rx="12" ry="15" fill="url(#ranger_female-skin)" />
              {/* Keen Hunter Emerald Eyes */}
              <ellipse cx="71" cy="45" rx="2" ry="2" fill="#047857" />
              <ellipse cx="81" cy="45" rx="2" ry="2" fill="#047857" />
              {/* Chestnut Hair with Sylvan Headband */}
              <path
                d="M60 46 C56 26 72 18 86 20 C96 22 96 38 92 52 C88 38 78 34 66 46 Z"
                fill="#78350f"
              />
              <path d="M62 42 Q76 38 90 42" stroke="#10b981" strokeWidth="2" fill="none" />
              {/* Side Braid resting on chest */}
              <path d="M62 48 C60 62 62 76 64 88" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />

              {/* WEAPON: Verdant Heartwood Bow with Light Arrow */}
              <motion.g
                variants={weaponVariants}
                animate={state}
                style={{ originX: "118px", originY: "90px" }}
              >
                {/* Curved Bow Limb */}
                <path
                  d="M106 20 Q130 85 106 150"
                  stroke="#78350f"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M106 20 Q130 85 106 150"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Bow String */}
                <line x1="106" y1="20" x2="106" y2="150" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" />
                {/* Glowing Solar Arrow */}
                <line
                  x1="85"
                  y1="85"
                  x2="135"
                  y2="85"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#ranger_female-glow)"
                />
                <polygon points="135,85 127,81 127,89" fill="#eab308" />
              </motion.g>
            </g>
          )}
        </svg>

        {/* State Flash / Aura */}
        {state === "HIT" && (
          <motion.div
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-red-500/50 rounded-full blur-md z-30 pointer-events-none"
          />
        )}
        {state === "VICTORY" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full blur-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${colors.glow}, transparent 70%)`,
            }}
          />
        )}
      </motion.div>

      {/* Hero Nameplate */}
      {username && (
        <div className="mt-1 flex flex-col items-center">
          <span className="text-xs font-semibold tracking-wide text-slate-300 font-cinzel">
            {username}
          </span>
          <span className="text-[10px] text-amber-400 font-rajdhani uppercase tracking-wider">
            {hero.title}
          </span>
        </div>
      )}
    </div>
  );
}
