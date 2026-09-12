# Life RPG — Security & Authorization Architecture

## 1. Zero Client Trust Model

All core game calculations, economic transactions, inventory possessions, and attribute increases are strictly executed on the backend.

The frontend is treated as an untrusted presentation layer:
- Client cannot submit XP or Gold amounts.
- Client cannot dictate level-ups or stat point allocations.
- Client cannot claim items without a validated backend transaction.
- Client cannot provide `user_id` or `character_id` for authorization.

---

## 2. Authentication & JWT Verification

```
[Browser / Mobile] ---> Header: "Authorization: Bearer <Supabase JWT>"
                              |
                              v
                   [FastAPI Security Layer]
                              |
                   1. Cryptographic Signature Validation
                      (Using SUPABASE_JWT_SECRET)
                   2. Expiration Check (`exp`)
                   3. Extract Subject (`sub` claim = Supabase Auth UID)
                              |
                              v
                   4. Query `characters WHERE user_id = sub`
                              |
                              v
                   5. Inject `current_character` into route context
```

### Server-Side Rules:
- If no token or an invalid/expired token is provided, the API immediately halts with `401 Unauthorized`.
- The extracted `sub` is guaranteed authentic by the Supabase cryptographic signature.
- Routes never query using an ID passed in request bodies or path parameters if that ID claims to identify the actor.

---

## 3. Strict Multi-Tenant Isolation

Every database query touching player-owned entities is scoped to `character_id == current_character.id`:
- Quests: `SELECT * FROM quests WHERE id = :id AND character_id = :current_character_id`
- Inventory: `SELECT * FROM inventory_items WHERE character_id = :current_character_id`
- Streaks: `SELECT * FROM streaks WHERE character_id = :current_character_id`

### Enumeration Protection
If a user requests a quest by UUID that does not belong to them, the server returns `404 Not Found` (rather than `403 Forbidden`) to prevent attackers from discovering valid foreign IDs.

---

## 4. Input Sanitization & XSS Prevention

- **Plain Text Enforcement**: Quest titles and descriptions are validated plain text only.
  - Title: 1 to 120 characters, leading/trailing whitespace stripped, no control/null characters.
  - Description: Up to 1000 characters, no control/null characters.
- **Safe Frontend Rendering**: The frontend uses standard React JSX `{quest.title}` and `{quest.description}` which automatically escapes all HTML entities into safe strings.
- **Forbidden Patterns**: `dangerouslySetInnerHTML`, `eval()`, and unvalidated markdown parsing are strictly banned.

---

## 5. Concurrency & Transactional Safety

- **Race Condition Prevention**:
  - Quest completions acquire a pessimistic write lock (`SELECT ... FOR UPDATE`) on the character and quest row.
  - A unique constraint on `quest_completions.idempotency_key` guarantees that concurrent or repeated completion requests fail deterministically.
- **Economic Overdraft Prevention**:
  - Guild shop purchases lock the character record with `SELECT ... FOR UPDATE`.
  - The transaction asserts `character.gold >= item.cost_gold` before inserting into `inventory_items` and debiting gold. Overdrafts or duplicate purchases cannot succeed.

---

## 6. Standardized Error Handling (RFC 7807)

All domain exceptions return standardized problem details payloads:
```json
{
  "type": "https://liferpg.app/errors/conflict",
  "title": "Conflict",
  "status": 409,
  "detail": "This quest has already been cleared for the current period.",
  "code": "QUEST_ALREADY_COMPLETED"
}
```
Sensitive database error traces are suppressed in production.
