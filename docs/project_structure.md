# Project Structure v0.6.0

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
│   ├── api-refactor.md             - API refactoring documentation
│   ├── architecture.md             - System architecture overview
│   ├── authentication-refactor.md  - Authentication refactoring documentation
│   ├── database-refactor.md        - Database refactoring documentation
│   ├── features.md                 - List of implemented features
│   ├── hooks-refactor.md           - Hooks refactoring documentation
│   ├── logic_classes.md            - Core business logic documentation
│   ├── project_structure.md        - Project structure documentation (this file)
│   ├── refactoring_analysis.md     - Refactoring analysis documentation
│   ├── ui-component-refactor.md    - UI component refactoring documentation
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
    │   │   │   └── [id]/           - Channel-specific API routes
    │   │   │       └── members/    - Channel member management API routes
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
    │   │   ├── common/             - Common UI components
    │   │   ├── channel-creator.tsx - Component for creating new channels
    │   │   ├── channel-members-dialog.tsx - Dialog for managing channel members
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
    │   ├── api-middleware.ts       - API middleware functions
    │   ├── api-utils.ts            - API utility functions
    │   ├── api-validation.ts       - API validation schemas and helpers
    │   ├── auth-errors.ts          - Authentication error classes
    │   ├── auth.ts                 - Authentication configuration
    │   ├── channel-service.ts      - Channel-related business logic
    │   ├── db.ts                   - Database client setup
    │   ├── middleware.ts           - General middleware functions
    │   ├── socket-server.ts        - Socket.IO server setup
    │   ├── socket.ts               - Socket.IO client setup
    │   ├── utils.ts                - Utility functions
    │   └── validation.ts           - Request validation schemas and helpers
    ├── services/                   - Centralized service layer
    │   ├── database/               - Database service layer
    │   │   ├── channel-service.ts  - Channel database operations
    │   │   ├── client.ts           - Database client setup
    │   │   ├── error-handler.ts    - Database error handling
    │   │   ├── index.ts            - Database service exports
    │   │   ├── membership-service.ts - Membership database operations
    │   │   ├── message-service.ts  - Message database operations
    │   │   ├── query-builder.ts    - Database query builder
    │   │   ├── transaction.ts      - Database transaction management
    │   │   └── user-service.ts     - User database operations
    │   └── socket/                 - Socket service layer
    │       ├── index.ts            - Socket service exports
    │       ├── socket-events.ts    - Socket event handlers
    │       ├── socket-service.ts   - Socket client service
    │       └── socket-types.ts     - Socket type definitions
    └── types/                      - TypeScript type definitions
        ├── api.ts                  - API-related type definitions
        ├── auth.ts                 - Authentication-related type definitions
        ├── components.ts           - Component-related type definitions
        ├── database.ts             - Database-related type definitions
        ├── hooks.ts                - Hook-related type definitions
        └── index.ts                - Centralized type exports
```