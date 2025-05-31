# Game Logic Deep Dive

## Game State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: createGame()
    
    Idle --> Running: startGame()
    Idle --> Idle: addPlayer(), joinTeam(), setSpyMaster()
    
    Running --> SpyMasterTurn: Start turn
    Running --> TeamMemberTurn: Hint given
    Running --> Ended: Win/Loss condition
    
    SpyMasterTurn --> TeamMemberTurn: sendHint()
    TeamMemberTurn --> SpyMasterTurn: Turn ends
    TeamMemberTurn --> Ended: Game over condition
    
    Ended --> Idle: restartGame()
    Ended --> [*]: Game destroyed
    
    note right of SpyMasterTurn
        - Send hint word + count
        - No word revealing allowed
    end note
    
    note right of TeamMemberTurn
        - Reveal up to hint count + 1 words
        - Turn ends on wrong guess/assassin/voluntary
    end note
```

## Core Game Models

```mermaid
erDiagram
    CodeNamesGame ||--|| RedTeam : has
    CodeNamesGame ||--|| BlueTeam : has
    CodeNamesGame ||--o{ Player : contains
    CodeNamesGame ||--|| WordsBoard : has
    
    WordsBoard ||--o{ BoardWord : contains
    
    CodeNamesGame {
        string gameId
        number gameCreatedTime
        number gameStartedTime
        GameConfig config
        string state
        string turn
        number turnCount
        string winner
    }
    
    RedTeam {
        string spyMaster
        number wordsLeft
    }
    
    BlueTeam {
        string spyMaster
        number wordsLeft
    }
    
    Player {
        string userId
        string team
    }
    
    BoardWord {
        string word
        WordType type
        boolean revealed
    }
    
    WordType {
        RED
        BLUE
        INNOCENT
        ASSASSIN
    }
```

## Board Generation Algorithm

```mermaid
flowchart TD
    Start([Start Board Generation]) --> GetWords[Get 25 random words]
    GetWords --> CalcTeamWords[Calculate team word distribution]
    
    CalcTeamWords --> TeamCalc{Team Word Calculation}
    TeamCalc --> |Base: 8 words each| RandomBonus[Random bonus word]
    RandomBonus --> |50% chance| RedBonus[Red gets +1<br/>Red: 9, Blue: 8]
    RandomBonus --> |50% chance| BlueBonus[Blue gets +1<br/>Red: 8, Blue: 9]
    
    RedBonus --> SetCounts[Set final counts:<br/>Red: 9, Blue: 8, Innocent: 7, Assassin: 1]
    BlueBonus --> SetCounts2[Set final counts:<br/>Red: 8, Blue: 9, Innocent: 7, Assassin: 1]
    
    SetCounts --> ShuffleTypes[Shuffle word types array]
    SetCounts2 --> ShuffleTypes
    ShuffleTypes --> AssignTypes[Assign types to words]
    AssignTypes --> Create5x5[Create 5x5 board matrix]
    Create5x5 --> End([Return WordsBoard])
    
    subgraph "Word Type Distribution"
        RedWords[Red Team Words: 8-9]
        BlueWords[Blue Team Words: 8-9]
        InnocentWords[Innocent Words: 7]
        AssassinWord[Assassin Word: 1]
    end
```

## Game Actions Flow

```mermaid
flowchart TD
    Action[Game Action Request] --> Validate{Validation Rules}
    Validate -->|Invalid| Error[Return ValidationError]
    Validate -->|Valid| Transform[Apply State Transformation]
    
    Transform --> UpdateGame[Update Game State]
    UpdateGame --> Persist[Persist to Database]
    Persist --> Broadcast[Broadcast to All Clients]
    
    subgraph "Validation Rules"
        PlayerTurn[Is player's turn?]
        GameState[Valid game state?]
        ActionRules[Action-specific rules]
        
        PlayerTurn --> GameState
        GameState --> ActionRules
    end
    
    subgraph "State Transformations"
        Pure[Pure Functions]
        Immutable[Immutable Updates]
        Composition[Function Composition]
        
        Pure --> Immutable
        Immutable --> Composition
    end
```

## Turn Management Logic

```mermaid
sequenceDiagram
    participant SM as SpyMaster
    participant TM as Team Members
    participant Game as Game State
    
    Note over SM,Game: SpyMaster Phase
    SM->>Game: sendHint(word, count)
    Game->>Game: Validate hint
    Game->>TM: Notify hint available
    
    Note over TM,Game: Team Member Phase
    loop Until turn ends
        TM->>Game: revealWord(row, col)
        Game->>Game: Check word type
        
        alt Own team word
            Game->>TM: Continue (if guesses left)
        else Innocent word
            Game->>Game: End turn
        else Enemy team word
            Game->>Game: End turn + help opponents
        else Assassin word
            Game->>Game: Game over - team loses
        end
    end
    
    Game->>Game: Switch to other team
```

## Win Condition Logic

```mermaid
flowchart TD
    WordRevealed[Word Revealed] --> CheckType{Word Type?}
    
    CheckType -->|Assassin| AssassinLoss[Revealing team loses immediately]
    CheckType -->|Own Team| CheckAllRevealed{All team words revealed?}
    CheckType -->|Enemy Team| SwitchTurn[End turn, switch teams]
    CheckType -->|Innocent| SwitchTurn
    
    CheckAllRevealed -->|Yes| TeamWins[Team wins!]
    CheckAllRevealed -->|No| ContinueTurn[Continue turn if guesses left]
    
    ContinueTurn --> CheckGuessesLeft{Guesses remaining?}
    CheckGuessesLeft -->|Yes| WaitForNextGuess[Wait for next word reveal]
    CheckGuessesLeft -->|No| SwitchTurn
    
    WaitForNextGuess --> WordRevealed
    
    AssassinLoss --> GameEnds[Game State: ENDED]
    TeamWins --> GameEnds
    SwitchTurn --> NextTeamTurn[Other team's turn]
```

## Validation System Architecture

```mermaid
graph TB
    ActionRequest[Action Request] --> RuleComposer[Rule Composer]
    
    RuleComposer --> |Combines| AllRules[All Applicable Rules]
    
    subgraph "Rule Types"
        GameRules[Game State Rules]
        PlayerRules[Player Rules] 
        TurnRules[Turn Rules]
        ActionRules[Action-Specific Rules]
    end
    
    AllRules --> GameRules
    AllRules --> PlayerRules
    AllRules --> TurnRules
    AllRules --> ActionRules
    
    subgraph "Example Rules"
        IsPlayersTurn[isPlayersTurn]
        GameRunning[gameIsRunning]
        HasHint[hasHint]
        WordNotRevealed[wordIsNotRevealed]
    end
    
    RuleComposer --> ValidationResult{All Rules Pass?}
    ValidationResult -->|Yes| Success[Action Allowed]
    ValidationResult -->|No| FailureReason[Specific Error Message]
    
    classDef rule fill:#e1f5fe
    class GameRules,PlayerRules,TurnRules,ActionRules,IsPlayersTurn,GameRunning,HasHint,WordNotRevealed rule
```

## Core Function Composition

```mermaid
graph LR
    Input[Game State] --> Validation[Rule Validation]
    Validation --> |Valid| Action[Action Function]
    Validation --> |Invalid| Error[ValidationError]
    
    Action --> Transform[State Transformation]
    Transform --> Output[New Game State]
    
    subgraph "Functional Composition"
        A[Action A] --> B[Action B] 
        B --> C[Action C]
        C --> Result[Composed Result]
        
        Note1[Pure Functions]
        Note2[Immutable Data]
        Note3[Function Composition]
    end
    
    subgraph "Example: revealWord"
        ValidatePlayer[Validate Player Turn]
        ValidateGame[Validate Game State]
        ValidateWord[Validate Word Selection]
        UpdateBoard[Update Board State]
        CheckWin[Check Win Conditions]
        UpdateTurn[Update Turn State]
        
        ValidatePlayer --> ValidateGame
        ValidateGame --> ValidateWord
        ValidateWord --> UpdateBoard
        UpdateBoard --> CheckWin
        CheckWin --> UpdateTurn
    end
```

## Key Implementation Files

### `models.ts` - Type Definitions

- `CodeNamesGame`: Main game state interface
- `WordsBoard`: 2D array of `BoardWord` objects
- `GameStates`: Enum for game lifecycle
- `WordType`: Enum for word categories

### `actions.ts` - State Transformations

- Pure functions for all game state changes
- Ramda-based immutable updates
- Function composition for complex operations

### `rules.ts` - Validation Logic

- Composable validation functions
- Type-safe error messages
- Context-aware rule checking

### `ports.ts` - Public API

- Main entry points for game operations
- Integration between actions and rules
- Clean interface for external packages

## Game Variants

### Standard Codenames

The classic game where teams compete to identify their words first while avoiding the assassin.

### Interception Variant

A new game variant that adds interception mechanics and scoring:

```mermaid
flowchart TD
    StandardGame[Standard Codenames Rules] --> InterceptionLayer[+ Interception Mechanics]
    
    InterceptionLayer --> Scoring[Scoring System]
    InterceptionLayer --> Intercepts[Interception Actions]
    InterceptionLayer --> SoundEffects[Sound Effects]
    
    subgraph "Interception Mechanics"
        InterceptAction[Intercept Opponent Move]
        StealPoints[Steal Points]
        AssassinReveal[Assassin Reveal Interception]
        TimingBonus[Timing-based Bonuses]
    end
    
    subgraph "Scoring System"
        TeamPoints[Team Points]
        IndividualScore[Individual Player Scores]
        InterceptionBonus[Interception Bonuses]
        GameEndBonus[Game Completion Bonuses]
    end
    
    Intercepts --> InterceptAction
    Intercepts --> StealPoints
    Intercepts --> AssassinReveal
    Intercepts --> TimingBonus
    
    Scoring --> TeamPoints
    Scoring --> IndividualScore
    Scoring --> InterceptionBonus
    Scoring --> GameEndBonus
```

#### Interception Rules

1. **Intercept Moves**: Players can intercept opponent team actions under certain conditions
2. **Score System**: Points awarded for successful interceptions and game completion
3. **Sound Feedback**: Audio cues for interception events (steal sound effect)
4. **Enhanced Strategy**: Adds tactical depth to the standard game