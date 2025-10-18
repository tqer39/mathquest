# EduQuest Migration Plan

## Overview

This document outlines the detailed migration plan from **MathQuest** (math-focused) to **EduQuest** (multi-subject educational platform).

**Status:** Planning Phase
**Target Completion:** TBD
**Current Domain:** mathquest.app
**Target Domain:** edu-quest.app

---

## Table of Contents

1. [Vision & Goals](#vision--goals)
2. [Architecture Overview](#architecture-overview)
3. [Migration Phases](#migration-phases)
4. [Technical Implementation](#technical-implementation)
5. [Database Schema Evolution](#database-schema-evolution)
6. [Deployment Strategy](#deployment-strategy)
7. [Rollback Plan](#rollback-plan)
8. [Success Metrics](#success-metrics)

---

## Vision & Goals

### Current State

- **MathQuest:** Elementary school math practice app
- Single domain: `mathquest.app`
- Math-only content (addition, subtraction, multiplication, division)
- ~1,000 daily active users (example metric)

### Target State

- **EduQuest:** Comprehensive learning platform
- Multi-domain architecture with subdomains per subject
- Support for multiple subjects: Math, Kanji, Kana (and future subjects)
- Unified user experience with shared authentication

### Success Criteria

- Zero downtime during migration
- No user data loss
- Maintain or improve current performance metrics
- Seamless user experience across subjects

---

## Architecture Overview

### Current Architecture

```text
mathquest.app
└── Cloudflare Workers (Hono SSR)
    ├── /start
    ├── /play
    └── /apis/quiz
```

### Target Architecture

```text
edu-quest.app (Portal - Cloudflare Pages)
├── / (Landing page with subject selection)
├── /about
└── /account

math.edu-quest.app (Math App - Cloudflare Workers)
├── /start
├── /play
└── /apis/quiz

kanji.edu-quest.app (Kanji App - Cloudflare Workers)
├── /start
├── /play
└── /apis/quiz

kana.edu-quest.app (Kana App - Cloudflare Workers)
├── /start
├── /play
└── /apis/quiz
```

### Technology Stack (Future)

```text
Portal (edu-quest.app):
  - Next.js on Cloudflare Pages
  - Static generation for landing pages
  - Shared authentication service

Subject Apps (*.edu-quest.app):
  - Hono on Cloudflare Workers (current stack)
  - D1 Database (per subject or shared)
  - KV for sessions, rate limiting
```

---

## Migration Phases

### Phase 1: Foundation (Week 1-2)

**Objective:** Acquire domain and set up infrastructure

**Tasks:**

- [ ] Acquire `edu-quest.app` domain
- [ ] Add domain to Cloudflare account
- [ ] Configure DNS records:

  ```text
  edu-quest.app           → Cloudflare Pages
  *.edu-quest.app         → Wildcard SSL
  math.edu-quest.app      → Cloudflare Workers
  www.edu-quest.app       → Redirect to edu-quest.app
  ```

- [ ] Set up Terraform for DNS management
- [ ] Test subdomain routing

**Deliverables:**

- Working DNS configuration
- SSL certificates for all subdomains
- Terraform scripts in `infra/terraform/dns.tf`

**Validation:**

- [ ] `edu-quest.app` resolves correctly
- [ ] `math.edu-quest.app` resolves correctly
- [ ] SSL certificates are valid

---

### Phase 2: MathQuest Migration (Week 3-4)

**Objective:** Move current MathQuest to math.edu-quest.app

**Tasks:**

- [ ] Create `wrangler.toml` for `math.edu-quest.app`
- [ ] Update environment variables and secrets
- [ ] Deploy current app to `math.edu-quest.app`
- [ ] Test all functionality on new subdomain
- [ ] Set up 301 redirect from `mathquest.app` → `math.edu-quest.app`
- [ ] Update analytics and monitoring

**Code Changes:**

```typescript
// infra/terraform/redirects.tf
resource "cloudflare_worker_route" "mathquest_redirect" {
  zone_id     = var.cloudflare_zone_id_mathquest
  pattern     = "mathquest.app/*"
  script_name = "mathquest-redirect"
}

// apps/mathquest-redirect/src/index.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const newUrl = `https://math.edu-quest.app${url.pathname}${url.search}`;
    return Response.redirect(newUrl, 301);
  }
};
```

**Deliverables:**

- Fully functional `math.edu-quest.app`
- Working redirect from `mathquest.app`
- Updated monitoring dashboards

**Validation:**

- [ ] All pages load correctly on `math.edu-quest.app`
- [ ] Authentication works
- [ ] Quiz functionality works
- [ ] Database reads/writes succeed
- [ ] `mathquest.app` redirects properly

---

### Phase 3: Portal Development (Week 5-8)

**Objective:** Create EduQuest portal at edu-quest.app

**Tasks:**

- [ ] Create new app: `apps/portal/`
- [ ] Set up Next.js with Cloudflare Pages
- [ ] Design and implement landing page
- [ ] Subject selection UI (cards for Math, Kanji, Kana)
- [ ] Shared authentication system
- [ ] User account management
- [ ] Deploy to `edu-quest.app`

**Directory Structure:**

```text
apps/portal/
├── app/
│   ├── page.tsx              # Landing page
│   ├── about/
│   │   └── page.tsx
│   └── account/
│       └── page.tsx
├── components/
│   ├── SubjectCard.tsx       # Subject selection card
│   ├── Header.tsx
│   └── Footer.tsx
├── public/
│   └── images/
└── package.json
```

**Landing Page Design:**

```tsx
// apps/portal/app/page.tsx
export default function Home() {
  return (
    <main>
      <Hero title="EduQuest" subtitle="学びの冒険をはじめよう" />

      <SubjectGrid>
        <SubjectCard
          title="算数クエスト"
          icon="🔢"
          description="計算力を鍛えよう"
          href="https://math.edu-quest.app"
          available
        />

        <SubjectCard
          title="漢字クエスト"
          icon="📝"
          description="漢字をマスターしよう"
          href="https://kanji.edu-quest.app"
          comingSoon
        />

        <SubjectCard
          title="ひらがなクエスト"
          icon="✏️"
          description="ひらがなを覚えよう"
          href="https://kana.edu-quest.app"
          comingSoon
        />
      </SubjectGrid>
    </main>
  );
}
```

**Deliverables:**

- Live portal at `edu-quest.app`
- Subject selection interface
- Mobile-responsive design
- Shared authentication (Better Auth)

**Validation:**

- [ ] Portal loads on all devices
- [ ] Links to math.edu-quest.app work
- [ ] Authentication persists across subdomains
- [ ] SEO metadata is correct

---

### Phase 4: Architecture Refactoring (Week 9-12)

**Objective:** Abstract code for multi-subject support

**Tasks:**

- [ ] Extract common logic to `@eduquest/core`
- [ ] Rename packages: `@mathquest/*` → `@eduquest/*`
- [ ] Abstract database schema
- [ ] Create subject-agnostic types
- [ ] Update all imports

**Package Structure (Before):**

```text
packages/
├── domain/        # @mathquest/domain
└── app/           # @mathquest/app
```

**Package Structure (After):**

```text
packages/
├── core/          # @eduquest/core (shared logic)
├── math/          # @eduquest/math (math-specific domain)
├── kanji/         # @eduquest/kanji (kanji-specific domain)
├── kana/          # @eduquest/kana (kana-specific domain)
├── ui/            # @eduquest/ui (shared components)
└── auth/          # @eduquest/auth (authentication)
```

**Database Schema Evolution:**

```sql
-- Current: math-specific
CREATE TABLE quiz_results (
  id TEXT PRIMARY KEY,
  grade_id TEXT NOT NULL,
  mode TEXT NOT NULL,        -- 'add', 'sub', 'mul', 'div'
  operand_a INTEGER,
  operand_b INTEGER,
  operator TEXT,
  correct_answer INTEGER,
  user_answer INTEGER,
  is_correct INTEGER,
  created_at INTEGER
);

-- Future: multi-subject
CREATE TABLE learning_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subject TEXT NOT NULL,     -- 'math', 'kanji', 'kana'
  grade_id TEXT,
  created_at INTEGER
);

CREATE TABLE learning_results (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES learning_sessions(id),
  subject TEXT NOT NULL,

  -- Math-specific (nullable for other subjects)
  mode TEXT,
  operand_a INTEGER,
  operand_b INTEGER,
  operator TEXT,

  -- Kanji-specific (nullable for other subjects)
  kanji TEXT,
  reading TEXT,
  meaning TEXT,

  -- Common fields
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
```

**Type Definitions:**

```typescript
// packages/core/src/types/subject.ts
export type SubjectType = 'math' | 'kanji' | 'kana';

export interface BaseQuestion {
  id: string;
  subject: SubjectType;
  gradeId: string;
  difficulty: number;
}

// packages/math/src/types.ts
export interface MathQuestion extends BaseQuestion {
  subject: 'math';
  a: number;
  b: number;
  op: '+' | '-' | '×' | '÷';
  answer: number;
  extras?: ExtraStep[];
}

// packages/kanji/src/types.ts
export interface KanjiQuestion extends BaseQuestion {
  subject: 'kanji';
  kanji: string;
  readings: string[];
  correctReading: string;
}
```

**Deliverables:**

- New package structure
- Migrated code with updated imports
- Abstract database schema
- Type-safe subject handling

**Validation:**

- [ ] All tests pass
- [ ] No broken imports
- [ ] Math app still works
- [ ] Database migrations successful

---

### Phase 5: New Subject Apps (Week 13+)

**Objective:** Implement Kanji and Kana apps

**Tasks:**

- [ ] Create `apps/kanji/` (copy structure from `apps/edge/`)
- [ ] Implement kanji question generation
- [ ] Design kanji practice UI
- [ ] Deploy to `kanji.edu-quest.app`
- [ ] Create `apps/kana/`
- [ ] Implement kana question generation
- [ ] Deploy to `kana.edu-quest.app`

**Kanji App Structure:**

```text
apps/kanji/
├── src/
│   ├── routes/
│   │   ├── pages/
│   │   │   ├── start.tsx
│   │   │   └── play.tsx
│   │   └── apis/
│   │       └── quiz.ts
│   ├── application/
│   │   └── usecases/
│   │       └── kanji-quiz.ts
│   └── infrastructure/
│       └── database/
└── wrangler.toml
```

**Deliverables:**

- Working `kanji.edu-quest.app`
- Working `kana.edu-quest.app`
- Updated portal with live links

**Validation:**

- [ ] Kanji questions generate correctly
- [ ] Kana questions generate correctly
- [ ] Both apps are accessible from portal
- [ ] User progress tracked separately per subject

---

## Technical Implementation

### Cloudflare Workers Routing

```typescript
// apps/edge/src/index.ts (Router for all subdomains)
import { Hono } from 'hono';

const app = new Hono();

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Route based on subdomain
    if (hostname === 'math.edu-quest.app') {
      return handleMathApp(request, env);
    }

    if (hostname === 'kanji.edu-quest.app') {
      return handleKanjiApp(request, env);
    }

    if (hostname === 'kana.edu-quest.app') {
      return handleKanaApp(request, env);
    }

    // Default: 404
    return new Response('Not Found', { status: 404 });
  },
};
```

### DNS Configuration (Terraform)

```hcl
# infra/terraform/dns.tf

variable "eduquest_zone_id" {
  description = "Cloudflare Zone ID for edu-quest.app"
  type        = string
}

# Root domain → Portal (Cloudflare Pages)
resource "cloudflare_record" "root" {
  zone_id = var.eduquest_zone_id
  name    = "@"
  type    = "CNAME"
  value   = "eduquest-portal.pages.dev"
  proxied = true
}

# www → Root redirect
resource "cloudflare_record" "www" {
  zone_id = var.eduquest_zone_id
  name    = "www"
  type    = "CNAME"
  value   = "edu-quest.app"
  proxied = true
}

# Math subdomain → Workers
resource "cloudflare_record" "math" {
  zone_id = var.eduquest_zone_id
  name    = "math"
  type    = "CNAME"
  value   = "eduquest-math.workers.dev"
  proxied = true
}

# Kanji subdomain → Workers
resource "cloudflare_record" "kanji" {
  zone_id = var.eduquest_zone_id
  name    = "kanji"
  type    = "CNAME"
  value   = "eduquest-kanji.workers.dev"
  proxied = true
}

# Kana subdomain → Workers
resource "cloudflare_record" "kana" {
  zone_id = var.eduquest_zone_id
  name    = "kana"
  type    = "CNAME"
  value   = "eduquest-kana.workers.dev"
  proxied = true
}
```

### Shared Authentication

```typescript
// packages/auth/src/index.ts
import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  database: env.DB,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieName: 'eduquest_session',
    domain: '.edu-quest.app', // Shared across all subdomains
  },
});
```

---

## Database Schema Evolution

### Migration Strategy

1. **Backward Compatible Changes:** Add new columns without removing old ones
2. **Dual-Write Period:** Write to both old and new schema
3. **Data Migration:** Backfill existing data
4. **Switch Read:** Start reading from new schema
5. **Cleanup:** Remove old columns after validation

### Example Migration

```sql
-- Step 1: Add new columns (backward compatible)
ALTER TABLE quiz_results ADD COLUMN subject TEXT DEFAULT 'math';
ALTER TABLE quiz_results ADD COLUMN result_data TEXT;  -- JSON for flexible storage

-- Step 2: Create new table structure
CREATE TABLE learning_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  subject TEXT NOT NULL CHECK(subject IN ('math', 'kanji', 'kana')),
  grade_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE learning_results (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES learning_sessions(id),
  subject TEXT NOT NULL,
  result_data TEXT NOT NULL,  -- JSON with subject-specific data
  correct_answer TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL CHECK(is_correct IN (0, 1)),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_learning_results_session ON learning_results(session_id);
CREATE INDEX idx_learning_results_subject ON learning_results(subject);

-- Step 3: Backfill data (run after deployment)
INSERT INTO learning_results (id, session_id, subject, result_data, correct_answer, user_answer, is_correct, created_at)
SELECT
  id,
  NULL as session_id,
  'math' as subject,
  json_object(
    'mode', mode,
    'operandA', operand_a,
    'operandB', operand_b,
    'operator', operator
  ) as result_data,
  correct_answer,
  user_answer,
  is_correct,
  created_at
FROM quiz_results
WHERE subject = 'math';
```

---

## Deployment Strategy

### Deployment Sequence

1. **DNS Setup:** Configure all DNS records (no traffic yet)
2. **Portal Deployment:** Deploy to Cloudflare Pages
3. **Math App Deployment:** Deploy to math.edu-quest.app Workers
4. **Redirect Setup:** Enable mathquest.app → math.edu-quest.app redirect
5. **Monitor:** Watch metrics for 48 hours
6. **Kanji/Kana Apps:** Deploy when ready

### Deployment Commands

```bash
# Phase 1: Infrastructure
cd infra/terraform
terraform apply

# Phase 2: Portal
cd apps/portal
pnpm build
npx wrangler pages deploy dist --project-name=eduquest-portal

# Phase 3: Math App
cd apps/edge
pnpm build
npx wrangler deploy --name=eduquest-math

# Phase 4: Redirect
cd apps/mathquest-redirect
npx wrangler deploy --name=mathquest-redirect
```

### Environment Variables

```bash
# .env.production (math.edu-quest.app)
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_API_TOKEN=xxx
DATABASE_ID=xxx
KV_SESSION_ID=xxx
KV_TRIAL_ID=xxx
KV_RATE_LIMIT_ID=xxx

# Update Better Auth config
AUTH_URL=https://math.edu-quest.app
AUTH_COOKIE_DOMAIN=.edu-quest.app
```

---

## Rollback Plan

### Emergency Rollback Procedure

If critical issues are detected after migration:

1. **Disable Redirect:**

   ```bash
   cd infra/terraform
   terraform apply -var="enable_redirect=false"
   ```

2. **Restore mathquest.app:**

   - Revert DNS to point mathquest.app directly to old Workers
   - Disable new subdomain routing

3. **Database Rollback:**

   - If schema migration was applied, revert using saved migration
   - Restore from D1 backup if necessary

4. **Communication:**
   - Post status on social media/app
   - Email users if authentication was affected

### Rollback Validation

- [ ] mathquest.app serves original app
- [ ] All user sessions intact
- [ ] Database queries work
- [ ] No data loss

---

## Success Metrics

### Performance Metrics

- **Page Load Time:** < 1.5s (P95)
- **API Response Time:** < 200ms (P95)
- **Error Rate:** < 0.1%
- **Uptime:** > 99.9%

### User Metrics

- **User Retention:** Maintain or improve current rate
- **Session Duration:** Maintain or improve
- **Quiz Completion Rate:** Maintain or improve
- **Cross-Subject Engagement:** Track users using multiple subjects

### Technical Metrics

- **Build Time:** < 2 minutes
- **Deploy Time:** < 1 minute
- **Database Query Time:** < 50ms (P95)
- **Cache Hit Rate:** > 80%

---

## Timeline Summary

| Phase                        | Duration | Key Deliverables                          |
| ---------------------------- | -------- | ----------------------------------------- |
| Phase 1: Foundation          | 2 weeks  | Domain setup, DNS, SSL                    |
| Phase 2: MathQuest Migration | 2 weeks  | math.edu-quest.app live, redirect working |
| Phase 3: Portal Development  | 4 weeks  | edu-quest.app portal live                 |
| Phase 4: Refactoring         | 4 weeks  | Multi-subject architecture                |
| Phase 5: New Apps            | 6+ weeks | kanji.edu-quest.app, kana.edu-quest.app   |

**Total Estimated Time:** 18+ weeks (4.5 months)

---

## Next Steps

1. ✅ Document the migration plan (this document)
2. ⬜ Acquire `edu-quest.app` domain
3. ⬜ Set up Terraform for DNS management
4. ⬜ Create project timeline and assign tasks
5. ⬜ Begin Phase 1 implementation

---

## Questions & Decisions Needed

- [ ] **Domain Purchase:** Who will purchase edu-quest.app?
- [ ] **Budget:** Estimated costs for Cloudflare Pages + Workers?
- [ ] **Database:** Separate D1 per subject or shared database?
- [ ] **Analytics:** Google Analytics per subdomain or unified?
- [ ] **CDN:** Use Cloudflare R2 for static assets?

---

**Document Version:** 1.0
**Last Updated:** 2025-10-18
**Author:** AI Assistant (Claude)
**Approved By:** Project Owner
