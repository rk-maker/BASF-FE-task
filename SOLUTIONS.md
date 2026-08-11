# Retail Analytics Dashboard — Solutions

## Overview

This is my submission for the take-home assessment: a retail analytics dashboard built with React, Ant Design, SCSS, Redux Toolkit, Axios, AG Grid, and D3.js. I completed the work in two parts, in this order: **Part B (codebase improvements) first**, followed by **Part A (store comparison feature)** — improving the foundation before building new functionality on top of it.

## Strategy

I chose to complete **Part B before Part A**. Rather than building the new comparison feature on top of an unreviewed codebase, I first corrected existing issues in the codebase. Only once the foundation was stable did I start Part A, so the new feature could follow clean, established patterns instead of adding more inconsistency on top of existing problems.

## Part B: Codebase improvements (completed first)

Before building the new feature, I reviewed the existing client code to separate genuine defects from intentional design choices, then fixed the highest-impact issues:

**Problems found**

1. **Unstable data loading** — the mock server intentionally injected random latency and a 5% failure rate, and the overview page didn't handle failed requests gracefully.
2. **Incorrect revenue grouping** — the revenue utility used a timezone-sensitive date conversion that could mis-group transactions by day.
3. **Filter and summary inconsistencies** — search filtering and summary calculations were vulnerable to stale state and duplicate rows.
4. **Weak UI resilience** — the latest-transactions list used array indexes as React keys, and store loading had no error fallback.

**Fixes applied**

- Added proper loading and error state handling in `transactionsSlice.ts` and `OverviewPage.tsx` (dedicated error field, async thunk lifecycle handling, visible alert on failure, loading spinner while in flight)
- Fixed local-date-based revenue grouping and duplicate prevention in `revenue.ts`
- Improved filtering behavior and stable item keys in `LatestTransactions.tsx`
- Reorganized API helpers into feature-specific folders (`auth` and `overview` modules) instead of one shared API module, updating all imports accordingly; kept the old shared `endpoints.ts` re-exporting them so existing imports stayed compatible

### Folder structure

Restructured the project to a **feature-first (colocated) layout**, so each feature owns its own API, components, store, types, and utils instead of those being scattered across shared top-level folders.

**Before**

```
src/
├── api/                  # shared for all features
├── pages/
│   ├── auth/
│   ├── overview/
│   │   ├── LatestTransactions.tsx
│   │   ├── OverviewPage.tsx
│   │   ├── RevenueChart.tsx
│   │   └── TransactionsGrid.tsx
│   └── LoginPage.tsx
├── store/
│   └── slices/
│       ├── authSlice.ts
│       ├── filtersSlice.ts
│       └── transactionsSlice.ts
└── types/
    └── domain.ts
```

**After**

```
src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── store/
│   │   │   └── authSlice.ts
│   │   ├── types/
│   │   └── LoginPage.tsx
│   ├── comparison/          # new Part A feature, same pattern
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── StoreComparisonPage.tsx
│   │   └── types.ts
│   └── overview/
│       ├── api/
│       ├── components/
│       │   ├── LatestTransactions.tsx
│       │   ├── RevenueChart.tsx
│       │   └── TransactionsGrid.tsx
│       ├── store/
│       │   ├── filtersSlice.ts
│       │   ├── storesSlice.ts
│       │   └── transactionsSlice.ts
│       ├── types/
│       └── OverviewPage.tsx
└── store/
    └── index.ts              # root store config only
```

**Why:**

- Each feature (`auth`, `overview`, `comparison`) is now self-contained — its API calls, Redux slices, types, components, and utils live together instead of being split across `pages/`, `store/slices/`, `api/`, and `types/`.
- Reduces cross-feature coupling and makes it obvious what can be deleted or moved if a feature is removed.

## Part A: Store comparison feature

Built a new store comparison page, integrated with routing and the existing app architecture:

- New `StoreComparisonPage` with persistent URL-based filters
- `StoreRevenueChart` — a D3.js comparison chart
- `StoreComparisonGrid` — an AG Grid summary table
- CSV export
- Correct previous-period aggregation for change-percentage calculations

**Bug fix during integration:** store data was initially held in component-local state rather than Redux, which caused it not to load correctly on the comparison page. I added a shared `storesSlice.ts` in Redux and wired both the Overview page and the Comparison page to read from it, so store data is now consistent and shared across the app.

## What I'd do with more time

- Make the API layer fully typed instead of using broad `unknown` responses
- Add retry/abort handling for requests
- Strengthen the auth flow with better route guards and logout UX
- Add more component-level tests for the overview and comparison UI
- Write test cases for each of the pages that i have build
- handle empty states
- add better error handling and validations
