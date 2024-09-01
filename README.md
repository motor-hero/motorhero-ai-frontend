
# Motor Hero AI - Frontend

The Motor Hero AI Frontend is a modern and responsive web interface designed to interact seamlessly with the Motor Hero AI Backend, facilitating the management and enrichment of automotive parts.

## Table of Contents
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Code Structure](#code-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Architecture

The frontend is built using the following technologies:
- [Vite](https://vitejs.dev/) - Fast and lightweight development environment.
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/) - A superset of JavaScript that adds static types.
- [TanStack Query](https://tanstack.com/query) - Powerful data fetching and caching for React.
- [TanStack Router](https://tanstack.com/router) - A type-safe, enterprise-grade router for React.
- [Chakra UI](https://chakra-ui.com/) - A simple, modular, and accessible component library for React.

## Features

- Responsive UI for managing and enriching automotive parts.
- Integration with backend APIs for real-time data fetching and updates.
- Modular and maintainable code structure with TypeScript.
- Fast development and live reloading with Vite.

## Getting Started

### Prerequisites

Ensure that you have Node.js installed on your system. It is recommended to use Node Version Manager (nvm) or Fast Node Manager (fnm) to manage Node.js versions.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/motor-hero/motor-hero-ai-frontend.git
   cd motor-hero-ai-frontend
   ```

2. Install the required Node.js version:
   ```bash
   # If using fnm
   fnm install

   # If using nvm
   nvm install
   ```

3. Use the installed Node.js version:
   ```bash
   # If using fnm
   fnm use

   # If using nvm
   nvm use
   ```

4. Install the necessary packages:
   ```bash
   npm install
   ```

## Usage

To start the development server:

```bash
npm run dev
```

The development server will be available at `http://localhost:5173/`.

### Configuration

The frontend can be configured using environment variables. Create a `.env` file based on the `.env.example` template and configure it as needed.

For example, you can set the API URL:

```env
VITE_API_URL=http://localhost:8000
```

### Code Structure

The frontend project is organized as follows:

- `src/` - Main application code.
- `src/assets/` - Static assets such as images and fonts.
- `src/components/` - Reusable UI components.
- `src/hooks/` - Custom hooks for logic reuse.
- `src/routes/` - Application routes and page components.
- `src/client/` - Generated API client based on OpenAPI schema.
- `theme.tsx` - Custom theme configurations for Chakra UI.

## Testing

The frontend includes end-to-end tests using Playwright. To run the tests, first ensure that the backend is running:

```bash
docker compose up -d
```

Then, execute the tests:

```bash
npx playwright test
```

For a UI-driven test experience, run:

```bash
npx playwright test --ui
```

To stop the backend services and clean up the environment:

```bash
docker compose down -v
```

### Deployment

To build the frontend for production:

```bash
npm run build
```

The build artifacts will be generated in the `dist` directory. These can be served by any static file hosting service.
