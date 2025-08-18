# Project Structure (v0.1.0)

This document provides a tree-like visual representation of the codebase's file and folder structure. Each file and folder includes a brief description explaining its purpose.

```
├── .dockerignore - Specifies files and directories to be ignored by Docker
├── .gitignore - Specifies files and directories to be ignored by Git
├── components.json - Configuration file for UI components
├── eslint.config.mjs - ESLint configuration for code linting
├── next.config.ts - Next.js configuration file
├── package-lock.json - Lock file for npm dependencies
├── package.json - Project metadata and dependencies
├── postcss.config.mjs - PostCSS configuration for styling
├── README.md - Project overview and setup instructions
├── server.ts - Main server file with Socket.IO integration
├── tailwind.config.ts - Tailwind CSS configuration
├── tsconfig.json - TypeScript configuration
├── .next/ - Next.js build output directory
├── db/ - Database files (SQLite)
├── docs/ - Project documentation
│   ├── architecture.md - System architecture overview
│   ├── features.md - List of implemented features
│   ├── logic_classes.md - Core business logic documentation
│   ├── project_structure.md - This file - Project structure documentation
│   ├── ui_classes.md - UI components documentation
│   └── user_flow.md - User journey documentation
├── node_modules/ - NPM dependencies (git ignored)
├── prisma/ - Prisma ORM configuration and schema
│   ├── schema.prisma - Database schema definition
│   └── db/ - Database files
├── public/ - Static assets
└── src/ - Source code directory
    ├── app/ - Main application directory
    │   ├── api/ - API routes
    │   │   ├── auth/ - Authentication API routes
    │   │   ├── channels/ - Channel management API routes
    │   │   ├── health/ - Health check API routes
    │   │   ├── messages/ - Message management API routes
    │   │   └── users/ - User management API routes
    │   ├── auth/ - Authentication pages
    │   ├── favicon.ico - Website favicon
    │   ├── globals.css - Global CSS styles
    │   ├── layout.tsx - Root layout component
    │   └── page.tsx - Main application page
    ├── components/ - Reusable UI components
    │   ├── slack/ - Slack-specific UI components
    │   ├── ui/ - Generic UI components
    │   └── providers.tsx - Context providers
    ├── hooks/ - Custom React hooks
    │   └── use-socket.ts - Socket.IO integration hook
    └── lib/ - Utility libraries and services
        ├── auth.ts - Authentication configuration
        ├── db.ts - Database client setup
        ├── socket.ts - Socket.IO server setup
        └── utils.ts - Utility functions
```