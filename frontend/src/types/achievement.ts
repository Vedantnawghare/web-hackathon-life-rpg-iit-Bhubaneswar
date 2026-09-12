export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  icon_name: string;
  condition_type: string;
  condition_threshold: number;
  reward_xp: number;
  reward_gold: number;
  reward_title: string | null;
  is_unlocked: boolean;
  unlocked_at: string | null;
}
