# Real-time Communication

## Socket.IO Message Flow

```mermaid
sequenceDiagram
    participant Client1 as Client 1
    participant Client2 as Client 2  
    participant Server as Socket.IO Server
    participant Game as Game Logic
    participant DB as Database
    
    Note over Client1,DB: Player Action Flow
    
    Client1->>Server: emit('revealWord', {gameId, row, col})
    Server->>Game: Validate & execute action
    Game-->>Server: Updated game state
    Server->>DB: Persist game state
    
    Note over Server,DB: Broadcast to All Clients
    
    Server->>Client1: emit('wordRevealed', gameState)
    Server->>Client2: emit('wordRevealed', gameState)
    
    Note over Client1,Client2: Client State Updates
    
    Client1->>Client1: Update UI + play sound
    Client2->>Client2: Update UI + play sound
```

## Message Type Hierarchy

```mermaid
graph TB
    Messages[Socket Messages] --> GameMgmt[Game Management]
    Messages --> PlayerActions[Player Actions]
    Messages --> Gameplay[Gameplay Actions]
    Messages --> System[System Messages]
    
    GameMgmt --> CreateGame[createGame]
    GameMgmt --> JoinGame[joinGame]
    GameMgmt --> StartGame[startGame]
    GameMgmt --> RestartGame[restartGame]
    
    PlayerActions --> JoinTeam[joinTeam]
    PlayerActions --> SetSpyMaster[setSpyMaster]
    PlayerActions --> RandomizeTeam[randomizeTeam]
    PlayerActions --> UpdateConfig[updateConfig]
    
    Gameplay --> SendHint[sendHint]
    Gameplay --> RevealWord[revealWord]
    Gameplay --> ChangeTurn[changeTurn]
    
    System --> Connect[connect]
    System --> Disconnect[disconnect]
    System --> Error[error]
    System --> GameState[gameState]
    
    classDef mgmt fill:#e1f5fe
    classDef player fill:#f3e5f5
    classDef game fill:#e8f5e8
    classDef sys fill:#fff3e0
    
    class GameMgmt,CreateGame,JoinGame,StartGame,RestartGame mgmt
    class PlayerActions,JoinTeam,SetSpyMaster,RandomizeTeam,UpdateConfig player
    class Gameplay,SendHint,RevealWord,ChangeTurn game
    class System,Connect,Disconnect,Error,GameState sys
```

## Client-Server Communication Patterns

```mermaid
graph TD
    subgraph "Client Side"
        UserAction[User Action] --> OptimisticUpdate[Optimistic UI Update]
        OptimisticUpdate --> EmitMessage[Emit Socket Message]
        ReceiveUpdate[Receive Server Update] --> ReconcileState[Reconcile State]
        ReconcileState --> UpdateUI[Update UI]
        ReconcileState --> PlaySound[Play Sound Effect]
    end
    
    subgraph "Server Side"
        ReceiveMessage[Receive Socket Message] --> ValidateMessage[Validate Message]
        ValidateMessage --> ExecuteLogic[Execute Game Logic]
        ExecuteLogic --> PersistState[Persist to Database]
        PersistState --> BroadcastUpdate[Broadcast to Room]
    end
    
    EmitMessage -.->|WebSocket| ReceiveMessage
    BroadcastUpdate -.->|WebSocket| ReceiveUpdate
    
    subgraph "Error Handling"
        ValidateMessage -->|Invalid| SendError[Send Error to Client]
        ExecuteLogic -->|Game Error| SendError
        SendError -.->|Error Message| HandleError[Handle Error on Client]
    end
```

## Room Management

```mermaid
graph TB
    subgraph "Socket.IO Rooms"
        Room1[Game Room: game-123]
        Room2[Game Room: game-456] 
        Room3[Game Room: game-789]
    end
    
    subgraph "Client Connections"
        Client1[Client A<br/>Socket ID: abc123]
        Client2[Client B<br/>Socket ID: def456]
        Client3[Client C<br/>Socket ID: ghi789]
        Client4[Client D<br/>Socket ID: jkl012]
    end
    
    Client1 --> Room1
    Client2 --> Room1
    Client3 --> Room2
    Client4 --> Room3
    
    subgraph "Message Broadcasting"
        Direction1[Room-specific messages<br/>to all room members]
        Direction2[Individual error messages<br/>to specific client]
    end
    
    Room1 -.->|Broadcast| Client1
    Room1 -.->|Broadcast| Client2
    Room2 -.->|Error| Client3
```

## WebSocket Event Handlers

```mermaid
flowchart TD
    SocketConnect[Socket Connection] --> JoinRoom[Join Game Room]
    JoinRoom --> RegisterHandlers[Register Event Handlers]
    
    RegisterHandlers --> GameEvents[Game Events]
    RegisterHandlers --> PlayerEvents[Player Events]
    RegisterHandlers --> SystemEvents[System Events]
    
    subgraph "Game Events"
        CreateGameHandler[createGame handler]
        StartGameHandler[startGame handler]
        RevealWordHandler[revealWord handler]
        SendHintHandler[sendHint handler]
    end
    
    subgraph "Player Events"
        JoinTeamHandler[joinTeam handler]
        SetSpyMasterHandler[setSpyMaster handler]
        UpdateConfigHandler[updateConfig handler]
    end
    
    subgraph "System Events"
        DisconnectHandler[disconnect handler]
        ErrorHandler[error handler]
        ReconnectHandler[reconnect handler]
    end
    
    CreateGameHandler --> DomainLogic[Domain Logic Layer]
    StartGameHandler --> DomainLogic
    RevealWordHandler --> DomainLogic
    SendHintHandler --> DomainLogic
    
    DomainLogic --> Database[(Database)]
    DomainLogic --> BroadcastResponse[Broadcast Response]
```

## State Synchronization Strategy

```mermaid
sequenceDiagram
    participant UI as React UI
    participant Hook as useGameState Hook
    participant Socket as Socket.IO Client
    participant Server as Socket.IO Server
    participant Logic as Game Logic
    
    Note over UI,Logic: Optimistic Update Pattern
    
    UI->>Hook: User clicks word
    Hook->>Hook: Validate action locally
    Hook->>UI: Optimistic UI update
    Hook->>Socket: Emit action message
    
    Socket->>Server: WebSocket message
    Server->>Logic: Execute action
    Logic-->>Server: Result (success/error)
    
    alt Success
        Server->>Socket: Broadcast new state
        Socket->>Hook: Receive state update
        Hook->>Hook: Reconcile with optimistic state
        Hook->>UI: Final UI update + sound
    else Error
        Server->>Socket: Send error message
        Socket->>Hook: Receive error
        Hook->>Hook: Revert optimistic state
        Hook->>UI: Show error + revert UI
    end
```

## Error Handling Patterns

```mermaid
graph TD
    MessageReceived[Message Received] --> ValidateFormat{Valid Format?}
    
    ValidateFormat -->|No| FormatError[Send Format Error]
    ValidateFormat -->|Yes| ValidateAuth{Authorized?}
    
    ValidateAuth -->|No| AuthError[Send Auth Error]
    ValidateAuth -->|Yes| ExecuteAction[Execute Game Action]
    
    ExecuteAction --> ActionResult{Action Result}
    
    ActionResult -->|Validation Error| GameError[Send Game Rule Error]
    ActionResult -->|Success| Broadcast[Broadcast Success]
    ActionResult -->|System Error| SystemError[Log Error + Send Generic Error]
    
    subgraph "Error Types"
        FormatError --> Client1[Client receives specific error]
        AuthError --> Client2[Client receives auth error]
        GameError --> Client3[Client receives game rule error]
        SystemError --> Client4[Client receives generic error]
    end
    
    subgraph "Error Recovery"
        Client1 --> ShowMessage1[Show error message]
        Client2 --> Reconnect[Attempt reconnection]
        Client3 --> RevertState[Revert optimistic state]
        Client4 --> ShowGeneric[Show generic error]
    end
```

## Message Payload Structure

```mermaid
classDiagram
    class SocketMessage {
        +string type
        +string gameId
        +string userId
        +number timestamp
        +any payload
    }
    
    class GameMessage {
        +string gameId
        +string userId
    }
    
    class RevealWordMessage {
        +number row
        +number col
    }
    
    class SendHintMessage {
        +string word
        +number count
    }
    
    class JoinTeamMessage {
        +string team
    }
    
    class UpdateConfigMessage {
        +string language
        +number turnTimeoutSec
    }
    
    SocketMessage <|-- GameMessage
    GameMessage <|-- RevealWordMessage
    GameMessage <|-- SendHintMessage
    GameMessage <|-- JoinTeamMessage
    GameMessage <|-- UpdateConfigMessage
```

## Connection Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Connecting: Client initiates connection
    
    Connecting --> Connected: Socket.IO handshake success
    Connecting --> ConnectionFailed: Network/server error
    
    Connected --> InGame: Join game room
    Connected --> Disconnected: Network interruption
    
    InGame --> InGame: Send/receive game messages
    InGame --> Disconnected: Network interruption
    InGame --> LeftGame: Leave game
    
    Disconnected --> Reconnecting: Auto-reconnect attempt
    Reconnecting --> Connected: Reconnection successful
    Reconnecting --> ConnectionFailed: Max retries exceeded
    
    LeftGame --> Connected: Can join another game
    ConnectionFailed --> [*]: Give up connection
    
    note right of InGame
        - Receive real-time game updates
        - Send player actions
        - Auto-sync game state
    end note
    
    note right of Reconnecting
        - Automatic retry with backoff
        - Restore game state on reconnect
        - Handle missed messages
    end note
```

## Performance Optimizations

```mermaid
graph TB
    subgraph "Client Optimizations"
        Debounce[Debounce rapid actions]
        LocalValidation[Local validation before emit]
        StateCache[Cache game state locally]
        OptimisticUI[Optimistic UI updates]
    end
    
    subgraph "Server Optimizations"
        RoomBased[Room-based broadcasting]
        MessageQueue[Message queuing]
        StateCompression[Compress large game states]
        RateLimit[Rate limiting per client]
    end
    
    subgraph "Network Optimizations"
        BinaryProtocol[Binary protocol for large data]
        Compression[Socket.IO compression]
        Heartbeat[Connection heartbeat]
        Reconnection[Smart reconnection logic]
    end
    
    Client[Client Performance] --> Debounce
    Client --> LocalValidation
    Client --> StateCache
    Client --> OptimisticUI
    
    Server[Server Performance] --> RoomBased
    Server --> MessageQueue
    Server --> StateCompression
    Server --> RateLimit
    
    Network[Network Performance] --> BinaryProtocol
    Network --> Compression
    Network --> Heartbeat
    Network --> Reconnection
```

## Key Implementation Files

### Client Side (`packages/web/src/utils/`)
- **`useGameMessaging.ts`** - Main WebSocket hook for game communication
- **`usePlayGameMessaging.ts`** - Specific messaging for gameplay actions
- **`socketMessaging.ts`** - Low-level Socket.IO wrapper utilities

### Server Side (`packages/server/src/sockets/`)
- **`handlers.ts`** - Socket.IO event handlers for all message types
- **`main.ts`** - Socket.IO server setup and room management
- **`adapters.ts`** - Integration between Socket.IO and domain logic

### Message Definitions (`packages/messaging/src/`)
- **`messages.ts`** - TypeScript interfaces for all message types
- **`index.ts`** - Exported message creation utilities

This real-time architecture ensures responsive gameplay with optimistic updates, comprehensive error handling, and efficient state synchronization across all connected clients.