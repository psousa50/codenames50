# Frontend Architecture

## React Component Hierarchy

```mermaid
graph TB
    App[App.tsx] --> AppRouter[AppRouter.tsx]
    
    AppRouter --> CreateGame[CreateGameScreen]
    AppRouter --> JoinGame[JoinGameScreen]
    AppRouter --> PlayGame[PlayGameScreen]
    
    PlayGame --> PlayGameComponent[PlayGame Component]
    
    PlayGameComponent --> Header[Header]
    PlayGameComponent --> GameContent{Game State?}
    
    GameContent -->|idle| SetupGame[SetupGame]
    GameContent -->|running| RunningGame[RunningGame]
    GameContent -->|ended| EndedGame[EndedGame]
    
    subgraph "Setup Components"
        SetupGame --> Teams[Teams]
        SetupGame --> User[User]
        Teams --> TeamDisplay[Team Member Display]
        User --> JoinTeamButton[Join Team Button]
        User --> SpyMasterToggle[SpyMaster Toggle]
    end
    
    subgraph "Running Game Components"
        RunningGame --> Hint[Hint Display]
        RunningGame --> SendHint[Send Hint Form]
        RunningGame --> WordsBoard[Words Board]
        RunningGame --> TimeLeft[Time Left Counter]
        RunningGame --> TeamWordsLeft[Team Words Left]
        
        WordsBoard --> WordCard[Word Card]
        WordCard --> WordButton[Word Button]
    end
    
    subgraph "Header Components"
        Header --> GameInfo[Game Info]
        Header --> InviteDialog[Invite Players Dialog]
    end
    
    classDef screen fill:#e8f5e8
    classDef setup fill:#e1f5fe
    classDef running fill:#f3e5f5
    classDef header fill:#fff3e0
    
    class CreateGame,JoinGame,PlayGame screen
    class SetupGame,Teams,User,TeamDisplay,JoinTeamButton,SpyMasterToggle setup
    class RunningGame,Hint,SendHint,WordsBoard,TimeLeft,TeamWordsLeft,WordCard,WordButton running
    class Header,GameInfo,InviteDialog header
```

## State Management Architecture

```mermaid
graph TB
    subgraph "React State Management"
        LocalState[Local Component State<br/>useState]
        GameState[Game State Hook<br/>useGameState]
        MessagingState[Messaging State<br/>usePlayGameMessaging]
    end
    
    subgraph "Custom Hooks"
        UseGameState[useGameState.ts]
        UseMessaging[usePlayGameMessaging.ts]
        UseSocket[useGameMessaging.ts]
        UseSound[usePlaySound.ts]
        UseApi[useApi.tsx]
    end
    
    subgraph "External State"
        CoreLogic[@codenames50/core<br/>Game Logic]
        SocketIO[Socket.IO Client<br/>Real-time Updates]
        LocalStorage[Browser Local Storage<br/>User Preferences]
    end
    
    LocalState --> UseGameState
    GameState --> UseGameState
    MessagingState --> UseMessaging
    
    UseGameState --> CoreLogic
    UseMessaging --> UseSocket
    UseSocket --> SocketIO
    UseSound --> LocalStorage
    UseApi --> SocketIO
    
    classDef state fill:#e8f5e8
    classDef hooks fill:#e1f5fe
    classDef external fill:#f3e5f5
    
    class LocalState,GameState,MessagingState state
    class UseGameState,UseMessaging,UseSocket,UseSound,UseApi hooks
    class CoreLogic,SocketIO,LocalStorage external
```

## Material-UI Integration

```mermaid
graph LR
    subgraph "Material-UI Theme"
        ThemeProvider[ThemeProvider]
        CustomTheme[Custom Theme]
        TeamColors[Team Color Palette]
        Typography[Typography System]
        Spacing[Spacing System]
    end
    
    subgraph "Core Components"
        Button[Button]
        Card[Card]
        Dialog[Dialog]
        Grid[Grid]
        Typography2[Typography]
        AppBar[AppBar]
        Chip[Chip]
        Avatar[Avatar]
    end
    
    subgraph "Custom Styled Components"
        TeamCard[Team Card]
        WordCard[Word Card]
        GameBoard[Game Board]
        PlayerChip[Player Chip]
        HintDisplay[Hint Display]
    end
    
    ThemeProvider --> CustomTheme
    CustomTheme --> TeamColors
    CustomTheme --> Typography
    CustomTheme --> Spacing
    
    Button --> TeamCard
    Card --> WordCard
    Grid --> GameBoard
    Chip --> PlayerChip
    Typography2 --> HintDisplay
    
    classDef theme fill:#e8f5e8
    classDef mui fill:#e1f5fe
    classDef custom fill:#f3e5f5
    
    class ThemeProvider,CustomTheme,TeamColors,Typography,Spacing theme
    class Button,Card,Dialog,Grid,Typography2,AppBar,Chip,Avatar mui
    class TeamCard,WordCard,GameBoard,PlayerChip,HintDisplay custom
```

## Custom Hooks Deep Dive

```mermaid
sequenceDiagram
    participant Component
    participant useGameState
    participant useMessaging
    participant CoreLogic
    participant SocketIO
    
    Note over Component,SocketIO: Hook Integration Flow
    
    Component->>useGameState: Access game state
    useGameState-->>Component: Current game state
    
    Component->>useGameState: Dispatch action
    useGameState->>CoreLogic: Validate + apply action
    CoreLogic-->>useGameState: Updated state
    useGameState->>useMessaging: Emit socket message
    useMessaging->>SocketIO: Send to server
    
    SocketIO->>useMessaging: Receive server update
    useMessaging->>useGameState: Update state
    useGameState-->>Component: Trigger re-render
```

## Game State Hook Implementation

```mermaid
flowchart TD
    GameStateHook[useGameState Hook] --> LocalGameState[Local Game State]
    GameStateHook --> ActionDispatcher[Action Dispatcher]
    GameStateHook --> StateValidator[State Validator]
    
    subgraph "State Management"
        LocalGameState --> CurrentGame[Current Game Object]
        LocalGameState --> LoadingState[Loading State]
        LocalGameState --> ErrorState[Error State]
    end
    
    subgraph "Action Processing"
        ActionDispatcher --> ValidateAction[Validate Action]
        ValidateAction --> ApplyAction[Apply to Core Logic]
        ApplyAction --> UpdateLocalState[Update Local State]
        UpdateLocalState --> EmitToServer[Emit to Server]
    end
    
    subgraph "State Validation"
        StateValidator --> CoreRules[Core Game Rules]
        StateValidator --> TypeChecking[TypeScript Validation]
        StateValidator --> BusinessLogic[Business Logic Validation]
    end
    
    EmitToServer --> MessagingHook[useMessaging Hook]
    MessagingHook --> SocketEmit[Socket.emit]
```

## Messaging Hook Implementation

```mermaid
graph TB
    MessagingHook[usePlayGameMessaging] --> SocketConnection[Socket.IO Connection]
    MessagingHook --> MessageHandlers[Message Handlers]
    MessagingHook --> SoundEffects[Sound Effects]
    
    subgraph "Outgoing Messages"
        EmitRevealWord[emitRevealWord]
        EmitSendHint[emitSendHint]
        EmitJoinTeam[emitJoinTeam]
        EmitStartGame[emitStartGame]
    end
    
    subgraph "Incoming Messages"
        OnWordRevealed[onWordRevealed]
        OnHintSent[onHintSent]
        OnGameUpdated[onGameUpdated]
        OnPlayerJoined[onPlayerJoined]
    end
    
    subgraph "Sound Integration"
        PlaySuccess[Play Success Sound]
        PlayFailure[Play Failure Sound]
        PlayAssassin[Play Assassin Sound]
        PlayTick[Play Tick Sound]
    end
    
    MessageHandlers --> EmitRevealWord
    MessageHandlers --> EmitSendHint
    MessageHandlers --> EmitJoinTeam
    MessageHandlers --> EmitStartGame
    
    MessageHandlers --> OnWordRevealed
    MessageHandlers --> OnHintSent
    MessageHandlers --> OnGameUpdated
    MessageHandlers --> OnPlayerJoined
    
    OnWordRevealed --> PlaySuccess
    OnWordRevealed --> PlayFailure
    OnWordRevealed --> PlayAssassin
    SoundEffects --> PlayTick
```

## Component Communication Patterns

```mermaid
sequenceDiagram
    participant WordCard
    participant PlayGame
    participant useGameState
    participant useMessaging
    participant Server
    
    Note over WordCard,Server: Word Reveal Flow
    
    WordCard->>PlayGame: onClick(row, col)
    PlayGame->>useGameState: revealWord(row, col)
    
    Note over useGameState: Optimistic Update
    useGameState->>useGameState: Update local state
    useGameState->>PlayGame: Trigger re-render
    useGameState->>useMessaging: Emit socket message
    
    useMessaging->>Server: revealWord message
    Server-->>useMessaging: wordRevealed response
    useMessaging->>useGameState: Update from server
    useGameState->>PlayGame: Final state update
```

## Responsive Design Strategy

```mermaid
graph TB
    subgraph "Breakpoint System"
        Mobile[Mobile: xs (0-599px)]
        Tablet[Tablet: sm (600-959px)]
        Desktop[Desktop: md+ (960px+)]
    end
    
    subgraph "Layout Adaptations"
        MobileLayout[Mobile Layout<br/>- Single column<br/>- Stacked components<br/>- Bottom navigation]
        TabletLayout[Tablet Layout<br/>- Two columns<br/>- Side panels<br/>- Larger touch targets]
        DesktopLayout[Desktop Layout<br/>- Multi-column<br/>- Rich interactions<br/>- Hover effects]
    end
    
    subgraph "Component Variations"
        BoardMobile[Board: 3x3 grid visible]
        BoardTablet[Board: 4x4 grid visible]
        BoardDesktop[Board: Full 5x5 grid]
        
        NavMobile[Nav: Bottom tabs]
        NavTablet[Nav: Side drawer]
        NavDesktop[Nav: Top bar]
    end
    
    Mobile --> MobileLayout
    Tablet --> TabletLayout
    Desktop --> DesktopLayout
    
    MobileLayout --> BoardMobile
    TabletLayout --> BoardTablet
    DesktopLayout --> BoardDesktop
    
    MobileLayout --> NavMobile
    TabletLayout --> NavTablet
    DesktopLayout --> NavDesktop
```

## Sound System Architecture

```mermaid
graph TB
    SoundHook[usePlaySound Hook] --> SoundContext[Sound Context]
    SoundContext --> SoundFiles[Sound Files]
    SoundContext --> VolumeControl[Volume Control]
    
    subgraph "Sound Events"
        Success[Success Sound<br/>Correct word revealed]
        Failure[Failure Sound<br/>Wrong word revealed]
        Assassin[Assassin Sound<br/>Game over]
        Tick[Tick Sound<br/>UI interactions]
        HintAlert[Hint Alert<br/>New hint received]
        EndGame[End Game<br/>Game completed]
        Timeout[Timeout<br/>Turn time expired]
    end
    
    subgraph "Sound Files"
        SuccessMP3[success.mp3]
        FailureMP3[failure.mp3]
        AssassinMP3[assassin.mp3]
        TickMP3[tick.mp3]
        HintMP3[hintAlert.mp3]
        EndGameMP3[endGame.mp3]
        TimeoutMP3[timeout.mp3]
    end
    
    Success --> SuccessMP3
    Failure --> FailureMP3
    Assassin --> AssassinMP3
    Tick --> TickMP3
    HintAlert --> HintMP3
    EndGame --> EndGameMP3
    Timeout --> TimeoutMP3
    
    subgraph "Integration Points"
        GameEvents[Game State Changes]
        UserActions[User Interactions]
        ServerMessages[Server Messages]
    end
    
    GameEvents --> Success
    GameEvents --> Failure
    GameEvents --> Assassin
    UserActions --> Tick
    ServerMessages --> HintAlert
    ServerMessages --> EndGame
```

## Error Handling Strategy

```mermaid
flowchart TD
    ErrorSource[Error Source] --> ErrorType{Error Type}
    
    ErrorType -->|Network| NetworkError[Network Error Handler]
    ErrorType -->|Validation| ValidationError[Validation Error Handler]
    ErrorType -->|Game Rule| GameRuleError[Game Rule Error Handler]
    ErrorType -->|System| SystemError[System Error Handler]
    
    subgraph "Error Handling"
        NetworkError --> RetryLogic[Retry Logic]
        NetworkError --> OfflineMode[Offline Mode]
        
        ValidationError --> UserFeedback[User Feedback]
        ValidationError --> StateRevert[Revert Optimistic State]
        
        GameRuleError --> RuleMessage[Rule Violation Message]
        GameRuleError --> ActionBlock[Block Invalid Action]
        
        SystemError --> FallbackUI[Fallback UI]
        SystemError --> ErrorLogging[Error Logging]
    end
    
    subgraph "Recovery Strategies"
        RetryLogic --> AutoReconnect[Auto Reconnect]
        StateRevert --> RefreshState[Refresh from Server]
        FallbackUI --> ManualReload[Manual Reload Option]
    end
```

## Performance Optimization

```mermaid
graph TB
    subgraph "React Optimizations"
        Memoization[React.memo Components]
        UseMemo[useMemo for Expensive Calculations]
        UseCallback[useCallback for Stable References]
        LazyLoading[Lazy Loading for Routes]
    end
    
    subgraph "Bundle Optimizations"
        CodeSplitting[Code Splitting]
        TreeShaking[Tree Shaking]
        AssetOptimization[Asset Optimization]
        Compression[Gzip Compression]
    end
    
    subgraph "Runtime Optimizations"
        VirtualScrolling[Virtual Scrolling (if needed)]
        DebounceActions[Debounce User Actions]
        LocalCaching[Local State Caching]
        PreloadAssets[Preload Critical Assets]
    end
    
    Performance[Frontend Performance] --> Memoization
    Performance --> CodeSplitting
    Performance --> VirtualScrolling
    
    subgraph "Monitoring"
        WebVitals[Core Web Vitals]
        BundleAnalyzer[Bundle Analyzer]
        PerformanceAPI[Performance API]
    end
```

## Key Implementation Files

### Core Components (`packages/web/src/screens/`)
- **`PlayGameScreen.tsx`** - Main game screen container
- **`CreateGameScreen.tsx`** - Game creation flow
- **`JoinGameScreen.tsx`** - Game joining interface

### Game Components (`packages/web/src/screens/PlayGame/components/`)
- **`WordsBoard.tsx`** - Main game board with word cards
- **`Teams.tsx`** - Team management and display
- **`SendHint.tsx`** - SpyMaster hint input form
- **`Header.tsx`** - Game information and controls

### Custom Hooks (`packages/web/src/utils/`)
- **`useGameState.ts`** - Game state management hook
- **`usePlayGameMessaging.ts`** - WebSocket messaging integration
- **`usePlaySound.ts`** - Sound effects management
- **`useApi.tsx`** - HTTP API communication

### Utilities (`packages/web/src/utils/`)
- **`styles.ts`** - Shared styling utilities
- **`actions.ts`** - Action helper functions
- **`types.ts`** - TypeScript type definitions

This frontend architecture provides a responsive, real-time multiplayer game interface with comprehensive state management, error handling, and performance optimization.