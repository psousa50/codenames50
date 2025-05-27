# Codenames50 Technical Documentation

This directory contains comprehensive technical documentation for the Codenames50 codebase.

## Documentation Structure

- **[Architecture Overview](./architecture.md)** - High-level system architecture and design patterns
- **[Game Logic Deep Dive](./game-logic.md)** - Core game mechanics and state management
- **[Real-time Communication](./realtime.md)** - Socket.IO implementation and message flows
- **[Database Design](./database.md)** - MongoDB schema and data persistence patterns
- **[Frontend Architecture](./frontend.md)** - React components and state management
- **[Development Guide](./development.md)** - Build pipeline, testing, and deployment

## Quick Reference

### Key Packages
- `@codenames50/core` - Pure game logic and business rules
- `@codenames50/server` - Express.js API + Socket.IO server
- `@codenames50/web` - React frontend with Material-UI
- `@codenames50/messaging` - WebSocket message definitions
- `@codenames50/shared` - Shared utilities

### Essential Commands
```bash
# Development
./scripts/start-server-dev.sh  # Start server (port 5000)
./scripts/start-web-dev.sh     # Start web app (port 4000)

# Building
yarn build                     # Build all packages
yarn test                      # Run all tests
yarn lint                      # Code quality checks
```

## Architecture at a Glance

The project follows clean architecture principles with functional programming patterns, using TypeScript throughout for type safety and Express.js + Socket.IO for real-time multiplayer functionality.