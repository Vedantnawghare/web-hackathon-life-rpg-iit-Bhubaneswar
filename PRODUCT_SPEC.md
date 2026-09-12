# LIFE RPG — PRODUCT SPECIFICATION

## Product Vision

Life RPG transforms real-world productivity into a game-like progression system.

Users create real-life quests, complete them, earn XP and Gold, improve character attributes, maintain streaks, unlock rewards, and develop their character over time.

The application must feel like a premium RPG rather than a generic productivity dashboard.

---

## Core Gameplay Loop

Create Quest
→ Complete Quest
→ Earn XP + Gold
→ Increase Attributes
→ Maintain Streak
→ Level Up
→ Unlock / Buy Rewards
→ Continue Progression

---

## Core Required Features

1. User Authentication
2. Secure user-specific data
3. Quest CRUD
4. Quest completion
5. Server-side XP calculation
6. Non-linear level progression
7. Character attributes
8. Streak tracking
9. Gold economy
10. Virtual shop
11. Inventory
12. Achievements
13. Completion history
14. Responsive UI
15. Keyboard accessibility
16. Screen-reader-friendly structure
17. Persistent database storage
18. Production deployment

---

## Product Vocabulary

Task → Quest
Points → XP
Coins → Gold
Profile → Character
Stats → Attributes
Task completion → Quest Cleared
Shop → Guild Shop

---

## Character Attributes

Strength
Intellect
Discipline
Vitality
Creativity

Quest categories map to one primary attribute.

Examples:

Gym → Strength
Running → Vitality
Studying → Intellect
Coding → Intellect
Meditation → Discipline
Journaling → Discipline
Drawing → Creativity

---

## Quest Difficulty

Easy
Medium
Hard
Epic

The backend determines authoritative rewards.

The frontend must never be trusted to determine XP or Gold.

---

## Progression

Level progression must be non-linear.

Higher levels require increasingly more XP.

The exact formula will be implemented in the backend RPG progression engine.

---

## Economy

Users earn Gold through quest completion and other legitimate rewards.

Gold can be spent in the Guild Shop on virtual cosmetic items such as:

- Themes
- Avatar Frames
- Badges
- Titles
- Other cosmetic rewards

Purchases must be persisted in the database.

---

## Streaks

A streak represents consecutive days with qualifying activity.

The system tracks:

- Current streak
- Longest streak
- Daily activity
- Streak milestones

---

## Achievements

Examples:

- First Quest
- Level 5
- Level 10
- 7 Day Streak
- 30 Day Streak
- 100 Quests
- XP milestones

---

## Optional Differentiators

These should only be implemented after all required functionality is stable:

- Daily / Weekly Boss
- AI Quest Architect
- Advanced character customization
- Special seasonal cosmetics
- Enhanced particle effects
- Additional progression systems

Never sacrifice core functionality for optional features.

---

## Main Screens

Landing
Login
Signup
Onboarding
Dashboard
Quests
Character
Guild Shop
Inventory
Achievements
History
Settings

---

## Dashboard

The dashboard should prominently show:

- Character / avatar
- Current level
- XP progress
- Gold
- Streak
- Character attributes
- Today's quests
- Quest completion actions
- Important progression feedback

---

## UX Principles

The interface should feel:

- Premium
- Game-like
- Fast
- Responsive
- Tactile
- Cohesive
- Visually memorable

Use:

- Micro-interactions
- Spring animations
- XP animations
- Level-up sequences
- Optimistic UI where safe
- Loading skeletons
- Smooth transitions
- Meaningful empty states
- Meaningful error states

Avoid:

- Generic SaaS layouts
- Default component-library appearance
- Excessive animation
- Visual clutter
- Unnecessary gradients
- Poor contrast
- Tiny text

---

## Security Principles

Authoritative game calculations happen on the backend.

Never trust the frontend for:

- XP
- Gold
- Attribute changes
- Level
- Inventory ownership
- Quest ownership
- Reward claims

Every protected operation must verify authenticated user identity and authorization.

Users must never be able to access or modify another user's data.

---

## Data Persistence

Primary application state must be stored in PostgreSQL.

Do not use localStorage as the primary data store.

LocalStorage may only be used for non-critical client preferences where appropriate.

---

## Architecture

Frontend:

Next.js
React
TypeScript
Tailwind CSS
Framer Motion
shadcn/ui

Backend:

Python
FastAPI
Pydantic
SQLAlchemy
Alembic
pytest

Database:

PostgreSQL

Authentication:

Supabase Auth

Infrastructure:

Vercel for frontend
Render or Railway for backend
Supabase for PostgreSQL/Auth

---

## Engineering Principles

Prefer clean modular architecture.

Do not create giant files.

Use typed APIs.

Validate inputs.

Handle errors gracefully.

Write tests for important backend/domain logic.

Document external resources and licenses.

Keep the application deployable throughout development.

Do not generate fake hardcoded user data.
