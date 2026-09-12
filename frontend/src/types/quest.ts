import { Character } from "./character";

export type QuestDifficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";
export type CharacterAttribute = "STRENGTH" | "INTELLECT" | "DISCIPLINE" | "VITALITY" | "CREATIVITY";
export type QuestStatus = "ACTIVE" | "ARCHIVED";
export type QuestRecurrence = "NONE" | "DAILY" | "WEEKLY";

export interface Quest {
  id: string;
  character_id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: QuestDifficulty;
  primary_attribute: CharacterAttribute;
  base_xp: number;
  base_gold: number;
  status: QuestStatus;
  recurrence: QuestRecurrence;
  due_date: string | null;
  due_time?: string | null;
  created_at: string;
  updated_at: string;

  // Dynamic period evaluation
  is_completed_for_period: boolean;
  last_completed_at: string | null;
}

export interface QuestCreatePayload {
  title: string;
  description?: string;
  category: string;
  difficulty: QuestDifficulty;
  recurrence?: QuestRecurrence;
  due_date?: string | null;
  due_time?: string | null;
}

export interface QuestUpdatePayload {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: QuestDifficulty;
  recurrence?: QuestRecurrence;
  due_date?: string | null;
  due_time?: string | null;
  status?: QuestStatus;
}

export interface QuestCompleteResponse {
  quest_id: string;
  quest_title: string;
  earned_xp: number;
  earned_gold: number;
  xp_multiplier: number;
  attribute_increased: CharacterAttribute;
  attribute_gain: number;
  old_level: number;
  new_level: number;
  has_leveled_up: boolean;
  levels_gained: number;
  current_streak: number;
  streak_extended: boolean;
  unlocked_achievements?: import("./achievement").Achievement[];
  character: Character;
}

export interface QuestHistoryItem {
  id: string;
  quest_id: string;
  quest_title: string;
  category: string;
  difficulty: QuestDifficulty;
  primary_attribute: CharacterAttribute;
  earned_xp: number;
  earned_gold: number;
  attribute_gain: number;
  completion_date: string;
  completed_at: string;
}

export interface QuestHistoryResponse {
  items: QuestHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}
