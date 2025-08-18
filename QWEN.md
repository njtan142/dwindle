# Qwen Code Context for `dwindle`

## Project Overview

This project is a **Slack clone** built with a modern web technology stack. It's designed to be a real-time chat application with features like channels, direct messaging, user presence, and message reactions.

### Core Technologies

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (built on Radix UI)
- **Database**: [Prisma ORM](https://www.prisma.io/) with SQLite
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Real-time Communication**: [Socket.IO](https://socket.io/)

The project was scaffolded using a template optimized for AI-assisted development (Z.ai).

## Project Structure

*(Based on the detailed documentation in the `/docs` folder)*

```
.
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
│   ├── project_structure.md - Project structure documentation
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

For a full description of each file and folder, see `docs/project_structure.md`.

### Key Directories and Files

- **`src/app/page.tsx`**: The main application component that renders the Slack UI (sidebar, channels, chat area, message input).
- **`src/app/api/`**: Contains all the backend API endpoints for users, channels, and messages. These are implemented as Next.js route handlers.
- **`src/components/slack/`**: Houses the React components that make up the Slack interface (e.g., `Sidebar`, `ChannelsPanel`, `Message`, `MessageInput`).
- **`src/lib/socket.ts`**: Defines the Socket.IO server-side logic for handling real-time events (messages, typing indicators, etc.).
- **`src/hooks/use-socket.ts`**: A custom React hook on the client-side to manage the Socket.IO connection and events.
- **`server.ts`**: A custom server entry point that integrates Next.js with Socket.IO to handle both web requests and real-time communication.
- **`prisma/schema.prisma`**: The Prisma schema file defining the database models (User, Channel, Message, Membership, Reaction).

## Architecture

*(Based on `docs/architecture.md`)*

This is a client-server application with a monolithic backend:

1.  **Frontend**: Next.js/React application running in the browser. Uses React Hooks, Zustand, and React Query for state management. Communicates with the backend via HTTP/REST APIs and Socket.IO WebSockets.
2.  **Backend/API**: A custom Next.js standalone server (`server.ts`) that handles both traditional HTTP requests (serving pages and API routes) and real-time WebSocket communication via Socket.IO. API logic is implemented in Next.js API routes (`src/app/api/`).
3.  **Database**: SQLite database accessed via Prisma ORM for type-safe database operations.

For a visual representation and more details on key architectural decisions, see `docs/architecture.md`.

## Database Schema

*(Based on `docs/logic_classes.md` and `prisma/schema.prisma`)*

The database uses SQLite and is managed by Prisma. The key models are:

- **User**: Represents a user with fields like `id`, `email`, `name`, `avatar`, `online` status.
- **Channel**: Represents a chat channel with `id`, `name`, `description`, `type` (PUBLIC, PRIVATE, DIRECT_MESSAGE), `isPrivate`.
- **Message**: Represents a message with `id`, `content`, `channelId`, `userId`, `timestamp`, `editedAt`, `isEdited`.
- **Membership**: A join table linking users to channels they belong to.
- **Reaction**: Represents an emoji reaction to a message.

Relationships are defined between these models (e.g., a User has many Messages, a Channel has many Messages).

## Features

*(Based on `docs/features.md`)*

- User authentication (email/name credentials)
- Real-time messaging with Socket.IO
- Channel creation and management
- User presence display
- Typing indicators
- Persistent message history
- Responsive Slack-like UI
- RESTful API endpoints for all functionality

## User Flow

*(Based on `docs/user_flow.md`)*

1.  User accesses the app and authenticates (or creates an account).
2.  The app initializes, fetching channels, users, and establishing a Socket.IO connection.
3.  User selects a channel, and messages for that channel are loaded/displayed.
4.  User can send messages (saved via API and broadcast via Socket.IO) and sees messages from others in real-time.
5.  User can create new channels.

## Building and Running

The project uses standard Next.js commands, managed via `npm scripts` in `package.json`. A custom server (`server.ts`) is used to integrate Socket.IO.

### Key Commands

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Set up Database**:
    ```bash
    npm run db:generate # Generate Prisma client
    npm run db:push     # Push Prisma schema to the database
    ```
    *(Note: This uses SQLite, so the database file is created automatically based on the `DATABASE_URL` in `.env`)*

3.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    This uses `nodemon` to watch for file changes and restart the custom `server.ts`.

4.  **Build for Production**:
    ```bash
    npm run build
    ```

5.  **Start Production Server**:
    ```bash
    npm start
    ```
    This runs the custom `server.ts` in production mode.

### Environment Variables

- The database connection string (`DATABASE_URL`) is required, typically defined in a `.env` file (not present in the provided files but standard for Prisma).

## Development Conventions

- **TypeScript**: Used throughout for type safety.
- **Component Structure**: UI components are organized under `src/components/`, often grouped by feature (e.g., `slack/`). shadcn/ui components are in `src/components/ui/`.
- **API Routes**: Backend logic is implemented using Next.js App Router API routes under `src/app/api/`.
- **Real-time Communication**: Socket.IO is used for real-time features. Server logic is in `src/lib/socket.ts` and client-side integration in `src/hooks/use-socket.ts`.
- **Authentication**: Managed by NextAuth.js with a custom credentials provider, configured in `src/lib/auth.ts`.
- **Database Access**: Prisma Client is used for database operations, initialized in `src/lib/db.ts`.
- **Styling**: Tailwind CSS is used for styling, with component styles typically defined directly in the component files using Tailwind classes.
