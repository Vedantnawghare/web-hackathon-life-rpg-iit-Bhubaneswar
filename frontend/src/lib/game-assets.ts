/**
 * Life RPG Central Game Assets Configuration
 * All game visual environments, backgrounds, and enemy creatures are defined here.
 * To replace any background or creature manually, drop a file with the same filename
 * into public/assets/world/ or public/assets/enemies/.
 */

export const GAME_ASSETS = {
  backgrounds: {
    worldMap: '/assets/world/world-background.png',
    arena: '/assets/world/arena-background.png',
    quests: '/assets/world/quests-background.png',
    inventory: '/assets/world/inventory-background.png',
    shop: '/assets/world/shop-background.png',
    character: '/assets/world/character-background.png',
    achievements: '/assets/world/achievements-background.png',
    login: '/assets/world/login-background.png',
    heroSelect: '/assets/world/hero-select-background.png',
  },
  enemies: {
    voidBrute: '/assets/enemies/void-brute.png',
    voidArchon: '/assets/enemies/void-archon.png',
    crystalHorror: '/assets/enemies/crystal-horror.png',
  },
} as const;

export type GameAssetsConfig = typeof GAME_ASSETS;
