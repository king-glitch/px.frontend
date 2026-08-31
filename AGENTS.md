# PX Frontend Coding Rules & Guidelines

Welcome to the **PX Frontend** project (Personal Expense & Bank Transaction Tracking Web Application). To maintain clean code, high performance, and cohesive collaboration between AI agents and developers, strictly adhere to the guidelines detailed below.

---

## 🚀 0. Mandatory Agent Behavior

- **Always Read Frontend Docs First**: Whenever performing any frontend-related work, always read [AGENTS.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/AGENTS.md), [DESIGN.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/DESIGN.md), and [API.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/API.md) to adhere to all design, type, and architectural constraints.
- **Mandatory Type Check Before Completion**: Always run `bun run typecheck` and `bun run build` before completing any frontend task. All TypeScript type errors and build warnings must be fully fixed with zero errors.
- **Strict Path Alias Imports (`@/...`)**: NEVER use relative imports like `./` or `../`. Always use the `@/...` path alias (e.g., `@/api/...`, `@/components/...`, `@/routes/...`, `@/lib/...`, `@/theme/...`).
- **Skills First**: Utilize installed skills (`chakra-ui-builder`, `chakra-ui-refactor`, `react-router`) before improvising or writing boilerplate.
- **No Unrequested Commits**: NEVER commit code directly. User commits only. Keep changes clean in the working tree.
- **TypeScript Strictness**: Strictly typed TypeScript with zero `any` types. Ensure all models match the backend API contract defined in [API.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/API.md).
- **Design Fidelity**: Adhere strictly to the Holographic Glassmorphic & Cyber-Pastel design system specified in [DESIGN.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/DESIGN.md).

---

## 📁 1. Project Directory Structure

We enforce a modular, feature-oriented structure with clear boundaries between shared UI primitives, global features, routes, and data access layers:

```
src/
├── api/                    # API client, HTTP services, models, and TanStack Query hooks
│   ├── client.ts           # Axios instance with auth interceptors & envelope parsing
│   ├── types/              # TypeScript interfaces mirroring API.md (BankTransaction, User, etc.)
│   └── hooks/              # Custom TanStack Query hooks (e.g., useTransactions, useAuth)
├── components/
│   ├── ui/                 # Chakra UI v3 primitives & snippets (provider, toaster, tooltip, color-mode)
│   └── shared/             # Reusable shared UI widgets (navbar, sidebar, stat cards, metric pills)
├── routes/                 # React Router v8 route modules
│   ├── index.tsx           # Dashboard / Home route
│   └── [route-name]/       # Feature routes (e.g., transactions, categories, settings)
│       └── components/     # Route-bound components strictly used by this specific page
├── theme/                  # Chakra UI v3 custom design tokens, semantic tokens & recipes
├── config.ts               # Centralized configuration (API URLs, storage keys, defaults)
├── root.tsx                # App root layout, HTML shell, Chakra & ColorMode providers
└── routes.ts               # React Router v8 route configuration table
```

### Component Placement Rules:

- **Global / Shared Components** (`src/components/`): General UI components, layouts, navigation, and feedback widgets reused across multiple views.
- **Chakra Snippets** (`src/components/ui/`): Base Chakra UI v3 components (e.g. `provider.tsx`, `toaster.tsx`, `tooltip.tsx`, `color-mode.tsx`).
- **Route-Specific Components** (`src/routes/[page-path]/components/`): Components and sub-views used solely within a single route.

---

## 🔠 2. File & Component Naming Conventions

- **Filenames**: Must strictly use **`kebab-case`** (lowercase with hyphens).
    - _Correct_: `transaction-table.tsx`, `category-badge.tsx`, `use-transactions.ts`
    - _Incorrect_: `TransactionTable.tsx`, `categoryBadge.tsx`, `useTransactions.ts`
- **Component Names**: Must match the PascalCase translation of the filename.
- **Component Boilerplate**:
    ```tsx
    import React from "react";
    import { Box } from "@chakra-ui/react";

    interface ComponentNameProps {
    	// define typed props here
    }

    export const ComponentName: React.FC<ComponentNameProps> = ({}) => {
    	return <Box>{/* component markup */}</Box>;
    };

    export default ComponentName;
    ```

---

## 🎨 3. Design System & Styling Guidelines

Follow the visual specifications in [DESIGN.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/DESIGN.md):

- **Aesthetic Style**:
    - **Holographic Glassmorphism**: Frosted glass containers (`backdrop-filter: blur(12px)`), semi-transparent white/dark surfaces, subtle 1px border strokes (`rgba(255, 255, 255, 0.4)` or dark equivalent), and soft diffuse drop shadows (`0 8px 32px rgba(15, 23, 42, 0.04)`).
    - **Soft Minimalist / Neo-Clean**: High-key, luminous whitespace with squircle/pill geometry and smooth micro-interactions.
    - **Cyber-Pastel / Holographic Accents**: Multi-stop linear/conic pastel gradients (Prism Cyan `#A5F3FC`, Soft Lavender `#DDD6FE`, Pastel Blush `#FBCFE8`, Cyber Lime `#A3F788`).
- **Chakra UI v3 Usage**:
    - Use Chakra UI layout primitives (`Box`, `Flex`, `Stack`, `Grid`, `Container`, `Button`, etc.).
    - Use semantic color tokens and design system tokens defined in the Chakra theme.
    - **No Inline Hardcoded Colors**: Avoid raw hex/rgb literals inside component props; use theme tokens or CSS variables.
- **Color Mode**:
    - Support both Light and Dark themes via `ColorModeProvider` (`next-themes` integration).
    - Use semantic tokens with `{ _light: "...", _dark: "..." }` values for seamless theme switching.

---

## 🌐 4. API Integration & Server State

All API communication follows the backend contract in [API.md](file:///Users/rachamon/Desktop/developments/personal/px/frontend/API.md):

- **Envelope Response**: All backend responses adhere to the standard envelope:
    - Success: `{ "data": { ... } }`
    - Error: `{ "data": {}, "errors": { "message": string, "code": string, "violations": Record<string, { code: string, message: string }> } }`
- **Authentication & Session**:
    - Authenticated endpoints require the `Authorization: Bearer <session_token>` header.
    - Store session tokens securely and attach them via Axios request interceptors.
    - Handle `401 Unauthorized` (`Service.Authentication.Unauthorized` / `Service.Authentication.InvalidToken`) by clearing session state and redirecting to login.
- **State Management with TanStack Query**:
    - Use `@tanstack/react-query` for all server state, queries, and mutations.
    - Define centralized Query Key factories for consistent caching and cache invalidation.
    - Use mutation callbacks (`onSuccess`, `onError`) to trigger cache refetches and toast notifications via `toaster.create(...)`.

---

## ⚙️ 5. Configuration Centralization (No Magic Strings)

- **Centralized Configuration**: All static values, API base URLs, pagination limits, date-time formats, and route paths must be declared in [src/config.ts](file:///Users/rachamon/Desktop/developments/personal/px/frontend/src/config.ts).
- **Decoupled Presentation**: Never hardcode endpoint URLs, query keys, or backend status enum values directly inside TSX markup or components. Reference typed enums and centralized configs.

---

## 🧪 6. Type Safety & Validation

- **Domain Models**: Export domain interfaces (`BankTransaction`, `BankCategory`, `User`, `Collection<T>`) matching the backend schema.
- **Form Validation**: Handle backend validation violations returned in the error envelope (`errors.violations[field_name]`) to provide inline field feedback.
