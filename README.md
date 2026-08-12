# CouponHub — Frontend (Phase 1)

React 19 + TypeScript + Vite frontend, wired to the live `couponhub-backend` Phase 1 API
(Auth, Coupons, Categories, Brands). Same phased approach as the backend: this is real,
working, integrated code — not a static mockup.

## Stack

Vite · React 19 · TypeScript · Redux Toolkit + RTK Query · React Router 6 · React Hook Form + Zod ·
Tailwind CSS · Framer Motion · lucide-react

## Design direction

A **ticket-stub aesthetic**, since the whole product is about coupons/tickets: cards are cut like
raffle-ticket stubs with a perforated tear-line separating deal info from the redemption code,
monospace type for codes/prices (receipt feel), and a bold stamp-impact display face for headings.
Palette: parchment paper background, deep forest green as the "verified savings" primary, a hot
stamp-orange for CTAs — see `tailwind.config.ts` for the full token set.

## Setup

```bash
cd couponhub-frontend
cp .env.example .env      # defaults to http://localhost:8080/api — edit if your backend runs elsewhere
npm install
npm run dev
```

Opens on **http://localhost:5173**. Make sure `couponhub-backend` is running first (Swagger at
`http://localhost:8080/api/swagger-ui.html` should load).

## What's wired up (real API calls, not mocks)

| Feature | Backend endpoint(s) | Where |
|---|---|---|
| Register / Login / Logout / Logout-all | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/logout-all` | `src/features/auth/*`, `src/api/authApi.ts` |
| Token refresh (silent, on any 401) | `POST /auth/refresh` | `src/api/baseApi.ts` — `baseQueryWithReauth` |
| Browse / search / filter / paginate coupons | `GET /coupons` | `CouponListPage`, `CouponFilters` |
| Coupon detail (code visibility per backend rules) | `GET /coupons/{id}` | `CouponDetailPage` |
| Create coupon | `POST /coupons` | `CreateCouponPage` |
| Edit coupon | `PUT /coupons/{id}` | `EditCouponPage` |
| Delete coupon | `DELETE /coupons/{id}` | `CouponDetailPage` (owner only) |
| Vote Working/Expired on FREE coupons | `POST /coupons/{id}/vote` | `CouponDetailPage` |
| Copy coupon code (analytics hook) | `POST /coupons/{id}/copy` | `CouponCodeChip` |
| Approve / reject (moderation queue) | `POST /coupons/{id}/approve`, `/reject` | `ModerationPage`, `CouponDetailPage` |
| Seller's own listings | `GET /coupons/seller/{sellerId}` | `DashboardPage` |
| Categories / Brands listing + filters | `GET /categories`, `GET /brands`, `/brands/featured` | `CouponFilters`, `HomePage`, `CreateCouponPage` |
| Current user profile (fetch) | `GET /users/me` | `App.tsx` (`SessionBootstrap`) |
| Current user profile (update) | `PUT /users/me` | `DashboardPage` → `ProfileEditor` |
| Notifications, my requests (buyer), requests received (seller) | `GET /notifications`, `GET /requests/mine`, `GET /requests/received` | `DashboardPage` → `NotificationsPanel` / `MyRequestsPanel` / `ReceivedRequestsPanel` — all poll every 15-20s and refetch on tab focus |
| Event tickets (movies, cricket, concerts) as a coupon type, with venue/seat/date fields | `POST /coupons` (type=`EVENT_TICKET`), `GET /coupons?type=EVENT_TICKET&ticketCategory=...` | `CreateCouponPage`, `CouponFilters`, `CouponCard`, `CouponDetailPage`, `HomePage` shortcut tiles |
| Platform fee breakdown (5% default, buyer/seller split) | Computed fields on `CouponResponse` | `CreateCouponPage` payout preview, `CouponDetailPage` price breakdown |

## UX polish

- **Toasts** (`src/components/ui/toast.tsx`) give feedback on every mutating action — login, register,
  vote, copy code, create/approve/reject/delete coupon — instead of silent success or a buried inline
  error, and animate in/out with Framer Motion.
- **Page transitions**: `Layout.tsx` wraps routed content in `AnimatePresence` for a subtle fade/slide
  between pages instead of an abrupt swap.
- **Skeleton loaders** (`CouponCardSkeleton`) replace bare spinners on coupon grids so the layout
  doesn't jump when data arrives.
- **Micro-interactions**: buttons and cards use `whileHover`/`whileTap` scale animations; coupon grids
  stagger their entrance; filter dropdowns animate in/out when switching to ticket-specific options.
- **Hero CTAs** are centered on mobile (`items-center text-center`, buttons `justify-center`) and
  split into the two-column ticket layout on desktop (`md:items-center md:text-left md:justify-start`)
  — fixed from an earlier layout where the button row was left-aligned even on narrow viewports.

## Auth & token handling

- Access token (15 min) is attached to every request via `prepareHeaders` in `baseApi.ts`.
- Refresh token (14 days) is stored in `localStorage` and used automatically: any request that
  gets a 401 triggers exactly one `/auth/refresh` call (deduplicated across simultaneous requests),
  then retries. If refresh also fails, tokens are cleared and `ProtectedRoute` bounces to `/login`.
- On page reload, `App.tsx`'s `SessionBootstrap` decodes the JWT client-side first (`src/lib/jwt.ts`)
  for an instant, no-flicker minimal user object (id/email/roles), then calls `GET /users/me` and
  replaces it with the real profile (fullName, avatar, stats, etc.) once it arrives. If that call
  fails outright (refresh also failed), the session is cleared and the user is treated as logged out.

## Roles in the UI

- "List a coupon" only shows for `ROLE_SELLER` / `ROLE_PREMIUM_SELLER` / `ROLE_ADMIN` / `ROLE_SUPER_ADMIN`.
- "Moderation" nav item + `/moderation` route only shows/works for `ROLE_MODERATOR` / `ROLE_ADMIN` / `ROLE_SUPER_ADMIN`.
- New registrations only get `ROLE_USER` (matches backend behavior) — the Dashboard page explains
  this and points to the SQL in the backend's `API_REFERENCE.md` for granting roles locally.

## What's intentionally NOT built yet

These have no backend endpoints yet (see backend `README.md` roadmap), so the UI doesn't fake them:
checkout/payments, wallet, coupon requests/negotiation, chat, reviews submission, push/email
notification center, admin analytics dashboards. The coupon detail page shows a short note where
a "Buy now" flow would go, rather than a dead button.

## Project structure

```
src/
  api/            RTK Query slices (baseApi w/ auth+refresh, authApi, couponApi, categoryApi, brandApi)
  app/            Redux store + typed hooks
  components/
    layout/       Header, Footer, Layout, ProtectedRoute, RoleGuard
    ui/           Badge, Spinner, EmptyState, FormField, CouponCodeChip, Pagination
  features/
    auth/         LoginPage, RegisterPage, authSlice
    coupons/      HomePage, CouponListPage, CouponDetailPage, Create/EditCouponPage, DashboardPage
    moderation/   ModerationPage
  lib/            types.ts (mirrors backend DTOs), validators.ts (Zod), format.ts, jwt.ts, tokenStorage.ts
  routes/         router.tsx, NotFoundPage
```

## Build for production

```bash
npm run build       # outputs to dist/
npm run preview      # serve the production build locally
```

Set `VITE_API_BASE_URL` to your deployed backend URL before building — Vite inlines env vars at build time.
