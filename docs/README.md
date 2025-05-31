# Codenames50 Technical Documentation

This directory contains comprehensive technical documentation for the Codenames50 codebase.

## Recent Major Updates (2024)

🚀 **Modernization Complete**: The project has undergone significant modernization including:

- **Vite Build System**: Migrated from Create React App for 10x faster builds
- **Material-UI v7**: Complete UI framework upgrade with enhanced components
- **Vitest Testing**: Replaced Jest with modern testing framework
- **React Router v6**: Updated routing system
- **Socket.IO v4.7.5**: Enhanced real-time communication
- **Interception Game Variant**: New game mechanics with scoring system
- **Enhanced Audio**: Sound effects and audio feedback system

## Documentation Structure

- **[Architecture Overview](./architecture.md)** - High-level system architecture and design patterns
- **[Game Logic Deep Dive](./game-logic.md)** - Core game mechanics, variants, and state management
- **[Real-time Communication](./realtime.md)** - Socket.IO implementation and message flows
- **[Database Design](./database.md)** - MongoDB schema and data persistence patterns
- **[Frontend Architecture](./frontend.md)** - React components, Material-UI v7, and state management
- **[Development Guide](./development.md)** - Vite build pipeline, Vitest testing, and deployment

## Quick Reference

### Key Packages

- `@codenames50/core` - Pure game logic and business rules
- `@codenames50/server` - Express.js API + Socket.IO server
- `@codenames50/web` - React frontend with Material-UI v7
- `@codenames50/messaging` - WebSocket message definitions
- `@codenames50/shared` - Shared utilities

### Essential Commands

```bash
# Development
./scripts/start-server-dev.sh  # Start server (port 5000)
./scripts/start-web-dev.sh     # Start web app (port 4000) - Vite dev server

# Building
yarn build                     # Build all packages with Vite
yarn test                      # Run all tests with Vitest
yarn lint                      # Code quality checks with ESLint v9
```

## Architecture at a Glance

The project follows clean architecture principles with functional programming patterns, using TypeScript 5.6 throughout for type safety, Express.js + Socket.IO v4.7.5 for real-time multiplayer functionality, and Vite for lightning-fast development builds.