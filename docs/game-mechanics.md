# Life RPG — Game Mechanics & Progression Specification

## 1. Character Attributes

Characters possess 5 core attributes representing holistic real-world self-improvement:

| Attribute | Focus Area | Real-World Activities |
| :--- | :--- | :--- |
| **Strength** | Physical power & fitness | Weightlifting, calisthenics, manual labor, sports |
| **Intellect** | Cognitive & analytical skill | Coding, reading books, studying, deep work, math |
| **Discipline** | Habit consistency & willpower | Meditation, early rising, journaling, cleaning chores |
| **Vitality** | Endurance, health & recovery | Running, cycling, hydration, sleep hygiene, nutrition |
| **Creativity** | Expression & design | Drawing, writing, playing music, UI/UX, brainstorming |

Every quest deterministically maps its category to one primary attribute.

---

## 2. Authoritative Progression Model

The backend stores and maintains 4 distinct progression variables on each character:

1. **`lifetime_xp`**: Total cumulative XP earned across the entire lifetime of the character (strictly monotonic).
2. **`current_level`**: The player's active level (starts at 1).
3. **`xp_into_current_level`**: XP accumulated towards the next level from the start of `current_level`.
4. **`xp_required_for_next_level`**: The total XP required to transition from `current_level` to `current_level + 1`.

### Non-Linear Level Formula
Progression follows an exponential curve where each level demands significantly more effort:

$$\text{xp\_required\_for\_next\_level}(L) = \lfloor 100 \times L^{1.6} \rfloor$$

| Level $L$ | XP Required ($L \rightarrow L+1$) | Cumulative Lifetime XP |
| :--- | :--- | :--- |
| **1** | 100 XP | 0 XP |
| **2** | 303 XP | 100 XP |
| **3** | 580 XP | 403 XP |
| **4** | 918 XP | 983 XP |
| **5** | 1,310 XP | 1,901 XP |
| **10** | 3,981 XP | 12,897 XP |
| **20** | 12,052 XP | 88,435 XP |

### Authoritative Multi-Level Rollover Algorithm
When a character earns $\Delta XP$:
```python
lifetime_xp += delta_xp
xp_into_current_level += delta_xp

while xp_into_current_level >= xp_required_for_next_level:
    xp_into_current_level -= xp_required_for_next_level
    current_level += 1
    xp_required_for_next_level = math.floor(100 * (current_level ** 1.6))
    level_ups.append(current_level)
```

---

## 3. Quest Difficulty & Reward Matrix

Rewards are purely calculated on the backend from quest difficulty:

| Difficulty | Base XP | Base Gold | Primary Attribute Gain |
| :--- | :--- | :--- | :--- |
| **Easy** | 25 XP | 10 Gold | +1 |
| **Medium** | 50 XP | 25 Gold | +2 |
| **Hard** | 100 XP | 60 Gold | +4 |
| **Epic** | 250 XP | 150 Gold | +8 |

---

## 4. Streak System & Multiplier

A streak is defined as consecutive calendar days with at least one qualifying quest completed within the user's local timezone.

### Streak XP Multiplier
Daily consistency is rewarded with bonus XP on every completed quest:

$$\text{Multiplier} = 1.0 + \min(0.30, \, \text{current\_streak} \times 0.02)$$

- **Day 1**: $1.0\times$ (0% bonus)
- **Day 5**: $1.10\times$ (+10% bonus)
- **Day 10**: $1.20\times$ (+20% bonus)
- **Day 15+**: $1.30\times$ (+30% bonus cap)

---

## 5. Virtual Economy & Guild Shop

- Players spend earned **Gold** in the **Guild Shop** on non-consumable cosmetic items.
- Item categories include:
  - **Themes**: UI color schemes (e.g., Abyssal Dark, Sunfire Gold, Cyber Emerald).
  - **Avatar Frames**: Decorative borders surrounding the character avatar.
  - **Badges**: Profile display insignia showcasing accomplishments.
  - **Titles**: Character prefixes (e.g., "Novice Adventurer", "Arcane Scholar").
- Ownership is permanent; duplicate purchases are prevented by the database constraint `UNIQUE(character_id, shop_item_id)`.
