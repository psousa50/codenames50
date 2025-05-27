# Database Design

## MongoDB Schema Design

```mermaid
erDiagram
    GAMES {
        ObjectId _id PK
        string gameId UK "UUID"
        number gameCreatedTime "Unix timestamp"
        number gameStartedTime "Unix timestamp"
        object config "Game configuration"
        string userId "Game creator"
        array players "Player list"
        object redTeam "Red team state"
        object blueTeam "Blue team state"
        string hintWord "Current hint"
        number hintWordCount "Hint word count"
        number turnStartedTime "Turn start time"
        number wordsRevealedCount "Words revealed this turn"
        string state "Game state enum"
        string turn "Current turn team"
        number turnCount "Turn counter"
        number turnTimeoutSec "Turn timeout"
        string turnOutcome "Turn result"
        string winner "Winning team"
        array board "5x5 game board"
    }
    
    WORDS {
        ObjectId _id PK
        string language "en|pt"
        array words "Word list"
    }
    
    GAMES ||--|| WORDS : "uses words from"
```

## Game Document Structure

```mermaid
graph TB
    GameDoc[Game Document] --> Metadata[Game Metadata]
    GameDoc --> PlayerData[Player Data]
    GameDoc --> TeamData[Team Data]
    GameDoc --> TurnData[Turn Data]
    GameDoc --> BoardData[Board Data]
    
    subgraph "Metadata Fields"
        GameId[gameId: string]
        CreatedTime[gameCreatedTime: number]
        StartedTime[gameStartedTime: number]
        State[state: 'idle'|'running'|'ended']
        Config[config: GameConfig]
    end
    
    subgraph "Player Data"
        Creator[userId: string]
        PlayersList[players: Player[]]
        PlayerSchema[Player: {userId, team?}]
    end
    
    subgraph "Team Data"
        RedTeam[redTeam: TeamConfig]
        BlueTeam[blueTeam: TeamConfig]
        TeamSchema[TeamConfig: {spyMaster?, wordsLeft?}]
    end
    
    subgraph "Turn Data"
        CurrentTurn[turn: 'red'|'blue']
        TurnCount[turnCount: number]
        HintWord[hintWord: string]
        HintCount[hintWordCount: number]
        TurnStart[turnStartedTime: number]
        WordsRevealed[wordsRevealedCount: number]
        TurnTimeout[turnTimeoutSec: number]
        TurnOutcome[turnOutcome: string]
        Winner[winner: string]
    end
    
    subgraph "Board Data"
        Board[board: BoardWord[][]]
        BoardSchema[BoardWord: {word, type, revealed}]
        WordTypes[type: 'red'|'blue'|'innocent'|'assassin']
    end
```

## Repository Pattern Implementation

```mermaid
graph TB
    subgraph "Domain Layer"
        GameLogic[Game Logic]
        DomainPorts[Domain Ports]
    end
    
    subgraph "Repository Abstraction"
        GameRepo[Games Repository Interface]
        WordRepo[Words Repository Interface]
    end
    
    subgraph "MongoDB Implementation"
        MongoGameAdapter[MongoDB Games Adapter]
        MongoWordAdapter[MongoDB Words Adapter]
        MongoClient[MongoDB Client]
    end
    
    GameLogic --> DomainPorts
    DomainPorts --> GameRepo
    DomainPorts --> WordRepo
    
    GameRepo <|.. MongoGameAdapter
    WordRepo <|.. MongoWordAdapter
    
    MongoGameAdapter --> MongoClient
    MongoWordAdapter --> MongoClient
    
    classDef domain fill:#fff3e0
    classDef repo fill:#e1f5fe
    classDef impl fill:#f3e5f5
    
    class GameLogic,DomainPorts domain
    class GameRepo,WordRepo repo
    class MongoGameAdapter,MongoWordAdapter,MongoClient impl
```

## Data Access Patterns

```mermaid
sequenceDiagram
    participant Service as Domain Service
    participant Repo as Repository
    participant Adapter as MongoDB Adapter
    participant DB as MongoDB
    
    Note over Service,DB: Create Game Flow
    
    Service->>Repo: create(gameData)
    Repo->>Adapter: insertOne(document)
    Adapter->>DB: db.games.insertOne()
    DB-->>Adapter: InsertResult
    Adapter-->>Repo: Game document
    Repo-->>Service: Created game
    
    Note over Service,DB: Update Game Flow
    
    Service->>Repo: update(gameId, gameData)
    Repo->>Adapter: replaceOne(filter, document)
    Adapter->>DB: db.games.replaceOne()
    DB-->>Adapter: UpdateResult
    Adapter-->>Repo: Updated game
    Repo-->>Service: Updated game
    
    Note over Service,DB: Query Game Flow
    
    Service->>Repo: findById(gameId)
    Repo->>Adapter: findOne(filter)
    Adapter->>DB: db.games.findOne()
    DB-->>Adapter: Game document
    Adapter-->>Repo: Game or null
    Repo-->>Service: Game or not found
```

## FP-TS Integration

```mermaid
graph LR
    Input[Input Parameters] --> Reader[Reader<Dependencies>]
    Reader --> Task[Task<Database Operation>]
    Task --> Either[Either<Error, Result>]
    
    subgraph "Monad Stack: ReaderTaskEither"
        ReaderLayer[Reader: Dependency Injection]
        TaskLayer[Task: Async Operations]
        EitherLayer[Either: Error Handling]
    end
    
    Reader -.-> ReaderLayer
    Task -.-> TaskLayer
    Either -.-> EitherLayer
    
    subgraph "Example: findGame"
        FindGame[findGame(gameId)]
        Dependencies[Dependencies: {gamesRepo}]
        AsyncOp[Async DB Query]
        ErrorHandling[Success | DatabaseError]
    end
    
    FindGame --> Dependencies
    Dependencies --> AsyncOp
    AsyncOp --> ErrorHandling
```

## Database Operations

```mermaid
flowchart TD
    subgraph "Games Collection Operations"
        CreateGame[createGame: Insert new game]
        FindGame[findGame: Query by gameId]
        UpdateGame[updateGame: Replace entire document]
        DeleteGame[deleteGame: Remove game]
        ListGames[listGames: Query with filters]
    end
    
    subgraph "Words Collection Operations"
        GetWords[getWords: Fetch by language]
        CacheWords[Cache frequently used words]
    end
    
    subgraph "Error Handling"
        NotFound[GameNotFoundError]
        DuplicateKey[DuplicateGameIdError]
        ConnectionError[DatabaseConnectionError]
        ValidationError[DocumentValidationError]
    end
    
    CreateGame --> DuplicateKey
    FindGame --> NotFound
    UpdateGame --> NotFound
    DeleteGame --> NotFound
    
    CreateGame --> ConnectionError
    FindGame --> ConnectionError
    UpdateGame --> ConnectionError
    DeleteGame --> ConnectionError
    GetWords --> ConnectionError
    
    CreateGame --> ValidationError
    UpdateGame --> ValidationError
```

## Indexing Strategy

```mermaid
graph TB
    subgraph "Games Collection Indexes"
        PrimaryIndex[_id: ObjectId - Primary]
        GameIdIndex[gameId: string - Unique]
        UserIndex[userId: string - Non-unique]
        StateIndex[state: string - Non-unique]
        CreatedIndex[gameCreatedTime: number - Non-unique]
    end
    
    subgraph "Words Collection Indexes"
        WordsPrimary[_id: ObjectId - Primary]
        LanguageIndex[language: string - Unique]
    end
    
    subgraph "Query Patterns"
        FindByGameId[Find by gameId - Most common]
        FindByUser[Find games by creator]
        FindActive[Find running games]
        FindRecent[Find recent games]
        GetWordsByLang[Get words by language]
    end
    
    GameIdIndex --> FindByGameId
    UserIndex --> FindByUser
    StateIndex --> FindActive
    CreatedIndex --> FindRecent
    LanguageIndex --> GetWordsByLang
```

## Data Validation

```mermaid
flowchart TD
    Input[Incoming Data] --> SchemaValidation{Schema Valid?}
    
    SchemaValidation -->|No| SchemaError[Schema Validation Error]
    SchemaValidation -->|Yes| BusinessValidation{Business Rules Valid?}
    
    BusinessValidation -->|No| BusinessError[Business Rule Error]
    BusinessValidation -->|Yes| TypeValidation{TypeScript Types Valid?}
    
    TypeValidation -->|No| TypeError[Type Validation Error]
    TypeValidation -->|Yes| DatabaseOp[Database Operation]
    
    subgraph "Validation Layers"
        MongoDB[MongoDB Schema Validation]
        Domain[Domain Model Validation]
        TypeScript[TypeScript Compile-time Validation]
    end
    
    SchemaValidation -.-> MongoDB
    BusinessValidation -.-> Domain
    TypeValidation -.-> TypeScript
```

## Connection Management

```mermaid
graph TB
    subgraph "Development Environment"
        DevApp[Development App]
        LocalMongo[(Local MongoDB)]
        DevApp <--> LocalMongo
    end
    
    subgraph "Production Environment"
        ProdApp[Production App<br/>Heroku]
        MongoAtlas[(MongoDB Atlas<br/>Cloud)]
        ProdApp <--> MongoAtlas
    end
    
    subgraph "Connection Configuration"
        EnvVars[Environment Variables]
        ConnString[Connection String]
        ConnPool[Connection Pooling]
        Retry[Retry Logic]
        
        EnvVars --> ConnString
        ConnString --> ConnPool
        ConnPool --> Retry
    end
    
    subgraph "Testing Environment"
        TestApp[Test App]
        MemoryMongo[(MongoDB Memory Server)]
        TestApp <--> MemoryMongo
    end
```

## Data Migration Strategy

```mermaid
flowchart LR
    OldSchema[Old Schema Version] --> Migration[Migration Script]
    Migration --> NewSchema[New Schema Version]
    
    subgraph "Migration Process"
        Backup[Backup Current Data]
        Transform[Transform Documents]
        Validate[Validate New Format]
        Deploy[Deploy New Code]
        
        Backup --> Transform
        Transform --> Validate
        Validate --> Deploy
    end
    
    subgraph "Rollback Strategy"
        RevertCode[Revert Code Changes]
        RestoreData[Restore from Backup]
        FixIssues[Fix Migration Issues]
        
        RevertCode --> RestoreData
        RestoreData --> FixIssues
    end
```

## Performance Optimization

```mermaid
graph TB
    subgraph "Query Optimization"
        Indexes[Proper Indexing]
        Projection[Field Projection]
        Limit[Query Limits]
        Aggregation[Aggregation Pipeline]
    end
    
    subgraph "Connection Optimization"
        Pooling[Connection Pooling]
        KeepAlive[Keep-Alive Settings]
        Timeout[Connection Timeouts]
    end
    
    subgraph "Data Optimization"
        Compression[Document Compression]
        Denormalization[Strategic Denormalization]
        Archiving[Archive Old Games]
        Cleanup[Cleanup Abandoned Games]
    end
    
    subgraph "Monitoring"
        Metrics[Performance Metrics]
        Logging[Query Logging]
        Alerts[Performance Alerts]
    end
    
    Performance[Database Performance] --> Indexes
    Performance --> Pooling
    Performance --> Compression
    Performance --> Metrics
```

## Key Implementation Files

### Repository Interfaces (`packages/server/src/repositories/`)
- **`games.ts`** - Games repository interface and implementation
- **`words.ts`** - Words repository interface for static word lists
- **`adapters.ts`** - Repository adapter type definitions

### MongoDB Adapters (`packages/server/src/mongodb/`)
- **`games.ts`** - MongoDB-specific games operations
- **`words.ts`** - MongoDB-specific words operations  
- **`main.ts`** - Database connection and setup

### Static Data (`packages/server/src/repositories/static/`)
- **`words-en.ts`** - English word list for game boards
- **`words-pt.ts`** - Portuguese word list for game boards

This database design provides efficient storage and retrieval of game state while maintaining data integrity and supporting the real-time multiplayer requirements of the Codenames game.