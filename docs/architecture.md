# Architecture (v0.1.0)

This document provides a high-level overview of the Dwindle application's system architecture.

## Overview

Dwindle is a real-time messaging application built with a modern tech stack that combines Next.js for the frontend, Prisma for database access, and Socket.IO for real-time communication. The application follows a client-server architecture with a monolithic backend that serves both the web frontend and API endpoints.

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    React/Next.js Frontend                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │ │
│  │  │   UI State  │  │   Hooks     │  │  Socket.IO Client       │  │ │
│  │  │  Management │  │ (useSocket) │  │  (Real-time Events)     │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────────────┘
                      │ HTTP/HTTPS & Socket.IO (WebSocket)
                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Server (Node.js)                           │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Next.js Custom Server                      │ │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │ │
│  │  │  Next.js Router  │  │  Socket.IO       │  │   API Routes  │  │ │
│  │  │  (Pages/API)     │  │  (Real-time)     │  │  (REST API)   │  │ │
│  │  └──────────────────┘  └──────────────────┘  └───────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                              │         │                          │
│                              ▼         ▼                          │
│                   ┌─────────────────┐  │                           │
│                   │   Prisma ORM    │  │                           │
│                   │ (Data Access)   │  │                           │
│                   └─────────────────┘  │                           │
│                              │         │                           │
│                              ▼         ▼                           │
│                    ┌────────────────────────────┐                   │
│                    │      SQLite Database       │                   │
│                    │     (File-based)           │                   │
│                    └────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Frontend

### Framework
- **Next.js 15**: React-based framework for building server-side rendered applications
- **React 19**: UI library for component-based development
- **TypeScript**: Type-safe JavaScript development

### UI Components
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/ui**: Reusable component library built on Tailwind CSS
- **Framer Motion**: Animation library for enhanced UX

### State Management
- **React Hooks**: Built-in state management for component-level state
- **Zustand**: Lightweight state management library for global state
- **React Query**: Server state management for API data

### Real-time Communication
- **Socket.IO Client**: Real-time event-based communication with server

## Backend/API

### Server
- **Custom Next.js Server**: Standalone server that handles both Next.js pages and Socket.IO
- **Socket.IO**: Real-time bidirectional event-based communication
- **NextAuth.js**: Authentication solution for Next.js applications

### API Architecture
- **Next.js API Routes**: File-based API routing system
- **RESTful API**: HTTP-based API for CRUD operations
- **Authentication Middleware**: Session-based authentication

### Data Access
- **Prisma ORM**: Type-safe database client for TypeScript and Node.js
- **Prisma Client**: Auto-generated query builder based on schema
- **SQLite**: File-based relational database

### Real-time Communication
- **Socket.IO Server**: Real-time event-based communication with clients

## Database

### Database Engine
- **SQLite**: Lightweight, file-based relational database

### Schema Management
- **Prisma Schema**: Declarative schema definition
- **Prisma Migrate**: Database migration tool

### Data Models
- **User**: User accounts and profiles
- **Channel**: Communication channels
- **Message**: Messages sent in channels
- **Membership**: User-channel relationships
- **Reaction**: Emoji reactions to messages

## Key Architectural Decisions

1. **Monolithic Architecture**: Chose a monolithic approach for simplicity and ease of deployment, with all functionality in a single codebase.

2. **Next.js Standalone Server**: Implemented a custom Next.js server to integrate Socket.IO directly, enabling real-time communication alongside traditional HTTP requests.

3. **File-based Routing**: Leveraged Next.js's file-based routing for both pages and API endpoints to simplify route management.

4. **SQLite Database**: Selected SQLite for local development and simplicity, with the option to migrate to PostgreSQL or MySQL for production.

5. **Socket.IO Integration**: Integrated Socket.IO for real-time features like instant messaging, typing indicators, and presence updates.

6. **Prisma ORM**: Used Prisma for type-safe database access with automatic migrations and query generation.

7. **Credential Authentication**: Implemented a simple credential-based authentication system for quick onboarding.

## Communication Flow

1. **Page Requests**: Client requests pages through Next.js router, server renders pages and sends HTML/CSS/JS

2. **API Calls**: Client makes REST API calls to Next.js API routes for data operations (users, channels, messages)

3. **Real-time Events**: Client and server exchange real-time events through Socket.IO for instant messaging features

4. **Database Operations**: Server performs database operations through Prisma ORM for data persistence

5. **Authentication**: Client authenticates through NextAuth.js, which manages session state and protects routes