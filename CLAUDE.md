# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Start dev server (uses Turbopack + node-compat.cjs)
pnpm run build        # Production build
pnpm run lint         # ESLint via next lint
pnpm run test         # Vitest test suite
pnpm run setup        # First-time setup: install + prisma generate + migrate
pnpm run db:reset     # Reset SQLite database
```

Run a single test file:
```bash
pnpm vitest run src/lib/__tests__/file-system.test.ts
```

## Architecture

UIGen is a Next.js 15 App Router app where users describe React components in a chat, and Claude generates them live in a sandboxed iframe preview — no files written to disk.

### Data Flow

1. User message → `ChatProvider` (`src/lib/contexts/chat-context.tsx`) → `POST /api/chat`
2. API route calls `streamText` with two AI tools: `str_replace_editor` and `file_manager`
3. Tool calls stream to the client; `onToolCall` dispatches to `FileSystemProvider`
4. `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) mutates the in-memory `VirtualFileSystem`
5. `PreviewFrame` detects changes → calls `createImportMap()` → sets `iframe.srcdoc`

### Key Modules

- **`src/lib/file-system.ts`** — `VirtualFileSystem`: in-memory file tree. Also exposes higher-level editor commands (`viewFile`, `replaceInFile`, `insertInFile`, `createFileWithParents`) consumed by AI tools.
- **`src/lib/transform/jsx-transformer.ts`** — Preview engine: `@babel/standalone` transpiles JSX → JS, `createImportMap()` maps React/ReactDOM to `esm.sh` and local files to Blob URLs, `createPreviewHTML()` builds the full iframe HTML with Tailwind CDN.
- **`src/lib/tools/str-replace.ts` + `file-manager.ts`** — The two AI tool definitions passed to `streamText`.
- **`src/lib/provider.ts`** — Returns `anthropic("claude-haiku-4-5")` if `ANTHROPIC_API_KEY` is set, otherwise a `MockLanguageModel` with hardcoded demos.
- **`src/lib/auth.ts`** — JWT sessions via `jose`, stored as `httpOnly` cookie (7-day expiry).
- **`src/lib/anon-work-tracker.ts`** — Persists anonymous chat/FS state in `sessionStorage`; migrated to DB on sign-in.

### Routes

| Route | Description |
|---|---|
| `/` | Redirect authenticated users to latest project; anonymous users get `MainContent` |
| `/[projectId]` | Load project from DB, render `MainContent` with project data |
| `/api/chat` | Streaming AI endpoint (120s max), calls Claude with file system tools |

### Node Compatibility Shim

`node-compat.cjs` is required via `NODE_OPTIONS` at dev/build time. It deletes `globalThis.localStorage` and `globalThis.sessionStorage` on the server to fix a Node 25+ SSR issue where those globals exist but are non-functional.

### Database

SQLite via Prisma 6. Two models: `User` (id, email, password) and `Project` (id, name, userId, messages as JSON, data as JSON). Prisma client is generated to `src/generated/prisma`.

### Testing

Tests live in `__tests__/` subdirectories alongside source files. Vitest + jsdom + Testing Library.
