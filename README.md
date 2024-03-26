# Technical Documentation for Codenames50 Codebase

## Overview

The Codenames50 codebase is structured as a monorepo containing multiple packages, including a server, core logic, web frontend, and messaging system. It utilizes TypeScript for type safety and expressiveness, and leverages several modern JavaScript tools and libraries such as React, Express, and Socket.IO for real-time communication.

### Key Components

- **Server (`@codenames50/server`)**: Handles HTTP requests and WebSocket connections.
- **Core (`@codenames50/core`)**: Contains the core game logic and models.
- **Web (`@codenames50/web`)**: The React-based frontend application.
- **Messaging (`@codenames50/messaging`)**: Manages real-time communication between clients and the server.

### Development Tools

- **Yarn Workspaces**: Used for managing dependencies across multiple packages within the monorepo.
- **Lerna**: A tool for managing JavaScript projects with multiple packages, used for running scripts across all packages.
- **TypeScript**: Provides static type checking across the codebase.
- **Jest**: Used for testing.
- **Prettier and ESLint**: Ensure code formatting and linting standards.

## Server

The server package is an Express application configured to serve HTTP requests and manage WebSocket connections for real-time communication. It connects to MongoDB for persistence and uses [dotenv](packages/server/package.json) for environment variable management.

### Key Scripts

- [start](packages/server/package.json): Runs the production server.
- [start:dev](packages/server/package.json): Runs the server in development mode with hot reloading.
- [build](packages/server/package.json): Compiles TypeScript to JavaScript.
- [test](packages/server/package.json): Runs the Jest test suite.

### Configuration

Server configuration is managed using [convict](packages/server/package.json), allowing easy management of environment-specific settings such as database URIs and server ports.

```1:35:packages/server/src/config.ts
import convict from "convict"

export interface AppConfig {
  mongodb: {
    uri: string
  }
  nodeEnv: string
  port: number
  boardWidth: number
  boardHeight: number
}

export const config = convict<AppConfig>({
  mongodb: {
    uri: {
      default: "mongodb://localhost:27017/codenames50",
      doc: "",
      env: "MONGODB_URI",
    },
  },
  nodeEnv: {
    default: "development",
    doc: "Running in an environment, or on a developer machine? Mainly used to decide log structure etc",
    env: "NODE_ENV",
    format: ["production", "development", "test"],
  },
  port: {
    default: 5000,
    doc: "",
    env: "PORT",
    format: "port",
  },
  boardWidth: 5,
  boardHeight: 5,
})
```

## Core

The core package contains the game logic, models, and utilities for the Codenames game. It defines game actions, rules, and the structure of game data.

### Key Functions

- `createGame`: Initializes a new game instance.
- `buildBoard`: Generates a game board with a set of words.

```8:60:packages/core/src/ports.ts
export type GamePort = (game: Models.CodeNamesGame) => Models.CodeNamesGame | Rules.ValidationError

export const createGame = (gameId: string, userId: string, now: number): Models.CodeNamesGame =>
  Actions.addPlayer(userId)({
    gameId,
    gameCreatedTime: now,
    gameStartedTime: undefined,
    config: {
      language: undefined,
      turnTimeoutSec: undefined,
    },
    userId,
    players: [],
    redTeam: {
      spyMaster: undefined,
      wordsLeft: undefined,
    },
    blueTeam: {
      spyMaster: undefined,
      wordsLeft: undefined,
    },
    hintWord: "",
    hintWordCount: 0,
    turnStartedTime: undefined,
    wordsRevealedCount: 0,
    state: Models.GameStates.idle,
    turn: undefined,
    turnCount: undefined,
    turnTimeoutSec: undefined,
    turnOutcome: undefined,
    winner: undefined,
    board: [],
  })

export const buildBoard = (boardWidth: number, boardHeight: number, words: string[]): Models.WordsBoard => {
  const numberOfWords = boardWidth * boardHeight
  const numberOfWordsForTeams = Math.max(0, Math.floor((numberOfWords - 1) / 3))
  const reds = numberOfWordsForTeams + (Math.random() < 0.5 ? 1 : 0)
  const blues = numberOfWordsForTeams * 2 + 1 - reds
  const numberOfWordsForInocents = Math.max(numberOfWords - 1 - reds - blues, 0)
  const types = Random.shuffle([
    ...new Array(reds).fill(Models.WordType.red),
    ...new Array(blues).fill(Models.WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(Models.WordType.inocent),
    Models.WordType.assassin,
  ])

  const boardWords = Random.shuffle(words)
    .slice(boardWidth * boardHeight)
    .map((word, i) => ({ word, type: types[i], revealed: false }))

  return R.range(0, boardHeight).map(r => boardWords.slice(r * boardWidth, r * boardWidth + boardWidth))
}
```

## Web

The web package is a React application that serves as the user interface for the Codenames game. It communicates with the server via HTTP and WebSocket to provide a real-time gaming experience.

### Key Dependencies

- `react` and `react-dom` for building the UI.
- `socket.io-client` for real-time communication with the server.
- `@material-ui/core` and related packages for UI components.

### Scripts

- `start`: Runs the app in development mode.
- `build`: Builds the app for production.

## Messaging

The messaging package facilitates real-time communication between the server and clients. It relies on `socket.io` and `socket.io-client` for WebSocket communication.

## Infrastructure and Deployment

The codebase includes scripts for building and deploying the server and web applications, as well as for setting up the infrastructure on Heroku.

### Deployment Scripts

- `build-server.sh`: Builds the server application.
- `build-web.sh`: Builds the web application.
- `codenames50-api.sh`: Script for setting up the server application on Heroku.

### Continuous Integration and Development

Pre-commit and CI scripts ensure code quality and consistency across the codebase.

- `pre-commit.sh`: Runs before each commit to ensure code quality.
- `start-server-dev.sh`: Script for running the server in development mode.

## Conclusion

The Codenames50 codebase is a comprehensive solution for running the Codenames game online, with a focus on real-time interaction, modularity, and code quality. It leverages modern JavaScript tools and practices to provide a seamless development experience and a robust application architecture.
