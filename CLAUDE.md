# CLAUDE.md - Codenames50 Codebase Guide

## Project Overview

**Codenames50** is a TypeScript-based implementation of the popular Codenames board game, built as a real-time multiplayer web application. The project is structured as a monorepo using Yarn Workspaces and Lerna, containing a Node.js/Express server backend, React frontend, and shared game logic packages.

## Architecture & Package Structure

### Monorepo Setup

- **Package Manager**: Yarn Workspaces + Lerna
- **Language**: TypeScript with strict configuration
- **Testing**: Jest across all packages
- **Code Quality**: ESLint + Prettier with pre-commit hooks

### Package Breakdown

#### 1. `@codenames50/core` - Game Logic Engine

- **Purpose**: Pure game logic, rules, and data models
- **Key Features**: Game creation, board generation, turn management, validation
- **Dependencies**: Ramda for functional programming, shared utilities
- **Entry Points**: `src/ports.ts` (main API), `src/models.ts` (data structures)

#### 2. `@codenames50/server` - Backend API & WebSocket Server

- **Purpose**: Express.js REST API + Socket.IO for real-time communication
- **Database**: MongoDB with convict-based configuration
- **Key Features**: Game persistence, real-time messaging, HTTP endpoints
- **Architecture**: Clean architecture with adapters, domain logic, and repositories
- **Entry Point**: `src/index.ts`

#### 3. `@codenames50/web` - React Frontend

- **Purpose**: Material-UI based web interface
- **Key Features**: Real-time game UI, sound effects, responsive design
- **State Management**: Custom hooks for game state and messaging
- **Testing**: React Testing Library + Jest
- **Build**: Create React App (CRA) with custom configuration

#### 4. `@codenames50/messaging` - WebSocket Message Definitions

- **Purpose**: Shared message types and communication protocols
- **Usage**: Type safety between client and server WebSocket communication

#### 5. `@psousa50/shared` - Common Utilities

- **Purpose**: Shared utility functions (collections, random, types)
- **Usage**: Base utilities used across all packages

## Development Workflow

### Quick Start Commands

```bash
# Install all dependencies
yarn

# Start development servers (run in separate terminals)
./scripts/start-server-dev.sh  # Server on port 5000
./scripts/start-web-dev.sh     # Web on port 4000

# Run all tests
yarn test

# Build entire project
yarn build

# Pre-commit checks (runs automatically)
./scripts/pre-commit.sh
```

### Essential Scripts

#### Root Level (`package.json`)

- `yarn build` - Build all packages via Lerna
- `yarn test` - Run all package tests
- `yarn lint` - ESLint check across packages
- `yarn clean` - Clean all build artifacts
- `yarn pretty:fix` - Format all code with Prettier

#### Server Package (`packages/server`)

- `yarn start:dev` - Development server with hot reload (nodemon + ts-node)
- `yarn start` - Production server (requires build first)
- `yarn test` - Jest tests with MongoDB Memory Server

#### Web Package (`packages/web`)

- `yarn start:dev` - Development with local server (port 4000)
- `yarn start` - Development with production API
- `yarn build` - Production build for deployment

### Development Environment Setup

1. **Node Version**: Project uses Node 14+ (check `package.json` engines if present)
2. **MongoDB**: Required for server development (use Docker or local install)
3. **Environment Variables**: Server uses convict for configuration
   - `MONGODB_URI` - Database connection string
   - `NODE_ENV` - Environment (development/production)
   - `PORT` - Server port (default: 5000)

## TypeScript Configuration

### Base Configuration (`tsconfig.base.json`)

- **Target**: ES2018 with DOM libs
- **Module System**: CommonJS
- **Strict Mode**: Enabled with additional strictness rules
- **Path Mapping**: Configured for package imports
  - `@codenames50/core/*` → `./packages/core/src/*`
  - `@codenames50/messaging/*` → `./packages/messaging/src/*`
  - `@psousa50/shared/*` → `./packages/shared/src/*`

### Package-Specific Configs
Each package extends the base config with package-specific settings. The configuration supports:

- **Project References**: For incremental builds
- **Declaration Files**: For type definitions
- **Source Maps**: For debugging

## Build & Deployment

### Build Process

1. **Dependencies**: `yarn` installs all workspace dependencies
2. **Clean**: Remove previous build artifacts
3. **Compile**: TypeScript compilation with project references
4. **Test**: Run test suites for validation
5. **Bundle**: Create distribution packages

### Production Deployment (Heroku)

- **API Server**: Deployed as `codenames50-api` with MongoDB Atlas
- **Web App**: Static build deployed separately
- **Configuration**: Uses Heroku buildpacks with multi-Procfile support

### Infrastructure Scripts (`/infra/`)

- `codenames50-api.sh` - Heroku API server setup
- Environment variables configured for production MongoDB

## Game Architecture Deep Dive

### Core Game Logic (`@codenames50/core`)

- **Functional Programming**: Heavy use of Ramda for immutable operations
- **Game State Management**: Pure functions for state transitions
- **Board Generation**: Algorithm for word placement and team assignment
- **Validation System**: Rule-based validation for game actions

### Real-time Communication

- **Client-Server**: Socket.IO for bidirectional communication
- **Message Types**: Strongly typed message definitions in messaging package
- **State Synchronization**: Server as source of truth with client updates

### Data Flow

1. **User Action** → React Component
2. **Local Validation** → Core game rules
3. **Socket Message** → Server via messaging layer
4. **Server Processing** → Core logic + database persistence
5. **Broadcast Update** → All connected clients
6. **State Update** → React re-render

## Code Quality & Testing

### Testing Strategy

- **Unit Tests**: Jest for all packages
- **Integration Tests**: HTTP endpoint testing with supertest
- **Frontend Tests**: React Testing Library for component testing
- **Database Tests**: MongoDB Memory Server for isolated testing

### Code Standards

- **ESLint**: React + TypeScript rules with jest plugin
- **Prettier**: Consistent code formatting
- **Pre-commit Hooks**: Automated quality checks before commits
- **Type Safety**: Strict TypeScript with no implicit any

## Common Development Tasks

### Adding New Game Features

1. **Define Models**: Add types to `core/src/models.ts`
2. **Implement Logic**: Add actions to `core/src/actions.ts`
3. **Add Validation**: Update rules in `core/src/rules.ts`
4. **Server Integration**: Update handlers in `server/src/`
5. **Frontend UI**: Add React components in `web/src/screens/`
6. **Test Coverage**: Add tests for all layers

### Package Dependencies
When adding dependencies:

- **Core**: Keep minimal (only ramda + shared utilities)
- **Server**: Business logic dependencies (express, mongodb, etc.)
- **Web**: UI dependencies (react, material-ui, etc.)
- **Messaging**: Only core dependencies for type definitions

### Debugging Tips

- **Server Logs**: Use debug utilities in `server/src/utils/debug.ts`
- **Client State**: React DevTools for component state inspection
- **WebSocket**: Browser dev tools Network tab for Socket.IO messages
- **Database**: MongoDB Compass or CLI for data inspection

## Environment-Specific Notes

### Local Development

- **Parallel Development**: Run server and web simultaneously
- **Hot Reload**: Both server (nodemon) and web (CRA) support hot reload
- **Database**: Use local MongoDB or Docker container
- **Ports**: Server (5000), Web Dev (4000), Web Prod (3000)

### Production Considerations

- **Environment Variables**: Ensure all config is externalized
- **Build Optimization**: Production builds are optimized and minified
- **Error Handling**: Comprehensive error handling in server adapters
- **Monitoring**: Consider adding application monitoring

This codebase follows clean architecture principles with clear separation of concerns, making it maintainable and extensible for future development.