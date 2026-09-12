/**
 * Life RPG Central Game Assets Configuration
 * All game visual environments, backgrounds, and assets are defined here.
 * To replace backgrounds, simply overwrite the PNG files in public/assets/world/
 * or update the asset paths in this configuration.
 */

export const GAME_ASSETS = {
  backgrounds: {
    worldMap: '/assets/world/world-background.png',
    arena: '/assets/world/arena-background.png',
  },
} as const;

export type GameAssetsConfig = typeof GAME_ASSETS;
