/**
 * Life RPG Central Game Assets Configuration
 * All game visual environments, backgrounds, and enemy creatures are defined here.
 * To replace any background, creature or 3D model manually, drop a file with the same filename
 * into public/assets/world/, public/assets/enemies/, or public/assets/models/enemies/.
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
  models: {
    enemyBoss: '/assets/models/enemies/arcane-boss.glb',
    heroes: {
      vanguard: '/assets/models/heroes/valen-vanguard.glb',
      rogue: '/assets/models/heroes/kaelen-rogue.glb',
      mage: '/assets/models/heroes/lyra-mage.glb',
      ranger: '/assets/models/heroes/aria-ranger.glb',
    },
  },
} as const;

export type GameAssetsConfig = typeof GAME_ASSETS;
