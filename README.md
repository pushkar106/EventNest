# EventNest

Full-stack event management and ticket booking platform: Node.js/Express/MongoDB API, React Native (Expo) mobile app, and React (Vite) admin dashboard.

## Architecture

- **Backend** `backend/` — Express API on `http://localhost:5000`
- **Admin** `admin/` — Vite + Tailwind + Redux Toolkit on `http://localhost:5173`
- **Mobile** `mobile/` — Expo + React Native Paper + Redux Toolkit

Both frontends talk to the same MongoDB-backed API.

## Demo accounts

Demo credentials are configured locally in backend/.env.

Contact the project owner for demo access.

Security: Never commit passwords, API keys, database credentials, or other secrets to GitHub.

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017/eventnest`)

## Quick start

```bash
# 1. Install
npm run install:all

# 2. Seed demo users, events, sample bookings
npm run seed

# 3. Start API (terminal 1)
npm run dev:backend

# 4. Start admin dashboard (terminal 2)
npm run dev:admin

# 5. Start Expo (terminal 3)
npm run dev:mobile

# 6. API workflow test (API must be running)
npm run test:api
```

## Mobile API URL

The app auto-detects the machine IP from Expo (`hostUri`) and uses `http://<ip>:5000/api`.

Override in `mobile/.env`:

```
# Physical Android device (same Wi-Fi as your PC)
EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:5000/api

# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

Find your LAN IP on Windows: `ipconfig` → IPv4 Address.

## Google Sign-In

Real Google OAuth is implemented (Expo Auth Session + `google-auth-library` ID token verification). Email/password still works if Google is not configured.

1. Create OAuth client IDs in Google Cloud Console (Web, Android, iOS, Expo).
2. Set in `backend/.env`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_ANDROID_CLIENT_ID=...
GOOGLE_IOS_CLIENT_ID=...
GOOGLE_EXPO_CLIENT_ID=...
```

3. Set matching values in `mobile/.env` (`EXPO_PUBLIC_GOOGLE_*`).

Until those are set, the Google button explains the missing configuration.

## Payments & QR tickets

- `MOCK_PAYMENT=true` in `backend/.env` (default) completes checkout without Razorpay keys.
- Flow: create booking → mock pay → booking `CONFIRMED` → QR generated → admin verifies QR → attendance `PRESENT`. Duplicate check-in is rejected.
- Razorpay TEST: set `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` and `MOCK_PAYMENT=false`. Backend creates orders and verifies signatures.

## Interview demo path

1. Login as user in Expo.
2. Open an event → select tickets → mock pay.
3. Open **My tickets** and show the QR.
4. Login as admin at `http://localhost:5173`.
5. Dashboard stats and **Bookings** reflect the new booking.
6. **QR Scanner** (paste `qrToken` from the ticket JSON / verify field) or **Attendees → Manual verification** with the booking ID.

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run seed` | Users, events, sample tickets |
| `npm run seed:admin` | Admin only |
| `npm run test:api` | Login, book, mock pay, QR verify |

## Project layout

```
backend/src/{models,controllers,routes,middleware,utils,scripts,services}
admin/src/{pages,store,components,api}
mobile/src/{screens,store,navigation,api}
```
