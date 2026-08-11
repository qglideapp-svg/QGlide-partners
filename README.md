# QGlide Partner Code & Rewards Platform

React web application for issuing, tracking, and auditing QGlide partner referral codes (QR + alphanumeric), attribution, milestones, rewards, and settlements.

## Stack

- React 19
- TypeScript
- Vite

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Production build         |
| `npm run preview` | Preview production build |
| `npm run lint`  | Run Oxlint               |

## Project structure

```
src/
├── components/     # Shared UI components
├── constants/      # App-wide constants
├── features/       # Feature modules (partners, codes, rewards, etc.)
├── hooks/          # Custom React hooks
├── layouts/        # Page layouts (admin, partner portal)
├── pages/          # Route-level pages
│   ├── admin/      # Administrator console
│   ├── partner/    # Partner self-service portal
│   └── public/     # Scan landing & claim pages
├── services/       # API clients and data services
├── types/          # Shared TypeScript types
└── utils/          # Utility functions
```

## Platform scope

Based on the QGlide Partner Code Platform Specification (v1.2):

- **Partner categories:** limousine/fleet, restaurants, clubs & bars
- **Core flow:** scan → install → register → completed trips → milestone → reward → redemption
- **Key rules:** forward-only attribution, earned-not-claimed rewards, escalating reward ladder (3 → 9 → 15 trips)
