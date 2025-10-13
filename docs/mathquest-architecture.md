# mathquest: Architecture Design and Project Structure

## 1. Purpose

MathQuest is a learning service that provides arithmetic practice experiences for elementary school students. It uses Hono for SSR on Cloudflare Workers and offers grade-level presets and themed exercises (e.g., "Addition up to 20," "Addition/Subtraction Mix"). Question generation and grading are centralized in a shared domain logic, structured for consistent reuse from the UI to the API.

## 2. Architecture Overview

### Execution Environment

- **Edge Runtime:** Cloudflare Workers (Wrangler development mode / production environment)
- **Framework:** Hono + JSX (SSR + Islands)
- **Data Store:** Cloudflare D1 (planned), KV (sessions, rate limiting, free trials)
- **Build:** pnpm workspaces + Vite/Vitest (application)

### Layered Structure

- **Domain Layer (`packages/domain`)**
  - Question generation algorithms, multi-step calculations (e.g., addition then subtraction), answer checking, and display formatting.
- **Application Layer (`packages/app`, `apps/edge/src/application`)**
  - Manages quiz progression (number of questions, correct answers), use cases (`generateQuizQuestion`, `verifyAnswer`), and session handling.
- **Infrastructure Layer (`apps/edge/src/infrastructure`)**
  - D1 connection via Drizzle ORM, KV bindings, and environment variable management.
- **Interface Layer (`apps/edge/src/routes`)**
  - Pages (start, play, home), BFF API (`/apis/quiz/generate`, `/apis/quiz/verify`), and client-side interaction logic.

Dependencies between layers are organized with inward-pointing arrows centered on the domain layer. This allows the domain logic to be reused as-is for UI modifications or the addition of new delivery channels (e.g., a dedicated API UI).

## 3. Module Configuration

```mermaid
graph LR
    subgraph "Apps"
        Edge[@mathquest/edge]
        API[@mathquest/api]
        Web[@mathquest/web]
    end

    subgraph "Packages"
        Domain[@mathquest/domain]
        App[@mathquest/app]
    end

    Edge --> App
    Edge --> Domain
    API --> App
    API --> Domain
    App --> Domain
```

- `@mathquest/edge`: The production Cloudflare Workers app. It embeds presets as JSON on the start screen, and a client script configures the dynamic UI (theme selection, progress saving, sound effect/show-working toggles).
- `@mathquest/api` / `@mathquest/web`: Node + Hono servers for local validation without Workers. Useful for checking domain/API logic or for Storybook-like purposes.
- `@mathquest/app`: Handles the calculation of quiz progress objects (current question number, correct count, etc.), allowing the UI to manage state transitions without side effects.
- `@mathquest/domain`: The rules for generating calculation problems. When a grade-level theme is specified, it calls composite logic like `generateGradeOneQuestion`.

## 4. Directory Structure

The actual repository structure is as follows:

```txt
mathquest/
├── apps/
│   ├── edge/                    # Cloudflare Workers SSR App
│   │   ├── src/
│   │   │   ├── application/     # Use cases, session management
│   │   │   ├── infrastructure/  # Drizzle, environment variables
│   │   │   ├── middlewares/     # i18n, etc.
│   │   │   └── routes/
│   │   │       ├── pages/       # home/start/play, client scripts
│   │   │       └── apis/        # /apis/quiz
│   │   └── wrangler.toml        # Workers configuration
│   ├── api/                     # Local development API server
│   └── web/                     # Local development Web server
├── packages/
│   ├── app/                     # Quiz progression use cases
│   └── domain/                  # Question generation & grading logic
├── infra/
│   ├── terraform/               # Terraform configuration
│   └── migrations/              # D1 schema
├── docs/                        # Documents
└── games/math-quiz/             # Old standalone game
```

## 5. Use Cases and Data Flow

### Start Screen

1.  The `/start` page is rendered via SSR. The server embeds the grade list, calculation types, and theme presets as JSON into a `<script type="application/json">` tag.
2.  The client script (`start.client.ts`) initializes and restores the following state from local storage:
    - `mathquest:progress:v1`: Total answers, correct answers, last selected grade/theme.
    - `mathquest:sound-enabled` / `mathquest:show-working`: UI toggles.
    - `mathquest:question-count-default`: Default number of questions.
3.  When a grade is selected, it filters calculation types from `gradeCalculationTypes` and narrows down theme buttons by the minimum target grade.
4.  Pressing "Start Practice" saves the selected settings to session storage and navigates to `/play`.

### Play Screen

1.  On screen load, settings are restored from `mathquest:pending-session` to update display labels.
2.  After a 3-second countdown via `countdown-overlay`, it fetches a question by POSTing to `/apis/quiz/generate`.
3.  The user's answer is sent to `/apis/quiz/verify`, which displays the correctness and the right answer. If correct, the streak is incremented, and progress in local storage is updated.
4.  When the remaining questions reach zero, a result card is displayed, providing a path back to the start screen.

### API Layer

- `POST /apis/quiz/generate`
  - Input: `mode`, `max`, `gradeId`, `themeId`, etc. (selections from the start screen)
  - Output: Question data (including the formula and intermediate steps `extras`)
- `POST /apis/quiz/verify`
  - Input: Question object + answer value
  - Output: Correctness judgment and the correct value

The API utilizes the logic from `@mathquest/domain` via `apps/edge/src/application/usecases/quiz.ts`. This ensures that the same specification for questions is generated on both the UI and API sides, and tests can be written at the use-case level.

## 6. Technology Stack

- **UI:** Hono JSX, Tailwind-style utility classes (with custom CSS variables)
- **Client-side:** TypeScript, Islands architecture for script embedding
- **Logic:** Use-case testing with Vitest, pure functions for domain logic
- **Infrastructure:** Cloudflare Workers, KV, D1, Terraform
- **Tooling:** pnpm, mise, just, biome, cspell

## 7. Design Considerations

- **Reusability:** Domain logic and use cases are pure TypeScript, running on both Node and Workers, shared between the API and SSR.
- **Accessibility:** The keypad supports keyboard operations and communicates state with ARIA attributes. Theme selection uses `aria-pressed`.
- **Local Storage Strategy:** Progress and settings are saved to improve the UX on return visits. A version key is included to prepare for future migrations.
- **Future Expansion:** Plans include user management with Better Auth integration, full-fledged learning history persistence to D1, and AI coaching features.
