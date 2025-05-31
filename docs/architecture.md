# System Architecture

## High-Level Overview

```mermaid
graph TB
    Client[React Web Client<br/>Material-UI + Socket.IO]
    Server[Express.js Server<br/>Socket.IO + REST API]
    DB[(MongoDB<br/>Game State)]
    
    Client <-->|WebSocket + HTTP| Server
    Server <-->|Queries/Updates| DB
    
    subgraph "Monorepo Packages"
        Core[core<br/>Pure Game Logic]
        Messaging[messaging<br/>Message Types]
        Shared[shared<br/>Utilities]
        WebPkg[web<br/>React App]
        ServerPkg[server<br/>API Server]
    end
    
    Client -.->|Uses| WebPkg
    Server -.->|Uses| ServerPkg
    ServerPkg -->|Depends on| Core
    ServerPkg -->|Depends on| Messaging
    WebPkg -->|Depends on| Core
    WebPkg -->|Depends on| Messaging
    Core -->|Depends on| Shared
```

## Technology Stack

```mermaid
graph LR
    subgraph "Frontend"
        React[React 18.3]
        MUI[Material-UI v7]
        TS1[TypeScript 5.6]
        SocketClient[Socket.IO Client 4.7.5]
        Router[React Router v6]
        Vite[Vite Build System]
    end
    
    subgraph "Backend"
        Express[Express.js 4.17]
        SocketServer[Socket.IO 4.7.5]
        Node[Node.js 20+]
        TS2[TypeScript 5.6]
    end
    
    subgraph "Data Layer"
        MongoDB[MongoDB 6.0]
        Atlas[MongoDB Atlas<br/>Production]
    end
    
    subgraph "Build & Testing System"
        Lerna[Lerna 8.1]
        Yarn[Yarn Workspaces]
        TSProject[TS Project References]
        Vitest[Vitest Testing]
        ESLint9[ESLint v9]
    end
    
    Frontend <-->|Real-time| Backend
    Backend <-->|Persistence| Data Layer
    Build & Testing System -.->|Manages| Frontend
    Build & Testing System -.->|Manages| Backend
```

## Package Dependencies

```mermaid
graph TD
    Root[codenames50<br/>Root Workspace]
    
    Root --> Core[core<br/>Game Logic]
    Root --> Messaging[messaging<br/>Message Types]
    Root --> Shared[shared<br/>Utilities]
    Root --> Server[server<br/>Express + Socket.IO]
    Root --> Web[web<br/>React Frontend]
    
    Server --> Core
    Server --> Messaging
    Server --> Shared
    
    Web --> Core
    Web --> Messaging
    
    Core --> Shared
    
    classDef corePackage fill:#e1f5fe
    classDef serverPackage fill:#f3e5f5
    classDef webPackage fill:#e8f5e8
    classDef utilPackage fill:#fff3e0
    
    class Core corePackage
    class Server serverPackage
    class Web webPackage
    class Messaging,Shared utilPackage
```

## Clean Architecture Layers

```mermaid
graph TB
    subgraph "Web Layer (React)"
        Components[React Components]
        Hooks[Custom Hooks]
        UI[Material-UI]
    end
    
    subgraph "API Layer (Express)"
        Routes[HTTP Routes]
        Middleware[Express Middleware]
        SocketHandlers[Socket.IO Handlers]
    end
    
    subgraph "Domain Layer (Core)"
        GameLogic[Game Logic]
        Actions[Game Actions]
        Rules[Validation Rules]
        Models[Game Models]
    end
    
    subgraph "Infrastructure Layer"
        Database[MongoDB Adapters]
        Repositories[Repository Pattern]
        Config[Configuration]
    end
    
    Components --> Hooks
    Hooks --> SocketHandlers
    Routes --> SocketHandlers
    SocketHandlers --> GameLogic
    GameLogic --> Actions
    GameLogic --> Rules
    Actions --> Models
    Rules --> Models
    SocketHandlers --> Database
    Database --> Repositories
    
    classDef webLayer fill:#e8f5e8
    classDef apiLayer fill:#e1f5fe
    classDef domainLayer fill:#fff3e0
    classDef infraLayer fill:#f3e5f5
    
    class Components,Hooks,UI webLayer
    class Routes,Middleware,SocketHandlers apiLayer
    class GameLogic,Actions,Rules,Models domainLayer
    class Database,Repositories,Config infraLayer
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant React
    participant Socket
    participant Server
    participant Core
    participant DB
    
    User->>React: Click word on board
    React->>React: Local validation
    React->>Socket: Emit 'revealWord' message
    Socket->>Server: WebSocket message
    Server->>Core: Execute game logic
    Core->>Core: Validate + transform state
    Core-->>Server: Updated game state
    Server->>DB: Persist game state
    Server->>Socket: Broadcast to all clients
    Socket->>React: Receive state update
    React->>React: Update UI + play sound
    React->>User: Visual/audio feedback
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DevServer[Local Server<br/>:5000]
        DevWeb[Local Web<br/>:4000]
        DevMongo[(Local MongoDB<br/>:27017)]
        
        DevWeb <-->|WebSocket/HTTP| DevServer
        DevServer <-->|Connection| DevMongo
    end
    
    subgraph "Production"
        HerokuAPI[Heroku API<br/>codenames50-api]
        HerokuWeb[Heroku Web<br/>codenames50-web]
        Atlas[(MongoDB Atlas<br/>Cloud Database)]
        
        HerokuWeb <-->|HTTPS/WSS| HerokuAPI
        HerokuAPI <-->|Secure Connection| Atlas
    end
    
    subgraph "Build Pipeline"
        GitHub[GitHub Repository]
        Lerna[Lerna Build Process]
        Deploy[Heroku Deployment]
        
        GitHub --> Lerna
        Lerna --> Deploy
        Deploy --> HerokuAPI
        Deploy --> HerokuWeb
    end
    
    classDef dev fill:#e8f5e8
    classDef prod fill:#f3e5f5
    classDef build fill:#fff3e0
    
    class DevServer,DevWeb,DevMongo dev
    class HerokuAPI,HerokuWeb,Atlas prod
    class GitHub,Lerna,Deploy build
```

## Design Patterns Used

### 1. Hexagonal Architecture (Ports & Adapters)

- **Core** contains pure business logic
- **Ports** define interfaces for external dependencies
- **Adapters** implement infrastructure concerns

### 2. Repository Pattern

- Abstract data access behind interfaces
- MongoDB adapters implement repository interfaces
- Enables testing with in-memory implementations

### 3. Functional Programming

- **Pure functions** for game state transformations
- **Immutable data structures** using Ramda
- **Function composition** for complex operations
- **Monadic error handling** with FP-TS

### 4. Command Pattern

- Game actions as composable functions
- State transformations through command pipelines
- Undo/redo capabilities (future enhancement)

### 5. Observer Pattern

- Socket.IO for real-time state synchronization
- Event-driven architecture for game updates
- Reactive UI updates through React hooks