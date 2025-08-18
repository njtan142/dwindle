# Project Structure v0.2.5

This document provides a comprehensive overview of the file and folder structure of the Dwindle project, a Slack-like real-time chat application built with Next.js 15, TypeScript, Tailwind CSS, and Socket.IO.

```
.
├── .dockerignore                   - Specifies files and directories to be ignored by Docker
├── .gitignore                      - Specifies files and directories to be ignored by Git
├── components.json                 - Configuration file for shadcn/ui components
├── eslint.config.mjs               - ESLint configuration for code linting
├── next.config.ts                  - Next.js configuration file
├── package-lock.json               - Lock file for npm dependencies
├── package.json                    - Project metadata and dependencies
├── postcss.config.mjs              - PostCSS configuration for styling
├── QWEN.md                         - Qwen Code context file
├── README.md                       - Project overview and setup instructions
├── REFACTOR.md                     - Refactoring guidelines and notes
├── server.ts                       - Custom server entry point with Socket.IO integration
├── tailwind.config.ts              - Tailwind CSS configuration
├── test-general-channel.js         - Test script for verifying general channel message persistence
├── test-results.md                 - Results of the general channel message persistence tests
├── tsconfig.json                   - TypeScript configuration
├── .gemini/                        - Gemini-related files and configurations
├── .kilocode/                      - Kilocode-related files and configurations
├── docs/                           - Project documentation
│   ├── architecture.md             - System architecture overview
│   ├── features.md                 - List of implemented features
│   ├── logic_classes.md            - Core business logic documentation
│   ├── project_structure.md        - Project structure documentation (this file)
│   ├── ui_classes.md               - UI components documentation
│   └── user_flow.md                - User journey documentation
├── prisma/                         - Prisma ORM configuration and database files
│   ├── schema.prisma               - Database schema definition
│   └── db/                         - Database files (SQLite)
├── public/                         - Static assets
└── src/                            - Source code directory
    ├── app/                        - Main application directory
    │   ├── api/                    - API routes
    │   │   ├── auth/               - Authentication API routes
    │   │   ├── channels/           - Channel management API routes
    │   │   ├── health/             - Health check API routes
    │   │   ├── messages/           - Message management API routes
    │   │   └── users/              - User management API routes
    │   ├── auth/                   - Authentication pages
    │   ├── favicon.ico             - Website favicon
    │   ├── globals.css             - Global CSS styles
    │   ├── layout.tsx              - Root layout component
    │   └── page.tsx                - Main application page
    ├── components/                 - Reusable UI components
    │   ├── slack/                  - Slack-specific UI components
    │   │   ├── channel-creator.tsx - Component for creating new channels
    │   │   ├── channels-panel.tsx  - Panel displaying available channels
    │   │   ├── chat-container.tsx  - Main chat container component
    │   │   ├── chat-header.tsx     - Header for the chat area
    │   │   ├── create-channel-dialog.tsx - Dialog for creating new channels
    │   │   ├── members-panel.tsx   - Panel displaying channel members
    │   │   ├── message-input.tsx   - Input component for sending messages
    │   │   ├── message-list.tsx    - Component for displaying message list
    │   │   ├── message.tsx         - Individual message component
    │   │   ├── quick-switcher.tsx  - Quick channel/user switching component
    │   │   └── sidebar.tsx         - Main sidebar navigation
    │   ├── ui/                     - Generic UI components from shadcn/ui
    │   └── providers.tsx           - Context providers
    ├── hooks/                      - Custom React hooks
    │   ├── use-mobile.ts           - Hook for mobile device detection
    │   ├── use-socket.ts           - Socket.IO integration hook
    │   └── use-toast.ts            - Toast notification hook
    ├── lib/                        - Utility libraries and services
    │   ├── auth.ts                 - Authentication configuration
    │   ├── channel-service.ts      - Channel-related business logic
    │   ├── db.ts                   - Database client setup
    │   ├── middleware.ts           - API middleware functions
    │   ├── socket.ts               - Socket.IO server setup
    │   ├── utils.ts                - Utility functions
    │   └── validation.ts           - Request validation schemas and helpers
    └── types/                      - TypeScript type definitions
        └── index.ts                - Centralized type definitions
```