export interface Character {
  id: string;
  user_id: string;
  username: string;
  title: string;

  // Authoritative progression fields
  current_level: number;
  lifetime_xp: number;
  xp_into_current_level: number;
  xp_required_for_next_level: number;
  gold: number;
  current_streak?: number;

  // 5 Core Attributes
  strength: number;
  intellect: number;
  discipline: number;
  vitality: number;
  creativity: number;

  // Visual Cosmetics
  equipped_theme: string;
  equipped_frame: string;
  equipped_badge: string;

  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CharacterCreatePayload {
  username: string;
  title?: string;
  timezone?: string;
}

export interface CharacterEquipPayload {
  equipped_theme?: string;
  equipped_frame?: string;
  equipped_badge?: string;
  title?: string;
}
