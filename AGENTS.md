# AGENTS.md — ayesh-web

Web client untuk ayesh-core: TanStack Start v1 (SSR, file-based routing) + React 19 + Vite 8 + nitro. Package manager: **Bun only** (ada `bun.lock`; jangan npm/yarn).

## Run / build / check

Semua perintah dari `ayesh-web/`:

| Purpose    | Command             | Notes                                                                                                      |
| ---------- | ------------------- | ---------------------------------------------------------------------------------------------------------- |
| Install    | `bun install`       | jangan npm/yarn                                                                                            |
| Dev        | `bun run dev`       | Vite port **3000** (fallback otomatis 3001 bila sibuk) — cek log                                           |
| Build      | `bun run build`     | `vite build` (SSR) + nitro `.output/`                                                                      |
| Preview    | `bun run preview`   |                                                                                                            |
| Prod start | `bun run start`     | `node .output/server/index.mjs` (nitro)                                                                    |
| Type check | `bun run typecheck` | `bunx tsc --noEmit`; strict — wajib 0 error                                                                |
| Lint       | `bun run lint`      | `eslint .` — gate: **0 error, 16 warning baseline** (react-refresh + set-state-in-effect); fix: `lint:fix` |
| Format     | `bun run format`    | Prettier (`singleQuote`, `semi`, `printWidth:100`, `trailingComma:all`); cek: `format:check`               |
| Unit test  | `bun run test`      | Vitest (`vitest run`) — 67 tests / 6 file; watch: `test:watch`                                             |

## Proxy backend

- Backend: ayesh-core di `http://127.0.0.1:8080` — jalankan dulu (`python main.py` di `ayesh-core/`, butuh Redis).
- Dev: `vite.config.ts` `server.proxy` → `/api/*` di-strip prefix → `127.0.0.1:8080` (rewrite `/api` → ``).
- Prod: nitro `routeRules` `'/api/**': proxy` yang sama.
- `libs/http.ts` `apiBase()`: `baseUrl` kosong (default) = pakai `/api` proxy; diisi = direct call.

## Stack (resep — jangan diganti)

- **zod v4**: request/form `parse()` ketat; response `z.looseObject` + `safeParse` — gagal → `logger.warn` + tampilkan data apa adanya.
- **axios** non-streaming (`libs/http.ts` `request<T>()`): interceptor normalisasi error → `HTTP {status}: {detail}`; network error → `Failed to fetch`.
- **`@microsoft/fetch-event-source`** untuk SSE chat (`libs/sse.ts` `ssePost()`, `openWhenHidden: true`).
- **pino** (`libs/logger.ts`), **zustand** (`stores/`), **react-query** (+ DevTools hanya `import.meta.env.DEV`), **react-table v9** (`components/ui/data-table.tsx`).
- Icon per kategori: `src/components/icons/*` (barrel `index.ts`). Types/zod per kategori: `src/types/*`.
- Rencana lengkap penyelarasan: `E:\code\fr\AYESH-WEB-PLAN.md`.

## Architecture (`src/`)

- `routes/__root.tsx` — root layout (nav, `<HeadContent>`/`<Scripts>` wajib untuk SSR).
- `routes/index.tsx` — chat: `chatStreamTokens()` SSE token-level, `AbortController` cancel, persist via `stores/chat` (zustand localStorage, `skipHydration` + `rehydrateChat()`), feedback `useMutation`.
- `routes/{sessions,agents,system,settings}.tsx` — halaman lain (detail per komponen di `components/{sessions,agents,system,settings}`).
- `api.ts` — facade re-export `./api/{system,chat,agents,sessions,jobs,feedback,users,types}.ts`.
- `libs/http.ts` axios instance + `request<T>()`; `libs/sse.ts` `ssePost()`; `libs/logger.ts` pino; `libs/query-client.ts` QueryClient.
- `stores/settings.ts` (koneksi + override), `stores/chat.ts` (sesi + pesan, cap 200).
- `types/` — zod schema + tipe TS per domain; `components/ui/*` — primitif shadcn-style.
- `router.tsx` — `createRouter` dengan `routeTree` dari **`routeTree.gen.ts` (auto-generated, gitignored)** — jangan edit tangan; regenerate oleh Vite plugin saat `bun run dev`/`build`.
- `styles.css` — dark theme CSS variables; satu file global.

## Tests

- Config: `vitest.config.ts` — jsdom, setup `src/test/setup.ts`, include `src/**/*.test.{ts,tsx}`, alias `@`, **tanpa globals** (import eksplisit dari `vitest`); file tsx wajib `afterEach(cleanup)`.
- File: `types/schemas.test.ts`, `stores/{settings,chat}.test.ts`, `libs/{http,sse}.test.ts`, `components/ui/data-table.test.tsx`.

## Quirks

- Plugin order di `vite.config.ts` kritis: `tanstackStart()` **sebelum** `viteReact()`, lalu `tailwindcss()`, `nitro()`.
- SSR aman: react-query tidak fetch saat SSR; chat store `skipHydration` (rehydrate manual di client).
- **Gate sebelum commit**: `typecheck` 0 error · `lint` 0 error/16 warning · `test` lulus · `build` sukses · smoke headless Chrome 5 rute (`/`, `/sessions`, `/agents`, `/system`, `/settings`) tanpa `Hydration failed|Invalid hook|Uncaught`.
- UI copy berbahasa Indonesia; tanpa komentar baru di kode; file < 370 baris; commit hanya bila diminta eksplisit.
