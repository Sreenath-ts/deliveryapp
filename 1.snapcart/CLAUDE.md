# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server (Next.js with Turbopack)
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint
npx tsc --noEmit # type-check without emitting files
```

No test suite exists in this project.

## What this app is

**Snapcart** — a 10-minute grocery delivery app. Three roles share a single codebase:

| Role | Dashboard | What they do |
|------|-----------|--------------|
| `user` | `UserDashboard` | Browse groceries, cart, checkout, track orders |
| `admin` | `AdminDashboard` | Manage groceries, categories, banners, orders |
| `deliveryBoy` | `DeliveryBoy` / `DeliveryBoyDashboard` | Accept assignments, track location, OTP delivery |

## Architecture

### Role routing
`src/app/page.tsx` is a **Server Component** that reads the NextAuth session, fetches the user from MongoDB, and renders the correct dashboard component based on `user.role`. There are no separate route groups per role — all branching happens in `page.tsx`.

New users without a `mobile` or `role` are intercepted and shown `EditRoleMobile` before reaching any dashboard.

### Auth — NextAuth v5 (beta)
- Config lives in `src/auth.ts`. Credentials + Google OAuth providers.
- Strategy: JWT. Session has `id`, `name`, `email`, `role`.
- Role is stored in the JWT token and synced via `trigger === "update"` when a user changes their role.
- `src/Provider.tsx` wraps the app in `SessionProvider`.

### Client-side user data — Redux
`src/redux/store.ts` has two slices:
- **`user`** (`userSlice`) — stores `userData` (the full DB user object). Populated by `InitUser` component (in root layout) which calls `/api/me` once the session is `authenticated`.
- **`cart`** (`cartSlice`) — `cartData[]`, `subTotal`, `deliveryFee` (₹40, free above ₹100), `finalTotal`. Cart lives only in memory (no persistence).

`StoreProvider` and `InitUser` are mounted in `src/app/layout.tsx` so Redux user data is available globally.

### Database — MongoDB + Mongoose
- `src/lib/db.ts` — singleton connection using a `global.mongoose` cache (required for Next.js serverless/hot-reload). It also imports `src/models/index.ts`.
- **`src/models/index.ts` must be updated whenever you add a new model** — it ensures all Mongoose models are registered before any query runs, preventing "Schema hasn't been registered" errors in serverless contexts.
- All models use the `mongoose.models.X || mongoose.model("X", schema)` pattern to avoid re-registration.
- Every API route calls `await connectDb()` at the top before any DB operation.

### Real-time — Socket.io
- `src/lib/socket.ts` — singleton `socket.io-client` connecting to a **separate socket server** at `NEXT_PUBLIC_SOCKET_SERVER` (default: `http://localhost:5001`).
- Delivery boys: `GeoUpdater` component watches `navigator.geolocation` and emits `update-location` events via socket. `GlobalGeoUpdater` (in root layout) keeps this running on every page for delivery boys.
- Server → client events: API routes POST to `${NEXT_PUBLIC_SOCKET_SERVER}/notify` via `src/lib/emitEventHandler.ts`. This triggers events like `new-order` to broadcast to all connected delivery boys.
- When a user connects, they emit `"identity"` with their `userId` so the socket server can map user → socketId.

### Admin global notifications
- `AdminNotificationBanner` is mounted in `src/app/layout.tsx` inside `StoreProvider`. It reads Redux `userData.role` and renders nothing unless the role is `"admin"`.
- Listens globally for the `"new-order"` socket event so the admin receives alerts from any page, not just `/admin/manage-orders`.
- On each new order, fires three things simultaneously:
  1. **In-app toast** — slides in from the top-right, stacks if multiple orders arrive, auto-dismisses after 8s with a shrinking progress bar, has a manual dismiss button and a "View Orders →" link.
  2. **Browser push notification** — uses the native `Notification` API. Permission is requested on component mount if not yet granted.
  3. **Chime sound** — generated via `AudioContext` (two sine tones: 880 Hz → 660 Hz). No audio file required.

### Payments — Razorpay
Flow for online payments:
1. `POST /api/user/payment` — creates a Razorpay order + a DB Order with `paymentStatus: "pending"`.
2. Client opens Razorpay modal.
3. `POST /api/user/payment/verify` — verifies HMAC signature, sets `isPaid: true` and `paymentStatus: "paid"`.
4. COD orders skip all of this and go directly to `POST /api/user/order`.

### Image uploads — Cloudinary
`src/lib/cloudinary.ts` exports `uploadOnCloudinary(file: Blob): Promise<string | null>`. Used in admin API routes when handling banner and grocery images. `next.config.ts` whitelists `res.cloudinary.com` for `next/image`.

### Banner / Hero system
- Two banner types: `image` (Cloudinary URL) and `text` (Tailwind gradient + text color).
- Admins manage banners at `/admin/manage-banners`.
- `HeroSection` fetches active banners from `/api/banners/get-active` and renders a full-width, full-bleed animated hero slider with auto-play and swipe support. No side panel — navigation is via centered dot indicators and always-visible prev/next arrows.
- Image banners use a left-heavy gradient overlay. Text banners use `bgGradient` + `textColor`.
- Each banner has an optional `buttonText` and optional `buttonLink`. If `buttonLink` is set the CTA renders as `<a target="_self">`; if omitted it scrolls to the products section; if `buttonText` is empty the CTA is hidden entirely.
- Banner `order` field controls display sequence; `isActive` toggles visibility.

## Key data models

**User** — `role: "user" | "deliveryBoy" | "admin"`, `location: GeoJSON Point`, `socketId`, `isOnline`. Has a `2dsphere` index on `location`.

**Order** — `status: "pending" | "out of delivery" | "delivered"`, `paymentMethod: "cod" | "online"`, `paymentStatus: "pending" | "paid" | "failed"`, `deliveryOtp`, `deliveryOtpVerification`, `assignment` ref, `assignedDeliveryBoy` ref.

**DeliveryAssignment** — links an order to delivery boys. `brodcastedTo[]` tracks all boys who received the broadcast; `assignedTo` is who accepted. `status: "brodcasted" | "assigned" | "completed"`.

**Banner** — `type: "image" | "text"`, `title`, `subtitle`, `buttonText` (optional), `buttonLink` (optional URL), `bgGradient` (CSS gradient string for text-type banners), `textColor: "white" | "dark"`, `badge` (e.g. "Flash Sale"), `order` (display order), `isActive`.

## Environment variables required

```
MONGODB_URL
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_SOCKET_SERVER      # URL of the separate socket server
NEXT_PUBLIC_IMAGE_BASE_URL     # optional, prefix for relative image paths in banners
```

## Conventions

- **Animation library**: `motion/react` (Framer Motion v12) — import from `"motion/react"`, not `"framer-motion"`.
- **Icons**: `lucide-react`.
- **Styling**: Tailwind CSS v4. No CSS modules. Global styles in `src/app/globals.css`.
- **`@/`** maps to `src/` (configured in `tsconfig.json`).
- API routes that handle file uploads use `FormData` / `req.formData()` and call `uploadOnCloudinary`.
- Admin API routes sit under `/api/admin/`; user-facing under `/api/user/`; delivery under `/api/delivery/`.
