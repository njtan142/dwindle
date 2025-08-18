# System Architecture v0.2.5

This document provides a high-level overview of the Dwindle application's architecture, including design patterns, frameworks, and key architectural decisions.

## Overview

Dwindle is a real-time chat application built with a modern web technology stack. It follows a client-server architecture with a monolithic backend that handles both traditional HTTP requests and real-time WebSocket communication.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Client (Browser)                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        React/Next.js Frontend                        │  │
│  │  ┌──────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │  │
│  │  │  UI State    │  │  API Requests   │  │  Real-time Updates      │  │  │
│  │  │  (Zustand)   │  │  (REST/HTTP)    │  │  (Socket.IO Client)     │  │  │
│  │  └──────────────┘  └─────────────────┘  └─────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬─────────────────────────────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
               ▼                      ▼                      ▼
  ┌──────────────────────┐ ┌─────────────────────┐ ┌──────────────────────┐
  │   HTTP/REST API      │ │  Socket.IO Server   │ │   Authentication     │
  │   (Next.js Routes)   │ │   (Real-time)       │ │   (NextAuth.js)      │
  └──────────────────────┘ └─────────────────────┘ └──────────────────────┘
               │                      │                      │
               └──────────────────────┼──────────────────────┘
                                      ▼
                            ┌─────────────────────┐
                            │    Business Logic   │
                            │  (Services/Helpers) │
                            └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │     Data Access     │
                            │    (Prisma ORM)     │
                            └─────────────────────┘
                                      │
                                      ▼
                            ┌─────────────────────┐
                            │    SQLite Database  │
                            └─────────────────────┘
```

## Frontend

### Framework
- **Next.js 15**: React framework with App Router for server-side rendering and static site generation

### State Management
- **React Hooks**: Built-in state management for component-level state
- **Zustand**: Lightweight state management library for global application state

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **shadcn/ui**: Reusable component library built on Radix UI and Tailwind CSS

### Real-time Communication
- **Socket.IO Client**: JavaScript client library for real-time communication

### Authentication
- **NextAuth.js**: Authentication library with custom credentials provider

## Backend/API

### Server
- **Custom Next.js Server**: Standalone server (`server.ts`) that handles both HTTP requests and WebSocket connections

### API Routes
- **Next.js App Router API Routes**: RESTful API endpoints implemented as route handlers in `src/app/api/`

### Real-time Communication
- **Socket.IO Server**: WebSocket server for real-time messaging features

### Authentication
- **NextAuth.js**: Authentication with custom credentials provider and Prisma adapter

### Middleware
- **Custom Middleware**: Authentication and error handling middleware in `src/lib/middleware.ts`

## Database

### ORM
- **Prisma ORM**: Type-safe database toolkit with SQLite provider

### Database
- **SQLite**: Lightweight, file-based database

### Schema
- **Prisma Schema**: Defined in `prisma/schema.prisma` with models for User, Channel, Message, Membership, and Reaction

## Key Architectural Decisions

### Monolithic Architecture
The application follows a monolithic architecture where the frontend, backend API, and real-time communication are all part of a single deployable unit. This simplifies development and deployment for a small to medium-sized application.

### Custom Server Integration
A custom Next.js server (`server.ts`) is used to integrate Socket.IO with the Next.js application, allowing both traditional HTTP requests and WebSocket connections to be handled by the same server.

### Authentication Strategy
NextAuth.js with a custom credentials provider is used for authentication, allowing users to sign in with just an email and name. Prisma adapter connects NextAuth to the database.

### Real-time Communication
Socket.IO is used for real-time features like instant messaging and typing indicators. The implementation includes proper authentication middleware and event handling.

### Data Validation
Zod is used for request validation in API routes, ensuring that incoming data meets the expected schema before processing.

### Component-based UI
The UI is built with reusable components following the shadcn/ui pattern, promoting consistency and maintainability.

## Data Flow

1. **User Interaction**: User interacts with React components in the browser
2. **API Requests**: For data operations, the frontend makes HTTP requests to Next.js API routes
3. **Authentication**: Requests are authenticated using NextAuth.js middleware
4. **Business Logic**: API routes process requests using business logic services
5. **Data Access**: Prisma ORM is used to interact with the SQLite database
6. **Real-time Updates**: For immediate updates, Socket.IO is used to broadcast changes to connected clients
7. **UI Updates**: Components update based on API responses or real-time events