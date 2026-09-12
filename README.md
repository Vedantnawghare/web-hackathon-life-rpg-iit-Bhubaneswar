> **Complete real-life tasks. Defeat your daily boss. Level up your character. Build your streak.**

Life RPG is a full-stack gamified productivity platform that transforms everyday responsibilities into an interactive fantasy RPG experience.

Instead of simply checking tasks off a list, users enter a persistent game world where their daily responsibilities become **quests, battles, progression, rewards, and character development**.

Every completed real-life task damages the day's boss.

**Complete your tasks → defeat the boss → earn XP + Gold → level up.**

---

## 🚀 Quick Access

🎮 **[Play the Live Game](https://life-rpg-pi-silk.vercel.app/)**  
💻 **[View GitHub Repository](https://github.com/Vedantnawghare/web-hackathon-life-rpg-iit-Bhubaneswar)**  
⚙️ **[Open Backend](https://life-rpg-backend-1wuv.onrender.com/)**  
❤️ **[Backend Health Check](https://life-rpg-backend-1wuv.onrender.com/api/v1/health)**

---

## 🎭 Hackathon Presentation Demo Account & Dataset

To evaluate **Life RPG** with realistic, long-term player progression without needing to manually grind for days, a dedicated production demo account is seeded with **8 days of authentic historical quest activity, XP progression, streaks, inventory relics, and unlocked achievements**:

- **Demo User Email**: `demo_hero@liferpg.dev`
- **Demo User Role**: Internal hackathon demonstration account (*credentials provided in submission portal notes*)
- **Character**: `ValenIronheart` — Level 5 Vanguard Hero (`vanguard_male`), Title: *The Unbroken Vanguard*
- **Auth Provider**: Real Supabase Authentication + Real Supabase PostgreSQL database (*no mock/fake frontend data*)

### 🎬 Recommended Demo Flow for Judges & Video Walkthrough

1. **Log In** via `/login` using the demo account.
2. **Hero Dashboard (`/dashboard`)**:
   - Observe today's **3D Boss Battle Arena** with the daily boss at **50 / 100 HP** (2 of 4 daily quests completed today).
   - Click **Strike Task** on an active daily quest (e.g., *"Drink 3 Liters Mineral Water"*) to trigger the real-time 3D combat choreography (projectile flight, camera shake, boss counterattack, sound effects) and watch the boss HP drop in real time!
   - Use the **50 HP Demo** or **Reset (100 HP)** buttons in the arena header to seamlessly reset today's demonstration state for repeat video takes without ever deleting historical data.
3. **Chronicles & Analytics (`/history`)**:
   - **Cumulative XP Progression**: Inspect the multi-day growth curve tracking lifetime experience across 8 consecutive days.
   - **Weekly Adventure Activity**: View the completed task distribution across every day of the week (Monday through Sunday).
   - **Attribute Profile & Domains**: Review the balanced faculty distribution across Intellect, Strength, Discipline, Vitality, and Creativity.
   - **Difficulty Breakdown**: Inspect Easy, Medium, Hard, and Epic contract completion metrics.
4. **Hero Sanctum (`/character`)**:
   - Review the authoritative 8-day quest streak (+16% XP bonus multiplier).
   - View the interactive 5-axis **Astrolabe Radar Matrix** powered by live attributes (STR 36, INT 42, DIS 17, VIT 19, CRE 16).
5. **Relic Vault & Trophies (`/inventory` & `/achievements`)**:
   - Review owned and equipped cosmetics (*Abyssal Dark Theme*, *Bronze Laurel Frame*, *Founder Sigil Badge*, and *Phoenix Crest*).
   - Review 5 unlocked achievement milestones (*First Step*, *Path of Mastery [Lvl 5]*, *Unwavering Will [7-day Streak]*, *Tenacious Slayer [10 Quests]*, *Novice Awakening [1000 XP]*).

> **Developer Seeder**: Developers can re-run or inspect the authoritative multi-day seeder script anytime via:  
> `python backend/app/scripts/seed_demo_user.py`

---

## 🖼️ Project Preview

### 🌍 Game World

<p align="center">
  <img src="docs/images/game-home.png" alt="Life RPG Game World" width="90%">
</p>

### ⚔️ Daily Boss Battle

<p align="center">
  <img src="docs/images/boss-arena.png" alt="Life RPG Daily Boss Battle" width="90%">
</p>

### 🗺️ Fantasy World Map

<p align="center">
  <img src="docs/images/world-map.png" alt="Life RPG Fantasy World Map" width="90%">
</p>

> **Screenshot files:**  
> `docs/images/game-home.png`  
> `docs/images/boss-arena.png`  
> `docs/images/world-map.png`

---

# 🎮 Core Idea

Traditional productivity apps usually look like:

```text
☐ Study
☐ Exercise
☐ Read
☐ Drink Water
````

Life RPG turns the same tasks into a game:

```text
              TODAY'S BOSS
          ┌─────────────────┐
          │    ARCANE WOLF  │
          │     75 / 100 HP │
          └─────────────────┘

✓ Study Data Structures
□ Workout
□ Read
□ Drink Water

        ↓

   Complete a task

        ↓

   Enter combat

        ↓

   Attack the boss

        ↓

   Boss HP decreases

        ↓

      XP + Gold
```

The objective is to make productivity feel **interactive, rewarding, and memorable**.

---

# ✨ Features

## ⚔️ Daily Boss Combat

Each day has one persistent boss with:

```text
100 / 100 HP
```

The boss represents the user's complete daily workload.

Boss HP is determined by daily task completion:

```text
Boss HP = 100 × (1 - completedTasks / totalDailyTasks)
```

For example, with four tasks:

```text
Start       → 100 / 100

Task 1      →  75 / 100

Task 2      →  50 / 100

Task 3      →  25 / 100

Task 4      →   0 / 100

              BOSS DEFEATED
```

This creates a simple relationship:

> **Every completed real-life task damages the boss.**

The enemy remains alive throughout the day and progressively weakens as the user completes more tasks.

---

# 🥊 Cinematic Combat

Completing a task triggers a short combat sequence rather than instantly changing a number.

Combat follows:

```text
Preparation
     ↓
Approach
     ↓
Attack
     ↓
Weapon / Projectile Travel
     ↓
Impact
     ↓
Enemy Reaction
     ↓
Counterattack
     ↓
HP Update
     ↓
Recovery
```

Each exchange is designed to feel like an actual game encounter.

Combat includes:

* Character movement
* Attack animation
* Weapon movement
* Projectile travel
* Hit reactions
* Enemy counterattacks
* HP animations
* Impact particles
* Camera feedback
* Combat sound effects

---

# 🧙 Playable Heroes

Players can choose from four distinct heroes.

## 🛡️ Valen — Vanguard

A heavy melee fighter.

**Combat style:**

* Greatsword
* Heavy charge
* Powerful slash
* High-impact attacks

---

## 🗡️ Kaelen — Shadow Blade

A fast assassin-style fighter.

**Combat style:**

* Dual blades
* Dash attacks
* Rapid combos
* Shadow afterimages

---

## 🔮 Lyra — Arcane Weaver

A ranged magical fighter.

**Combat style:**

* Staff
* Arcane energy
* Magic projectiles
* Long-range attacks

Magic projectiles visibly travel across the arena before hitting the enemy.

---

## 🏹 Aria — Mystic Huntress

A precision ranged fighter.

**Combat style:**

* Bow
* Charged arrows
* Long-range attacks
* Projectile travel

Aria's arrows visibly travel across the arena before impact.

---

# 👹 Progressive Boss Damage

The boss changes visually as its health decreases.

| HP     | Boss State                             |
| ------ | -------------------------------------- |
| 100–76 | Pristine condition                     |
| 75–51  | Minor damage / fractures               |
| 50–26  | Battle scars / smoke / fatigue         |
| 25–1   | Critical condition / desperate posture |
| 0      | Defeated                               |

This creates a visible connection between real-world productivity and in-game progression.

---

# 🗺️ Fantasy World

Life RPG is designed as a complete fantasy game world rather than a conventional productivity dashboard.

Different regions represent different life attributes and gameplay themes.

### 🏔️ Iron Crags

Strength-oriented challenges.

### 🌊 Sanctum of the Jade Falls

Discipline-focused progression.

### 💧 Springs of Vitalis

Health and vitality progression.

### ✨ Celestial Arcanum

Creativity and magical challenges.

### 🏝️ MindPeak Archipelago

Intellect-oriented progression.

### 🏰 Grand Citadel

Central hub and progression point.

The World Map acts as the player's adventure hub.

---

# 🎯 Quest System

Real-life activities are represented as quests.

Examples include:

* Studying
* Coding
* Exercising
* Reading
* Meditation
* Chores
* Hydration
* Sleep
* Creative work
* Personal goals

Each quest can contain:

* Title
* Description
* Category
* Difficulty
* Recurrence
* Deadline / due time
* XP reward
* Gold reward
* Attribute reward

Quest data is persisted server-side.

---

# 📈 XP & Level Progression

XP progression is nonlinear.

The project uses:

```text
XP required for level L
= floor(100 × L^1.6)
```

This allows early progression to feel accessible while requiring increasingly larger achievements at higher levels.

---

# 💪 Character Attributes

Completing quests can increase different character attributes.

| Attribute  | Example Activities                  |
| ---------- | ----------------------------------- |
| Strength   | Fitness, athletics, workouts        |
| Intellect  | Studying, coding, reading           |
| Discipline | Habits, organization, meditation    |
| Vitality   | Health, sleep, nutrition, hydration |
| Creativity | Writing, music, art, design         |

The corresponding attribute reward is calculated by the backend.

---

# 💰 Gold & Rewards

Successful quest completion rewards users with Gold.

Gold can be used for:

* Cosmetics
* Items
* Equipment
* Visual customization

The economy is persisted through the backend.

---

# 🎒 Inventory & Cosmetics

The game includes a persistent inventory system supporting:

* Equipped cosmetics
* Collectible items
* Relics
* Visual themes
* Character customization

Players can equip and unequip supported cosmetic items.

---

# 🏆 Achievements

Players can unlock achievements through progression.

Achievements can be related to:

* Quest completion
* Streaks
* Boss victories
* Level milestones
* Other progression events

---

# 🔥 Streak System

Daily consistency is represented through a streak system.

Maintaining a streak contributes to progression and reward calculations and encourages long-term consistency.

---

# 🎵 Dynamic Game Audio

Life RPG includes a dedicated game audio system.

## Exploration Audio

Calm fantasy background music across normal gameplay.

## Combat Audio

A more intense soundtrack during active battles.

## Combat Sound Effects

Includes:

* Sword swings
* Blade impacts
* Enemy attacks
* Magic attacks
* Arrow release
* Projectile impact
* Heavy attacks
* Victory effects
* Defeat effects

Combat sounds are synchronized with visual attack and impact events.

---

# 🖼️ Image-Based Game Environments

Major game environments use dedicated fantasy artwork rather than relying entirely on CSS-generated backgrounds.

Background assets are centralized through:

```text
frontend/src/lib/game-assets.ts
```

Example:

```text
GAME_ASSETS.backgrounds.worldMap
GAME_ASSETS.backgrounds.arena
```

Assets are stored under:

```text
frontend/public/assets/world/
```

This allows background artwork to be replaced manually without rewriting React components.

For example:

```text
frontend/public/assets/world/world-background.png
frontend/public/assets/world/arena-background.png
```

Replace an image using the same filename and the new artwork will be used automatically.

---

# 🎮 Game HUD

The game uses a dedicated game HUD instead of a conventional productivity dashboard.

Combat UI can display:

* Player HP
* Enemy HP
* Boss name
* Daily task progress
* Quest manifest
* Combat state
* Rewards
* Character state

The objective is to make the application feel like a browser RPG.

---

# 🧪 Hackathon Showcase Mode

The project includes showcase controls for quickly demonstrating the complete boss progression.

Example:

```text
Hero: Valen / Kaelen / Lyra / Aria

⚡ Strike Task

Reset (100 HP)
```

This makes it possible to demonstrate:

```text
100 HP
   ↓
75 HP
   ↓
50 HP
   ↓
25 HP
   ↓
0 HP
   ↓
BOSS DEFEATED
```

without waiting for an entire day of real-world tasks.

---

# 🧑‍💻 Demo Data

The backend includes demo endpoints for testing and hackathon demonstrations.

## Seed Demo Tasks

```http
POST /api/v1/quests/demo-seed
```

Creates a set of sample daily tasks.

## Reset Demo Progress

```http
POST /api/v1/quests/demo-reset
```

Resets the day's completion state so the boss can be demonstrated again.

These endpoints are intended for controlled showcasing and testing.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Next.js App     │
                    │   React + TypeScript  │
                    │       Tailwind       │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │       FastAPI        │
                    │      Python API      │
                    │  Server-Authoritative│
                    └──────────┬───────────┘
                               │
                    ┌──────────┴───────────┐
                    │                      │
                    ▼                      ▼
             ┌──────────────┐       ┌──────────────┐
             │  PostgreSQL  │       │   Supabase   │
             │   Database   │       │ Auth / JWT   │
             └──────────────┘       └──────────────┘
```

---

# 🛠️ Technology Stack

## Frontend

* Next.js 14
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Lucide Icons

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* Alembic
* Pytest
* asyncpg

## Database & Authentication

* Supabase PostgreSQL
* Supabase Authentication
* JWT / JWKS verification

## Deployment

* Vercel — Frontend
* Render — Backend
* Supabase — Database & Authentication
* GitHub — Source Control

---

# 🔐 Security & Server Authority

The application uses a server-authoritative architecture.

The frontend does not decide authoritative:

* XP
* Gold
* Character stats
* Quest ownership
* Completion state
* Inventory ownership
* Achievement ownership

Protected resources are scoped to the authenticated user.

Authentication is handled using Supabase Authentication and JWT verification.

---

# 📁 Project Structure

```text
web-hackathon-life-rpg-iit-Bhubaneswar/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── public/
│   │   └── assets/
│   │       └── world/
│   │
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── ...
│   │
│   ├── package.json
│   └── ...
│
├── docs/
│   └── images/
│       ├── game-home.png
│       ├── boss-arena.png
│       └── world-map.png
│
├── README.md
└── ...
```

---

# 🚀 Local Development

## 1. Clone the Repository

```bash
git clone https://github.com/Vedantnawghare/web-hackathon-life-rpg-iit-Bhubaneswar.git

cd web-hackathon-life-rpg-iit-Bhubaneswar
```

---

# 2. Backend Setup

```bash
cd backend
```

Create a virtual environment.

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

# 3. Backend Environment Variables

Create:

```text
backend/.env
```

Example:

```env
ENVIRONMENT=development

DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:PORT/DATABASE

SUPABASE_URL=https://YOUR_PROJECT.supabase.co

SUPABASE_JWT_SECRET=YOUR_SERVER_ONLY_JWT_SECRET

ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

HOST=0.0.0.0
PORT=8000
```

### ⚠️ Never Commit Secrets

Do not commit:

```text
DATABASE_URL
SUPABASE_JWT_SECRET
Database passwords
Service-role keys
Private credentials
```

---

# 4. Run the Backend

From the `backend` directory:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend:

```text
http://localhost:8000
```

Health endpoint:

```text
http://localhost:8000/api/v1/health
```

---

# 5. Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env.local
```

Example:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_SUPABASE_KEY
```

Run the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Testing

## Backend Tests

```bash
cd backend
pytest
```

The current implementation has **58/58 backend tests passing**.

## Frontend TypeScript Check

```bash
cd frontend
npx tsc --noEmit
```

## Frontend Lint

```bash
npm run lint
```

## Production Build

```bash
npm run build
```

---

# 🌍 Production Deployment

## 🎮 Live Game

👉 **[Open Life RPG](https://life-rpg-pi-silk.vercel.app/)**

## ⚙️ Backend

👉 **[Open Backend](https://life-rpg-backend-1wuv.onrender.com/)**

## ❤️ Backend Health

👉 **[Check Backend Health](https://life-rpg-backend-1wuv.onrender.com/api/v1/health)**

## 💻 GitHub Repository

👉 **[View Source Code](https://github.com/Vedantnawghare/web-hackathon-life-rpg-iit-Bhubaneswar)**

---

# 🔄 User Journey

```text
SIGN UP
   ↓
LOGIN
   ↓
SELECT HERO
   ↓
ENTER THE WORLD
   ↓
EXPLORE MAP
   ↓
VIEW DAILY TASKS
   ↓
DAILY BOSS APPEARS
   ↓
COMPLETE REAL-LIFE TASK
   ↓
CINEMATIC ATTACK
   ↓
BOSS HP DECREASES
   ↓
EARN XP + GOLD
   ↓
COMPLETE MORE TASKS
   ↓
BOSS HP → 0
   ↓
BOSS DEFEATED
   ↓
CHARACTER PROGRESSION
```

---

# 🧠 Game Design Philosophy

Life RPG is built around one simple idea:

> **Make progress in real life feel like progress inside a game.**

The core feedback loop is:

```text
REAL-LIFE ACTION
      ↓
QUEST COMPLETION
      ↓
COMBAT PROGRESS
      ↓
BOSS DAMAGE
      ↓
XP + GOLD
      ↓
CHARACTER PROGRESSION
      ↓
WORLD EXPLORATION
      ↓
LONG-TERM MOTIVATION
```

The game mechanics exist to make everyday progress **visible, rewarding and emotionally engaging**.

---

# 🔮 Future Improvements

Potential future improvements include:

* Full 3D digital-twin fighters
* Expanded enemy roster
* More world regions
* Multiplayer challenges
* Guilds
* PvP
* Seasonal events
* More equipment systems
* More elaborate boss mechanics
* Procedurally generated encounters
* Mobile optimization
* Advanced progression analytics

---

# 🏆 Hackathon Focus

Life RPG demonstrates how a standard productivity workflow can be transformed into an immersive game loop.

### Traditional Productivity

```text
TASK
 ↓
CHECK COMPLETE
```

### Life RPG

```text
QUEST
 ↓
BATTLE
 ↓
BOSS DAMAGE
 ↓
XP + GOLD
 ↓
CHARACTER PROGRESSION
 ↓
WORLD EXPLORATION
```

This creates a direct feedback loop between real-world actions and virtual progression.

---

# 👥 Team

## Team

**SparkX**

> A SparkX Production

Life RPG — Turn Your Real Life Into a Game.

Built for **Tech Zephyr 4.0 — Web Hackathon** at the **Indian Institute of Technology (IIT) Bhubaneswar**.

### Links

* 🎮 [Live Game](https://life-rpg-pi-silk.vercel.app/)
* 💻 [GitHub Repository](https://github.com/Vedantnawghare/web-hackathon-life-rpg-iit-Bhubaneswar)
* ⚙️ [Backend](https://life-rpg-backend-1wuv.onrender.com/)
* ❤️ [Backend Health Check](https://life-rpg-backend-1wuv.onrender.com/api/v1/health)

---

# 📚 Resources & References

This project was built during **Tech Zephyr 4.0 — Web Hackathon** at the **Indian Institute of Technology (IIT) Bhubaneswar**. Below is a comprehensive audit and attribution of the official technologies, libraries, visual assets, fonts, procedural audio, and developmental tools used throughout Life RPG.

### 🌐 Core Technologies & Frameworks

| Technology | Purpose | Official Documentation / Resource |
| :--- | :--- | :--- |
| **Next.js 14** | React Framework (App Router, Server Actions, Dynamic Layouts) | [https://nextjs.org/docs](https://nextjs.org/docs) |
| **React 18** | Core UI Component Library & Hooks | [https://react.dev/](https://react.dev/) |
| **TypeScript 5** | Strict Static Typing & Schema Definitions | [https://www.typescriptlang.org/docs/](https://www.typescriptlang.org/docs/) |
| **Tailwind CSS 3** | Utility-First Responsive Styling & Glassmorphic Themes | [https://tailwindcss.com/docs](https://tailwindcss.com/docs) |
| **Framer Motion 13** | Page Transitions, Combat Sequences, and UI Micro-Animations | [https://www.framer.com/motion/](https://www.framer.com/motion/) |
| **Three.js** | WebGL 3D Digital-Twin Boss & Procedural Entity Rendering | [https://threejs.org/docs/](https://threejs.org/docs/) |
| **Zustand** | Lightweight Client-Side State Management (Auth, Audio, UI) | [https://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/) |
| **TanStack React Query** | Asynchronous Server State Caching & Optimistic Updates | [https://tanstack.com/query/latest](https://tanstack.com/query/latest) |
| **FastAPI** | High-Performance Asynchronous Python Backend Framework | [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/) |
| **Python 3.11+** | Backend Programming Language & Standard Library | [https://docs.python.org/3/](https://docs.python.org/3/) |
| **SQLAlchemy 2.0 (async)** | Object-Relational Mapping & Database Abstraction | [https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/) |
| **Alembic** | Lightweight Database Migration Tool for SQLAlchemy | [https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/) |
| **PostgreSQL** | Relational Database Engine | [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/) |
| **Supabase** | Cloud Database Hosting, Row-Level Security, and Auth Infrastructure | [https://supabase.com/docs](https://supabase.com/docs) |
| **Vercel** | Frontend Edge Deployment & CI/CD Pipeline | [https://vercel.com/docs](https://vercel.com/docs) |
| **Render** | Backend Cloud Application Hosting & Web Service Deployment | [https://render.com/docs](https://render.com/docs) |

---

### 🎨 Visual Assets & Art Attribution

- **Environment & World Backdrops**: 
  - Centralized in `frontend/src/lib/game-assets.ts` and loaded from `frontend/public/assets/world/`.
  - Includes `home-background.png`, `world-background.png`, `arena-background.png`, `quests-background.png`, `inventory-background.png`, `shop-background.png`, `character-background.png`, `achievements-background.png`, `login-background.png`, and `hero-select-background.png`.
  - **Attribution**: *AI-generated during project development specifically for Life RPG's fantasy aesthetic; no external copyrighted third-party artwork used.*
- **Ascension Zone Illustrations**:
  - `zone-mindpeak.png`, `zone-iron-crags.png`, `zone-discipline.png`, `zone-vitalis.png`, and `zone-arcanum.png`.
  - **Attribution**: *AI-generated during project development; no external third-party artwork used.*
- **Enemy & Monster Concept Art**:
  - `void-brute.png`, `void-archon.png`, and `crystal-horror.png`.
  - **Attribution**: *AI-generated during project development; no external third-party artwork used.*
- **Real-Time 3D Digital-Twin Boss**:
  - `Boss3DModel.tsx` is built completely via procedural WebGL code with Three.js (custom crystalline geometry, armored torso segmenting, segmented tentacle limbs, glowing compound eyes, and dynamic eye-laser vector rigging). No external OBJ/GLTF files downloaded.

---

### 🔤 Typography & Iconography

- **Lucide Icons**:
  - Vector iconography across all quest, combat, and HUD interfaces (`lucide-react`).
  - License: [ISC License](https://github.com/lucide-icons/lucide/blob/main/LICENSE) | Documentation: [https://lucide.dev/](https://lucide.dev/)
- **Google Fonts**:
  - **Cinzel**: Used for fantasy headers, titles, and boss heraldry ([SIL Open Font License 1.1](https://fonts.google.com/specimen/Cinzel)).
  - **Rajdhani**: Used for UI labels, quest badges, and stats ([SIL Open Font License 1.1](https://fonts.google.com/specimen/Rajdhani)).
  - **JetBrains Mono**: Used for combat logs, numeric damage values, and code HUDs ([SIL Open Font License 1.1](https://fonts.google.com/specimen/JetBrains+Mono)).

---

### 🔊 Procedural Audio & Sound Synthesis

- **Web Audio API Engine (`frontend/src/lib/audio-manager.ts`)**:
  - *Audio effects and background music are procedurally synthesized in code via Web Audio API; no external audio files are used.*
  - Custom procedural oscillators (sine, square, sawtooth, triangle), multi-stage envelope generators (attack, decay, sustain, release), biquad resonance filters, and procedural noise buffers synthesize:
    - Weapon slashes, claymore impacts, and arcane spellbursts
    - Enemy digital-twin charge sounds and synchronized eye-laser beams
    - Dynamic shield parries, dodges, and critical hit alerts
    - Victory fanfare chords and game over minor descents
    - Procedural ambient dungeon and arena drone loops

---

### 🤖 AI-Assisted Development Disclosure

In the spirit of hackathon transparency and academic integrity:
- **Code & Architecture Assistance**: Generative AI tools were utilized during development for architectural brainstorming, boilerplate generation, Next.js App Router route handlers, FastAPI async repository scaffolding, Three.js vector calculations, and combat timing choreography.
- **Visual Asset Generation**: Generative AI models were employed to generate original fantasy concept backgrounds and zone backdrops adhering to a cohesive palette.
- **Review & Verification**: All AI-assisted code was manually reviewed, verified, type-checked with TypeScript strict mode, tested with Pytest and unit suites, and audited for security.

---

### 🏛️ Hackathon Information

- **Event**: Tech Zephyr 4.0 — Web Hackathon
- **Host Institution**: Indian Institute of Technology (IIT) Bhubaneswar
- **Year**: 2026

---

# 📜 License

This project was developed as a hackathon project.

Add an open-source license if the team decides to publish the project under one.

---

# ⚔️ Life RPG

> **Your life is the quest.**
> **Your habits are your stats.**
> **Your tasks are your battles.**
> **And every completed day is a boss defeated.**

```

