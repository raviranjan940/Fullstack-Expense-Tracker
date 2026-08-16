# Spendly — Expense Tracker

A modern, ledger-style expense tracker built with **React + Vite + Tailwind CSS**, using **Clerk** for authentication and **Firebase Firestore** for data storage.

## Tech Stack

- **Build tool:** [Vite](https://vitejs.dev) 6
- **UI:** React 18, Tailwind CSS 3, Radix UI + shadcn-style components
- **Auth:** [Clerk](https://clerk.com) (`@clerk/clerk-react`)
- **Data:** Firebase Firestore (auth handled by Clerk — see `firestore.rules`)
- **Charts/Export:** jsPDF, react-csv, papaparse

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your Firebase + Clerk keys (see .env.example)

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note on environment variables:** Vite exposes only variables prefixed with `VITE_` to the client (e.g. `VITE_CLERK_PUBLISHABLE_KEY`). Server-only secrets like `CLERK_SECRET_KEY` must never be prefixed with `VITE_`.

## Scripts

| Command          | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run dev`    | Start the Vite dev server (port 3000)        |
| `npm run build`  | Production build to `dist/`                  |
| `npm run preview`| Preview the production build locally         |
| `npm run deploy` | Deploy the `dist/` build to Firebase Hosting |

## Project Structure

```
├── public/                 # Static assets (favicon, robots.txt)
├── src/
│   ├── assets/             # Images / SVG assets
│   ├── components/
│   │   ├── ui/             # shadcn-style primitives (button, card, dialog…)
│   │   └── …               # Feature components (Header, Cards, Modals…)
│   ├── context/            # React contexts (theme)
│   ├── lib/                # Utilities & services (utils, firebase)
│   ├── pages/              # Route-level pages (Signup, Dashboard)
│   ├── App.jsx             # Root component (ClerkProvider + routes)
│   └── main.jsx            # Vite entry point
├── index.html              # Vite HTML entry
├── vite.config.js          # Vite + path alias (@ -> src)
├── tailwind.config.cjs     # Tailwind theme
├── firestore.rules         # Firestore security rules
└── firebase.json           # Firebase hosting / rules config
```

Imports use the `@/` alias (configured in `vite.config.js`), e.g. `import { db } from "@/lib/firebase"`.

## Security Notes

- **Firestore rules are permissive** because Firestore cannot verify Clerk sessions. For production, bridge Clerk → Firebase by minting Firebase custom tokens from a backend (see comments in `firestore.rules`).
- Authentication state lives entirely in Clerk; Firebase is used only for Firestore storage.