# CortexRate

Minimal MVP foundation for a conservative, backend-first community rating platform for Neural DSP Cortex Cloud captures and presets.

## Local startup

1. Copy `.env.example` to `.env.local`:
   `cp .env.example .env.local`
2. For local development, set `NEXT_PUBLIC_APP_URL=http://localhost:3000` in `.env.local`.
3. Fill in the values you have available. For Step 1, the app can still boot if some future product variables are blank.
4. Install dependencies with `npm install`.
5. Start the app with `npm run dev`.
6. Open `http://localhost:3000` for the placeholder app and `http://localhost:3000/api/health` for the shallow health check.
7. If `NEXT_PUBLIC_APP_URL` is still blank, `/api/health` should report degraded config instead of failing to load.

## Notes

- This project is intentionally a single Next.js full-stack app for MVP.
- Route handlers should stay thin; domain logic belongs in backend-only modules as the project grows.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed to client code.
- Dev auth is a local fallback only and should never replace real authentication in production.

## Production alignment

- The chosen production CortexRate origin is `https://cortexrate.app`.
- Production app env should use:
  - `NEXT_PUBLIC_APP_URL=https://cortexrate.app`
- The extension production base URL should also point to:
  - `https://cortexrate.app`
- Extension API CORS remains scoped to Cortex Cloud page requests from:
  - `https://cloud.neuraldsp.com`

## Step 2 database setup

- The initial schema lives in `supabase/migrations/0001_initial_schema.sql`.
- The minimal dev seed lives in `supabase/seed.sql`.
- Keep the seed path small and manual for now. It is only meant to support local verification of the conservative identity model.
- The seed intentionally avoids inserting into `auth.users`, so it only creates:
  - one canonical item
  - one linked observed identity
  - one unresolved observed identity
- Reviews are not seeded yet because review rows depend on authenticated users, and we want to avoid environment-specific auth table writes.
- Apply the migration first, then run the seed file against the same database.

## Step 3 identity resolution

- `POST /api/v1/identity/resolve` is the only product endpoint added in this step.
- Behavior is conservative:
  - exact known-match lookup only
  - creates a new unresolved observed identity when unknown
  - never creates canonical items
- Route parsing stays in `app/api/...`; backend logic lives under `server/...`.

## Step 4 canonical promotion

- `POST /api/v1/canonical-items` is the only new endpoint in this step.
- Promotion is authenticated and intentional.
- The route stays thin; promotion logic lives under `server/...`.
- Promotion creates a canonical item only for a specific observed identity and returns the existing canonical item if that observed identity is already linked.
- No review write endpoint, fuzzy matching, merge tooling, or extension logic is added in this step.

## Step 5 review upsert

- `POST /api/v1/items/{canonicalItemId}/reviews` is the only new endpoint in this step.
- Auth is required.
- Reviews attach only to canonical items.
- The endpoint uses one-review-per-user-per-item upsert semantics:
  - create when no review exists
  - update when a review already exists
- Rating summary is computed server-side from active reviews only.

## Step 6 item and review reads

- `GET /api/v1/items/{canonicalItemId}` returns canonical item metadata plus the active-only rating summary.
- `GET /api/v1/items/{canonicalItemId}/reviews` returns active reviews only, newest first.
- Reviews support simple `limit` + `offset` pagination.
- User display names are included when they can be resolved safely.

## Step 7 minimal web page

- `app/items/{canonicalItemId}/page.tsx` is the only item page in scope.
- The page server-renders:
  - canonical item metadata
  - active-only rating summary
  - first page of active reviews
- Review submission stays in one client component that posts to the existing review upsert endpoint.
- Known limitation: the review form only prefills when the current user's active review appears in the first page of active reviews.
- No search, ranking, browse page, extension UI, or profile page is added in this step.
