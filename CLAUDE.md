# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start Next.js development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start production server
- `pnpm lint` - Run Next.js linting
- `pnpm seed` - Seed the database with initial data using `npx tsx src/db/seed.ts`

## Database Management

- Database schema is managed with Drizzle ORM
- Run migrations: `npx drizzle-kit push` or `npx drizzle-kit migrate`
- Generate migrations: `npx drizzle-kit generate`
- Configuration in `drizzle.config.ts` points to `./src/db/index.ts` schema

## Architecture Overview

### Tech Stack
- Next.js 15 with App Router
- TypeScript
- Better Auth for authentication
- Drizzle ORM with PostgreSQL
- Shadcn/ui + TailwindCSS
- Vercel AI SDK for chat functionality

### Core Data Model
The application centers around a `PortfolioDocument` type - a JSON array of sections that define a user's portfolio:
- Header (name, tagline, display picture)
- About (markdown content)
- Experience (company, role, dates, highlights)
- Education (institution, degree, dates)
- Skills (array of strings)
- Socials (platform links)
- Footer (text)

### Key Components Architecture

**Database Layer (`src/db/`)**:
- `auth-schema.ts` - Better Auth tables (user, session, account, verification)
- `portfolio-schema.ts` - Portfolio data types and database schema
- `drizzle.ts` - Database connection setup
- `index.ts` - Unified exports

**Authentication**:
- Better Auth with GitHub OAuth configured
- Session management with `getServerSession()` utility
- Protected routes redirect to `/sign-in` if unauthenticated

**Portfolio System**:
- Theme-based rendering system in `src/components/portfolio-themes/`
- Each theme component receives `PortfolioDocument` and renders all sections
- Themes: default, pink, midnight (with more theme slots defined)

**Application Flow**:
1. `/` - Landing page
2. `/sign-in` - Authentication page
3. `/chat-wizard` - AI-powered portfolio creation (uses OpenAI GPT-4o)
4. `/dashboard` - Portfolio editing interface with live preview
5. `/[username]` - Public portfolio display (server-rendered)

### Development Patterns

**Prefer Server Components**: Use React Server Components over client components unless interactivity is required

**Server Actions**: Use Next.js server actions (in `app/actions.ts`) instead of API routes for form handling

**Authentication Flow**: Always check authentication in protected pages using `getServerSession()` and redirect to `/sign-in` if not authenticated

**Database Operations**: Use Drizzle ORM with prepared statements. Portfolio content is stored as JSONB in PostgreSQL

**Styling**: TailwindCSS with Shadcn/ui components. CSS variables defined in `globals.css` for theming

**Code Quality**: Prefer maintainable code over performance optimization. Always check authentication in protected pages

### Key Files
- `src/app/actions.ts` - Server actions for portfolio CRUD operations
- `src/app/dashboard/page.tsx` - Portfolio editing interface
- `src/app/[username]/page.tsx` - Public portfolio display
- `src/app/api/chat/route.ts` - AI chat endpoint using Vercel AI SDK
- `src/lib/auth.ts` - Better Auth configuration