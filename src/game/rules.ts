import { CodeNamesGame, GameStates } from "./models"

export type ValidationError =
  | "gameIsAlreadyRunning"
  | "gameIsNotRunning"
  | "notPlayersTurn"
  | "playerMustHaveTeam"
  | "cantBeSpyMaster"
  | "mustBeSpyMaster"
  | "mustHaveSpyMasters"
  | "noHint"
  | "alreadyHasHint"
  | "mustGuessOnce"
  | "tooMuchGuesses"
  | "alreadyRevealed"

export type GameRule = (game: CodeNamesGame) => ValidationError | undefined

export const message = (e: ValidationError) => e

const v = (valid: boolean, error: ValidationError) => (valid ? undefined : error)

const validate = (rules: GameRule[]): GameRule => game =>
  rules.reduce((acc, rule) => acc || rule(game), undefined as ValidationError | undefined)

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const idle: GameRule = (game: CodeNamesGame) => v(game.state === GameStates.idle, "gameIsAlreadyRunning")

const running: GameRule = (game: CodeNamesGame) => v(game.state === GameStates.running, "gameIsNotRunning")

const hasHint: GameRule = (game: CodeNamesGame) => v(game.hintWordCount > 0, "noHint")

const doesNotHaveHint: GameRule = (game: CodeNamesGame) => v(game.hintWordCount === 0, "alreadyHasHint")

const isPlayersTurn = (userId: string): GameRule => game =>
  v(game.turn === getPlayer(game, userId)?.team, "notPlayersTurn")

const playerHasTeam = (userId: string): GameRule => game =>
  v(getPlayer(game, userId)?.team !== undefined, "playerMustHaveTeam")

const playerIsSpyMaster = (userId: string): GameRule => game =>
  v(game.redSpyMaster === userId || game.blueSpyMaster === userId, "mustBeSpyMaster")

const playerIsNotSpyMaster = (userId: string): GameRule => game =>
  v(game.redSpyMaster !== userId && game.blueSpyMaster !== userId, "cantBeSpyMaster")

const hasBothSpyMasters: GameRule = game =>
  v(game.redSpyMaster !== undefined && game.blueSpyMaster !== undefined, "mustHaveSpyMasters")

const hasAtLeastOneGuess: GameRule = game => v(game.wordsRevealedCount > 0, "mustGuessOnce")

const hasMoreGuesses: GameRule = game => v(game.wordsRevealedCount < game.hintWordCount + 1, "tooMuchGuesses")

const wordIsNotRevealed = (row: number, col: number): GameRule => game =>
  v(!game.board[row][col].revealed, "alreadyRevealed")

export const joinTeam = validate([idle])

export const startGame = validate([idle, hasBothSpyMasters])

export const setSpyMaster = (userId: string) => validate([idle, playerHasTeam(userId)])

export const sendHint = (userId: string) =>
  validate([running, isPlayersTurn(userId), doesNotHaveHint, playerIsSpyMaster(userId)])

export const changeTurn = (userId: string) =>
  validate([running, hasHint, isPlayersTurn(userId), playerIsNotSpyMaster(userId), hasAtLeastOneGuess])

export const revealWord = (row: number, col: number, userId: string) =>
  validate([
    running,
    isPlayersTurn(userId),
    playerIsNotSpyMaster(userId),
    hasHint,
    hasMoreGuesses,
    wordIsNotRevealed(row, col),
  ])

export const gameRules = {
  joinTeam,
  startGame,
  setSpyMaster,
  sendHint,
  changeTurn,
  revealWord,
}

export type GameRules = typeof gameRules
