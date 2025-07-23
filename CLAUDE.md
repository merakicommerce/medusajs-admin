# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` or `yarn start` (runs on port 7000)
- **Build for production**: `npm run build`
- **Type checking**: `npm run check` (runs TypeScript compiler)
- **Format code**: `npm run format` (Prettier)
- **Preview production build**: `npm run preview`
- **Run Storybook**: `npm run storybook` (development component library on port 6006)
- **Build Storybook**: `npm run build-storybook`

## Architecture Overview

This is a Medusa Admin dashboard built with React 18, TypeScript, and Vite. It uses React Router v6 for navigation and React Query (TanStack Query) for API state management.

### Key Technologies
- **Build Tool**: Vite with React plugin
- **UI Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **State Management**: React Query for server state, React Context for client state
- **Backend Integration**: Medusa commerce API via `medusa-react` library
- **Component Development**: Storybook for component documentation

### Project Structure

#### Core Application (`src/`)
- **`App.tsx`**: Main router setup with lazy-loaded route components
- **`main.tsx`**: Application entry point with provider wrappers
- **`services/`**: API configuration, query client, and backend request utilities
  - `api.js`: Comprehensive API service layer with all Medusa endpoints
  - `config.js`: Environment configuration (backend URLs, feature flags)
  - `request.js`: HTTP request utilities and interceptors

#### Components (`src/components/`)
Organized in atomic design pattern:
- **`atoms/`**: Basic UI elements (buttons, inputs, avatars, etc.)
- **`molecules/`**: Composed components (forms, modals, tables, etc.)
- **`organisms/`**: Complex components (sidebar, topbar, layout structures)
- **`templates/`**: Page-level layout components and specialized tables

#### Domain Logic (`src/domain/`)
Feature-specific pages and components:
- **`orders/`**: Order management, fulfillment, returns, refunds
- **`products/`**: Product catalog, variants, pricing, inventory
- **`customers/`**: Customer management and segmentation
- **`discounts/`**: Promotions, coupons, pricing rules
- **`settings/`**: Admin configuration (regions, currencies, users, taxes)
- **`gift-cards/`**: Gift card management and denominations

#### Context Providers (`src/context/`)
Global state management:
- **`account.jsx`**: User authentication and session
- **`cache.jsx`**: Client-side caching strategies
- **`feature-flag.tsx`**: Feature toggles and progressive rollouts
- **`interface.jsx`**: UI state and preferences

### Development Patterns

#### API Integration
- All API calls use the centralized `api.js` service
- Backend requests are proxied through Vite dev server (`/api` → backend)
- Responses follow Medusa API conventions with `.data` property access

#### Component Organization
- Components use TypeScript with React.FC patterns
- Styling with TailwindCSS utility classes and custom design tokens
- Form handling with `react-hook-form` and validation
- Tables use `react-table` with custom hooks for sorting/filtering

#### Route Structure
- Main app routes under `/a/*` (authenticated admin area)
- Public routes: `/login`, `/invite`, `/reset-password`
- Lazy loading for code splitting and performance

#### Development Workflow
- Uses Vite dev server with hot module replacement
- Environment variables prefixed with `VITE_` for client-side access
- Backend URL configurable via `VITE_MEDUSA_BACKEND_URL`
- TypeScript strict mode enabled with path aliases for legacy compatibility

### Testing & Quality
- No test framework currently configured (placeholder test script)
- ESLint and Prettier configured for code consistency
- Storybook for component development and documentation