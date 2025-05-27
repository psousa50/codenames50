# Development Guide

## Build Pipeline

```mermaid
flowchart TD
    Start([Start Development]) --> Install[yarn install]
    Install --> BuildSetup[Setup Build Environment]
    
    BuildSetup --> DevBranch{Development Branch}
    DevBranch -->|Server| StartServer[./scripts/start-server-dev.sh]
    DevBranch -->|Web| StartWeb[./scripts/start-web-dev.sh]
    DevBranch -->|Both| StartBoth[Start Both Concurrently]
    
    StartServer --> ServerDev[Server Development Mode<br/>Port 5000, Hot Reload]
    StartWeb --> WebDev[Web Development Mode<br/>Port 4000, Hot Reload]
    StartBoth --> BothDev[Full Stack Development]
    
    subgraph "Development Tools"
        ServerDev --> Nodemon[Nodemon + ts-node]
        WebDev --> CRA[Create React App]
        BothDev --> TypeScriptWatch[TypeScript Watch Mode]
    end
    
    subgraph "Code Quality"
        PreCommit[Pre-commit Hooks]
        ESLint[ESLint Validation]
        Prettier[Prettier Formatting]
        TypeCheck[TypeScript Checking]
        
        PreCommit --> ESLint
        PreCommit --> Prettier
        PreCommit --> TypeCheck
    end
```

## Production Build Process

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as Git Repository
    participant CI as Build System
    participant Heroku as Heroku Platform
    participant Atlas as MongoDB Atlas
    
    Note over Dev,Atlas: Production Deployment Flow
    
    Dev->>Git: git push main
    Git->>CI: Trigger build
    CI->>CI: yarn install (all packages)
    CI->>CI: yarn build (Lerna build all)
    CI->>CI: yarn test (run test suites)
    CI->>CI: yarn lint (code quality)
    
    CI->>Heroku: Deploy to staging
    Heroku->>Heroku: heroku-postbuild script
    Heroku->>Atlas: Connect to production DB
    
    Note over CI,Heroku: Health Check & Promotion
    CI->>Heroku: Run health checks
    CI->>Heroku: Promote to production
    
    Note over Dev: Manual verification
    Dev->>Heroku: Verify deployment
```

## TypeScript Configuration Strategy

```mermaid
graph TB
    Root[tsconfig.json<br/>Root Configuration] --> Base[tsconfig.base.json<br/>Shared Settings]
    
    Base --> Packages[Package Configurations]
    
    subgraph "Package TypeScript Configs"
        CoreTS[packages/core/tsconfig.json]
        ServerTS[packages/server/tsconfig.json]
        WebTS[packages/web/tsconfig.json]
        MessagingTS[packages/messaging/tsconfig.json]
        SharedTS[packages/shared/tsconfig.json]
    end
    
    Packages --> CoreTS
    Packages --> ServerTS
    Packages --> WebTS
    Packages --> MessagingTS
    Packages --> SharedTS
    
    subgraph "Configuration Features"
        ProjectRefs[Project References<br/>Incremental Builds]
        PathMapping[Path Mapping<br/>Package Imports]
        StrictMode[Strict Mode<br/>Type Safety]
        Declaration[Declaration Files<br/>Type Exports]
    end
    
    Base --> ProjectRefs
    Base --> PathMapping
    Base --> StrictMode
    Base --> Declaration
    
    classDef config fill:#e1f5fe
    classDef feature fill:#e8f5e8
    
    class Root,Base,CoreTS,ServerTS,WebTS,MessagingTS,SharedTS config
    class ProjectRefs,PathMapping,StrictMode,Declaration feature
```

## Testing Strategy

```mermaid
graph TB
    TestStrategy[Testing Strategy] --> UnitTests[Unit Tests]
    TestStrategy --> IntegrationTests[Integration Tests]
    TestStrategy --> E2ETests[End-to-End Tests]
    
    subgraph "Unit Testing"
        CoreUnit[Core Package Tests<br/>Pure Function Testing]
        UtilsUnit[Utils Package Tests<br/>Helper Function Testing]
        ComponentUnit[React Component Tests<br/>Component Behavior]
    end
    
    subgraph "Integration Testing"
        APITests[API Endpoint Tests<br/>HTTP + WebSocket]
        DatabaseTests[Database Tests<br/>MongoDB Memory Server]
        ServiceTests[Service Layer Tests<br/>Domain Logic]
    end
    
    subgraph "E2E Testing (Manual)"
        GameFlow[Complete Game Flow]
        MultiPlayer[Multi-player Scenarios]
        ErrorHandling[Error Handling Flows]
    end
    
    UnitTests --> CoreUnit
    UnitTests --> UtilsUnit
    UnitTests --> ComponentUnit
    
    IntegrationTests --> APITests
    IntegrationTests --> DatabaseTests
    IntegrationTests --> ServiceTests
    
    E2ETests --> GameFlow
    E2ETests --> MultiPlayer
    E2ETests --> ErrorHandling
    
    subgraph "Testing Tools"
        Jest[Jest Test Runner]
        RTL[React Testing Library]
        Supertest[Supertest API Testing]
        MemoryDB[MongoDB Memory Server]
    end
    
    CoreUnit --> Jest
    ComponentUnit --> RTL
    APITests --> Supertest
    DatabaseTests --> MemoryDB
```

## Development Workflow

```mermaid
flowchart TD
    Feature[New Feature Request] --> Branch[Create Feature Branch]
    Branch --> Setup[Development Setup]
    
    Setup --> DevLoop{Development Loop}
    
    DevLoop --> Code[Write Code]
    Code --> Test[Run Tests]
    Test --> Lint[Run Linter]
    Lint --> TypeCheck[TypeScript Check]
    
    TypeCheck -->|Pass| DevLoop
    TypeCheck -->|Fail| Fix[Fix Issues]
    Fix --> DevLoop
    
    DevLoop --> Ready{Feature Ready?}
    Ready -->|No| DevLoop
    Ready -->|Yes| PreCommit[Pre-commit Hooks]
    
    PreCommit --> |Pass| Commit[Git Commit]
    PreCommit --> |Fail| Fix
    
    Commit --> Push[Push to Remote]
    Push --> PR[Create Pull Request]
    PR --> Review[Code Review]
    Review --> Merge[Merge to Main]
    
    subgraph "Pre-commit Validation"
        LintCheck[ESLint Check]
        FormatCheck[Prettier Check]
        TypeScriptCheck[TypeScript Check]
        TestsCheck[Run Tests]
    end
    
    PreCommit --> LintCheck
    PreCommit --> FormatCheck
    PreCommit --> TypeScriptCheck
    PreCommit --> TestsCheck
```

## Environment Configuration

```mermaid
graph TB
    Environments[Development Environments] --> Local[Local Development]
    Environments --> Staging[Staging Environment]
    Environments --> Production[Production Environment]
    
    subgraph "Local Development"
        LocalServer[Server: localhost:5000]
        LocalWeb[Web: localhost:4000]
        LocalMongo[MongoDB: localhost:27017]
        LocalEnv[.env files for config]
    end
    
    subgraph "Staging Environment"
        StagingServer[Staging API Server]
        StagingWeb[Staging Web App]
        StagingDB[Staging MongoDB Atlas]
        StagingEnv[Heroku Config Vars]
    end
    
    subgraph "Production Environment"
        ProdServer[Production API Server]
        ProdWeb[Production Web App]
        ProdDB[Production MongoDB Atlas]
        ProdEnv[Production Config Vars]
    end
    
    Local --> LocalServer
    Local --> LocalWeb
    Local --> LocalMongo
    Local --> LocalEnv
    
    Staging --> StagingServer
    Staging --> StagingWeb
    Staging --> StagingDB
    Staging --> StagingEnv
    
    Production --> ProdServer
    Production --> ProdWeb
    Production --> ProdDB
    Production --> ProdEnv
```

## Debugging Strategies

```mermaid
flowchart TD
    Issue[Development Issue] --> Category{Issue Category}
    
    Category -->|Frontend| FrontendDebug[Frontend Debugging]
    Category -->|Backend| BackendDebug[Backend Debugging]
    Category -->|Database| DatabaseDebug[Database Debugging]
    Category -->|Real-time| RealtimeDebug[Real-time Debugging]
    
    subgraph "Frontend Debugging"
        ReactDevTools[React Developer Tools]
        BrowserDevTools[Browser Developer Tools]
        ConsoleLogging[Console Logging]
        StateInspection[State Inspection]
    end
    
    subgraph "Backend Debugging"
        NodeInspector[Node.js Inspector]
        ServerLogging[Server Logging]
        APITesting[API Testing Tools]
        MongoLogs[MongoDB Logs]
    end
    
    subgraph "Database Debugging"
        MongoCompass[MongoDB Compass]
        QueryProfiling[Query Profiling]
        IndexAnalysis[Index Analysis]
        DataValidation[Data Validation]
    end
    
    subgraph "Real-time Debugging"
        SocketIODebug[Socket.IO Debug Mode]
        NetworkTab[Browser Network Tab]
        MessageLogging[Message Logging]
        ConnectionMonitoring[Connection Monitoring]
    end
    
    FrontendDebug --> ReactDevTools
    FrontendDebug --> BrowserDevTools
    FrontendDebug --> ConsoleLogging
    FrontendDebug --> StateInspection
    
    BackendDebug --> NodeInspector
    BackendDebug --> ServerLogging
    BackendDebug --> APITesting
    BackendDebug --> MongoLogs
    
    DatabaseDebug --> MongoCompass
    DatabaseDebug --> QueryProfiling
    DatabaseDebug --> IndexAnalysis
    DatabaseDebug --> DataValidation
    
    RealtimeDebug --> SocketIODebug
    RealtimeDebug --> NetworkTab
    RealtimeDebug --> MessageLogging
    RealtimeDebug --> ConnectionMonitoring
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Source Control"
        GitHub[GitHub Repository]
        MainBranch[Main Branch]
        FeatureBranches[Feature Branches]
    end
    
    subgraph "Build & Deploy"
        HerokuBuild[Heroku Build System]
        LernaBuild[Lerna Build Process]
        Postbuild[heroku-postbuild Script]
    end
    
    subgraph "Production Infrastructure"
        APIHeroku[Heroku API Dyno<br/>codenames50-api]
        WebHeroku[Heroku Web Dyno<br/>codenames50-web]
        MongoAtlas[MongoDB Atlas<br/>Production Database]
    end
    
    subgraph "Infrastructure Scripts"
        ServerScript[./infra/codenames50-api.sh]
        WebScript[./infra/codenames50-web.sh]
        BuildScript[./scripts/build.sh]
    end
    
    GitHub --> HerokuBuild
    HerokuBuild --> LernaBuild
    LernaBuild --> Postbuild
    Postbuild --> APIHeroku
    Postbuild --> WebHeroku
    
    APIHeroku <--> MongoAtlas
    WebHeroku <--> APIHeroku
    
    ServerScript -.-> APIHeroku
    WebScript -.-> WebHeroku
    BuildScript -.-> LernaBuild
```

## Performance Monitoring

```mermaid
graph TB
    Monitoring[Performance Monitoring] --> Frontend[Frontend Metrics]
    Monitoring --> Backend[Backend Metrics]
    Monitoring --> Database[Database Metrics]
    
    subgraph "Frontend Metrics"
        PageLoad[Page Load Times]
        ComponentRender[Component Render Times]
        BundleSize[Bundle Size Analysis]
        UserInteraction[User Interaction Latency]
    end
    
    subgraph "Backend Metrics"
        ResponseTime[API Response Times]
        ThroughputMetrics[Request Throughput]
        ErrorRates[Error Rates]
        MemoryUsage[Memory Usage]
    end
    
    subgraph "Database Metrics"
        QueryPerformance[Query Performance]
        ConnectionPool[Connection Pool Status]
        IndexEfficiency[Index Efficiency]
        DataGrowth[Data Growth Trends]
    end
    
    subgraph "Monitoring Tools"
        HerokuMetrics[Heroku Metrics Dashboard]
        MongoAtlasMetrics[MongoDB Atlas Monitoring]
        BrowserDevTools[Browser Dev Tools]
        CustomLogging[Custom Application Logging]
    end
    
    Backend --> HerokuMetrics
    Database --> MongoAtlasMetrics
    Frontend --> BrowserDevTools
    Monitoring --> CustomLogging
```

## Common Development Tasks

```mermaid
flowchart LR
    Tasks[Common Tasks] --> AddFeature[Add New Feature]
    Tasks --> FixBug[Fix Bug]
    Tasks --> UpdateDeps[Update Dependencies]
    Tasks --> RefactorCode[Refactor Code]
    
    subgraph "Add New Feature"
        FeatureSteps[1. Update core models<br/>2. Add game actions<br/>3. Update server handlers<br/>4. Create UI components<br/>5. Add tests<br/>6. Update documentation]
    end
    
    subgraph "Fix Bug"
        BugSteps[1. Reproduce issue<br/>2. Identify root cause<br/>3. Write failing test<br/>4. Implement fix<br/>5. Verify fix<br/>6. Update tests]
    end
    
    subgraph "Update Dependencies"
        DepSteps[1. Check outdated packages<br/>2. Update package.json<br/>3. Run yarn install<br/>4. Run full test suite<br/>5. Check for breaking changes<br/>6. Update documentation]
    end
    
    subgraph "Refactor Code"
        RefactorSteps[1. Identify refactor scope<br/>2. Ensure test coverage<br/>3. Make incremental changes<br/>4. Run tests continuously<br/>5. Update type definitions<br/>6. Review performance impact]
    end
    
    AddFeature --> FeatureSteps
    FixBug --> BugSteps
    UpdateDeps --> DepSteps
    RefactorCode --> RefactorSteps
```

## Development Best Practices

```mermaid
mindmap
  root((Development Best Practices))
    Code Quality
      TypeScript strict mode
      ESLint + Prettier
      Comprehensive tests
      Code reviews
    Architecture
      Clean architecture
      Functional programming
      Immutable state
      Dependency injection
    Performance
      Bundle optimization
      Lazy loading
      Efficient re-renders
      Database indexing
    Security
      Input validation
      Environment variables
      Error handling
      Data sanitization
    Maintainability
      Clear documentation
      Consistent naming
      Modular design
      Version control
```

## Key Development Commands

### Package Management
```bash
yarn install                    # Install all dependencies
yarn workspace @codenames50/server add lodash    # Add dependency to specific package
yarn workspace @codenames50/web remove old-lib  # Remove dependency
```

### Development Servers
```bash
./scripts/start-server-dev.sh   # Start server with hot reload
./scripts/start-web-dev.sh      # Start web app with dev server
yarn workspace @codenames50/server start:dev    # Alternative server start
yarn workspace @codenames50/web start:dev       # Alternative web start
```

### Building & Testing
```bash
yarn build                      # Build all packages
yarn test                       # Run all tests
yarn test:watch                 # Run tests in watch mode
yarn coverage                   # Generate test coverage
yarn lint                       # Run ESLint
yarn pretty:fix                 # Format code with Prettier
```

### Package-Specific Commands
```bash
yarn workspace @codenames50/core test           # Test core package
yarn workspace @codenames50/server build        # Build server
yarn workspace @codenames50/web start           # Start web in production mode
```

This development guide provides comprehensive information for setting up, building, testing, and deploying the Codenames50 application with best practices for maintainable code and efficient workflows.