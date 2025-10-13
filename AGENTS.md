# AGENTS.md (Master Document)

## 1. Overview

This document provides a comprehensive guide for AI assistants (like Gemini, Claude, Copilot) to understand and contribute to the **MathQuest** project.

**MathQuest** is an educational platform for elementary school students to practice arithmetic. It's a monorepo project built with a modern web stack, running on the Cloudflare edge network.

### Core Mission

- To provide a fun, engaging, and effective learning experience.
- To build a scalable, maintainable, and high-performance application using a server-side rendering (SSR) architecture with Hono on Cloudflare Workers.

## 2. Key Documentation

This file is the central hub. For detailed information, please refer to the specific documents below.

- **[Project Overview](./docs/README.md):** Quick start, repository structure, and frequently used commands.
- **[Architecture Design](./docs/mathquest-architecture.md):** In-depth explanation of the layered architecture, module configuration, data flow, and technology stack.
- **[UI/UX Design Concept](./docs/ux-design-concept.md):** The design philosophy, target users, visual theme, color palette, and gamification strategy.
- **[Wireframes](./docs/mathquest-wireframe.md):** Structural blueprints for the main application screens (Home, Stage Select, Game, Results, etc.).
- **[Local Development](./docs/local-dev.md):** Guide for setting up and running the project locally.
- **[AI Assistant Rules](./docs/AI_RULES.md):** Common rules and guidelines for AI assistants contributing to this repository.
- **[Claude-specific Instructions](./docs/CLAUDE.md):** Specific guidance for the Claude Code assistant.
- **[rulesync Guide](./docs/RULESYNC.md):** How to use the `rulesync` tool to keep configuration files up-to-date.

## 3. System Architecture

### 3.1. High-Level Diagram

```mermaid
graph TB
    subgraph "User Interface"
        Browser
    end

    subgraph "Cloudflare Edge"
        EdgeApp[Edge App<br/>Hono SSR]
        KV_Session[KV: Auth Session]
        KV_Trial[KV: Free Trial]
        KV_Rate[KV: Rate Limit]
        KV_Idempotency[KV: Idempotency]
        D1[D1 Database]
    end

    subgraph "Application Layer"
        UseCases[Application UseCases<br/>quiz.ts]
        Session[Session Management<br/>current-user.ts]
    end

    subgraph "Domain Layer"
        DomainLogic[Domain Logic<br/>@mathquest/domain]
        AppLogic[App Logic<br/>@mathquest/app]
    end

    subgraph "Infrastructure"
        Database[Database Client<br/>Drizzle ORM]
        Schema[Database Schema]
    end

    subgraph "Routes"
        Pages[Pages<br/>home, start, play]
        APIs[APIs<br/>/apis/quiz]
    end

    Browser --> EdgeApp
    EdgeApp --> Pages
    EdgeApp --> APIs
    EdgeApp --> UseCases
    UseCases --> AppLogic
    UseCases --> Session
    AppLogic --> DomainLogic
    EdgeApp --> KV_Session
    EdgeApp --> KV_Trial
    EdgeApp --> KV_Rate
    EdgeApp --> KV_Idempotency
    EdgeApp --> Database
    Database --> D1
    Database --> Schema
```

### 3.2. Monorepo Structure (pnpm workspaces)

The project is a monorepo managed with pnpm workspaces.

- **`apps/`**: Executable applications.
  - `@mathquest/edge`: The main application (SSR + BFF API) running on Cloudflare Workers.
  - `@mathquest/api`: A Node.js server for local API development.
  - `@mathquest/web`: A Hono server for local web development.
- **`packages/`**: Shared libraries.
  - `@mathquest/domain`: The core domain logic (problem generation, calculation rules). This is the heart of the application.
  - `@mathquest/app`: Application logic that uses the domain layer (quiz session management, answer verification).
- **`infra/`**: Infrastructure as Code.
  - `terraform/`: Terraform configurations for Cloudflare resources.
  - `migrations/`: Database schemas and migration scripts for D1.
- **`docs/`**: All project documentation.

## 4. Development Workflow

### 4.1. Core Principles

- **Convention over Configuration:** Adhere to the established project conventions.
- **Linting is Law:** All code must pass linting checks (`just lint`) before submission.
- **Minimal Changes:** Make small, focused commits. Avoid unrelated refactoring.

### 4.2. Key Commands

- `just setup`: Installs all dependencies and sets up the environment.
- `just lint`: Runs all code quality checks.
- `just fix`: Applies automatic formatting and fixes.
- `pnpm dev:edge`: Starts the main application for local development.

## 5. How to Contribute

1.  **Understand the Goal:** Read the user's request carefully.
2.  **Consult the Docs:** Refer to the documents linked above to understand the relevant parts of the project. Start with the architecture and domain logic.
3.  **Locate the Code:** Use `glob` or `search_file_content` to find the relevant files. The directory structure is logical and should be your first guide.
4.  **Analyze, Don't Assume:** Read the existing code and its context before making changes.
5.  **Implement Changes:** Modify the code, adhering strictly to the project's style and conventions.
6.  **Verify:** Run `just lint` and any relevant tests to ensure your changes are correct and don't break anything.
7.  **Update Documentation:** If you change any behavior, tool, or workflow, update the corresponding documentation.
