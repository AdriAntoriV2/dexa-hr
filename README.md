# Dexa HR

The HR-facing web application for the Dexa employee management and attendance system. It provides a centralized interface for HR users to access employee information, review attendance, and view dashboard statistics.

## Features

- **HR dashboard** — view workforce and attendance statistics.
- **Employee management** — browse and access employee information.
- **Attendance management** — review employee attendance records.
- **Authentication** — login and protected routes for authenticated access.
- **Notifications** — access notifications through the notification interface.
- **Reusable UI components** — shared components for cards, buttons, employee avatars, statistics, and page headers.
- **Automated tests** — Vitest and React Testing Library for component and application testing.

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router 7
- Lucide React
- Vitest
- React Testing Library
- jsdom
- ESLint

## Prerequisites

- Node.js and npm
- A running Dexa backend API
- An HR account with the appropriate permissions

## Getting Started

### 1. Install dependencies

```text
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```dotenv
VITE_API_URL=http://localhost:3000
```

`VITE_API_URL` specifies the base URL of the Dexa backend API. If it is not set, the application defaults to `http://localhost:3000`.

Change the value to match your backend deployment.

**Security note:** Vite exposes variables prefixed with `VITE_` to client-side code. Do not store passwords, private API keys, or other confidential secrets in these variables.


### 3. Start the development server

```text
npm run dev
```

Open the local URL displayed in the terminal.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build the production application |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |

## Testing

Run the test suite:

```text
npm run test
```

Run linting and the production build:

```text
npm run lint
npm run build
```

## Project Structure

```text
src/
├── assets/         # Static assets
├── components/
│   ├── layout/     # App layout, sidebar, protected routes, notifications
│   └── ui/         # Reusable interface components
├── contexts/       # Authentication context
├── pages/          # Dashboard, employees, attendance, login, 404
├── services/       # API, employee, attendance, notification services
├── styles/         # Page and layout stylesheets
├── test/           # Test setup
├── types/          # TypeScript data types
├── App.tsx         # Application routes and composition
└── main.tsx        # Application entry point
```

## Related Repositories

- [Dexa Employees](https://github.com/AdriAntoriV2/dexa-employees) — employee-facing portal
- [Dexa Audit](https://github.com/AdriAntoriV2/dexa-audit) — audit event processing
- [Dexa Backend](https://github.com/AdriAntoriV2/dexa-backend) — backend API

## Development Notes

- The backend API must be available and correctly configured for application features that depend on it.
- Access to HR functionality should be controlled by the application's authentication and authorization logic.
- Run the test suite, lint checks, and production build before submitting changes.
