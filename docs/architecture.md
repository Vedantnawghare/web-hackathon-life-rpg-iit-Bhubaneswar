# Life RPG — System Architecture Specification

## 1. System Overview

Life RPG is an authoritative full-stack gamified productivity application. It converts real-world habits and productivity tasks into an interactive RPG progression model.

```
+-------------------------------------------------------------------------+
|                       Next.js (App Router) Frontend                     |
|  - TypeScript, Tailwind CSS, Framer Motion, shadcn/ui                   |
|  - TanStack Query v5: Exclusively manages remote server state           |
|  - Zustand: Exclusively manages ephemeral client-local UI state         |
|  - Arcane Fantasy theme, keyboard accessible, WCAG AA compliant         |
+------------------------------------+------------------------------------+
                                     |
                          HTTPS / REST (Bearer JWT)
                                     v
+-------------------------------------------------------------------------+
|                       FastAPI Python Backend                            |
|  - Strict Pydantic v2 validation & input sanitization                   |
|  - SQLAlchemy 2.0 async engine with asyncpg                             |
|  - Cryptographic Supabase JWT verification (`sub` claim)                |
|  - Authoritative game logic: multi-level rollover, streaks, economy     |
|  - Pessimistic locking (SELECT FOR UPDATE) for transactional operations |
+-------------------+--------------------------------+--------------------+
                    |                                |
       Direct Auth Verification               ACID Transactions
                    v                                v
+------------------------------------+ +----------------------------------+
|           Supabase Auth            | |       PostgreSQL Database        |
|  - OAuth & Email/Password sessions | |  - Characters (1:1 with user)    |
|  - Client-side token issuance      | |  - Quests (Lifecycle ACTIVE/ARCH)|
|  - RS256/HS256 JWT signatures      | |  - QuestCompletions (Audit log)  |
|                                    | |  - Streaks, Shop, Inventory      |
+------------------------------------+ +----------------------------------+
```

---

## 2. Tier Responsibilities & Boundaries

### A. Frontend (Presentation & Interaction)
- **Framework**: Next.js 14+ (App Router).
- **Styling**: Tailwind CSS with custom RPG color palette and utility tokens.
- **Micro-Interactions**: Framer Motion for tactile button presses, floating XP badges, and celebratory level-up sequences.
- **Server State**: Managed exclusively with **TanStack Query v5**. Server data (character attributes, inventory, quest list) is **never** duplicated in localStorage or Zustand.
- **Client UI State**: Managed with **Zustand** only for non-server state:
  - Audio mute & volume controls.
  - Active modal open/close states.
  - Screen animation trigger flags.
- **Security**: Titles, descriptions, and user inputs are strictly rendered as plain text (React JSX auto-escaped). `dangerouslySetInnerHTML` is strictly prohibited.

### B. Backend (Authoritative Game Engine & Gateway)
- **Framework**: FastAPI (Python 3.11+).
- **Data Validation**: Pydantic v2 schemas enforcing strict length and type constraints.
- **Authentication**: Validates Supabase JWT signature, extracts `sub` claim as authoritative `user_id`.
- **Tenancy Scoping**: Never trusts client-provided `user_id` or `character_id`. Resolves character from the verified JWT and scopes all database operations to `character_id == current_character.id`.
- **Concurrency & Anti-Duplication**: Pessimistic database row locks (`SELECT ... FOR UPDATE`) and unique idempotency keys in `quest_completions` prevent double-reward exploits and racing requests.

### C. Database (Relational Data Persistence)
- **Engine**: PostgreSQL 16+.
- **ORM**: SQLAlchemy 2.0 with asynchronous driver (`asyncpg`).
- **Migrations**: Alembic managing deterministic versioned schema migrations.
- **Relational Integrity**:
  - `characters.user_id` is `UNIQUE` (1:1 with Supabase Auth user UUID).
  - `inventory_items`: `UNIQUE(character_id, shop_item_id)` prevents duplicate cosmetics.
  - `quest_completions`: `UNIQUE(idempotency_key)` guarantees that a quest cannot be completed multiple times in the same period.

---

## 3. Recurring Quest Architecture

Unlike naive task applications that mark a task `status = COMPLETED` permanently:
1. **Lifecycle State (`quests.status`)**:
   - `ACTIVE`: Available on the player's quest board.
   - `ARCHIVED`: Soft-deleted or retired by the player.
2. **Completion Audit Log (`quest_completions`)**:
   - Every completed quest inserts a row into `quest_completions`.
   - Contains `quest_id`, `character_id`, `completion_date`, `earned_xp`, `earned_gold`, `attribute_gain`, and `idempotency_key`.
3. **Period Evaluation**:
   - **One-off quest** (`recurrence == NONE`): Idempotency key `oneoff_{quest_id}`.
   - **Daily quest** (`recurrence == DAILY`): Idempotency key `daily_{quest_id}_{character_id}_{user_local_date}`. The quest remains `ACTIVE` on the board, but is projected as `is_completed_for_period = true` until the next calendar day.
   - **Weekly quest** (`recurrence == WEEKLY`): Idempotency key `weekly_{quest_id}_{character_id}_{iso_year}_W{iso_week}`.
