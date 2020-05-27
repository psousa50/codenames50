import { CodeNamesGame, GameStates, Teams } from "./models"

export type ValidationError =
  | "gameIsAlreadyRunning"
  | "gameIsNotRunning"
  | "notPlayersTurn"
  | "playerMustHaveTeam"
  | "cantBeSpyMaster"
  | "mustBeSpyMaster"
  | "spyMasterAlreadySet"
  | "mustHaveSpyMasters"
  | "mustHaveTwoPlayers"
  | "noHint"
  | "alreadyHasHint"
  | "mustGuessOnce"
  | "tooMuchGuesses"
  | "alreadyRevealed"

export type GameRule = (game: CodeNamesGame) => ValidationError | undefined

export const message = (e: ValidationError) => e

const exists = (v: any) => v !== undefined && v !== null

const v = (valid: boolean, error: ValidationError) => (valid ? undefined : error)

const validate = (rules: GameRule[]): GameRule => game =>
  rules.reduce((acc, rule) => acc || rule(game), undefined as ValidationError | undefined)

const or = (rules1: GameRule[], rules2: GameRule[]): GameRule => game => {
  const r1 = validate(rules1)(game)
  return r1 === undefined ? r1 : validate(rules2)(game)
}
const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const idle: GameRule = (game: CodeNamesGame) => v(game.state === GameStates.idle, "gameIsAlreadyRunning")

const running: GameRule = (game: CodeNamesGame) => v(game.state === GameStates.running, "gameIsNotRunning")

const hasHint: GameRule = (game: CodeNamesGame) => v(game.hintWordCount > 0, "noHint")

const doesNotHaveHint: GameRule = (game: CodeNamesGame) => v(game.hintWordCount === 0, "alreadyHasHint")

const isPlayersTurn = (userId: string): GameRule => game =>
  v(game.turn === getPlayer(game, userId)?.team, "notPlayersTurn")

const playerIsSpyMaster = (userId: string): GameRule => game =>
  v(game.redTeam.spyMaster === userId || game.blueTeam.spyMaster === userId, "mustBeSpyMaster")

const playerIsNotSpyMaster = (userId: string): GameRule => game =>
  v(game.redTeam.spyMaster !== userId && game.blueTeam.spyMaster !== userId, "cantBeSpyMaster")

const hasBothSpyMasters: GameRule = game =>
  v(exists(game.redTeam.spyMaster) && exists(game.blueTeam.spyMaster), "mustHaveSpyMasters")

const spyMasterIsNotSet = (team: Teams): GameRule => game =>
  v(
    (team === Teams.red && !exists(game.redTeam.spyMaster)) ||
      (team === Teams.blue && !exists(game.blueTeam.spyMaster)),
    "spyMasterAlreadySet",
  )

const hasAtleastTwoPlayesAtEachTeam: GameRule = game =>
  v(
    game.players.filter(p => p.team === Teams.red).length >= 2 &&
      game.players.filter(p => p.team === Teams.blue).length >= 2,
    "mustHaveTwoPlayers",
  )

const hasAtLeastOneGuess: GameRule = game => v(game.wordsRevealedCount > 0, "mustGuessOnce")

const hasMoreGuesses: GameRule = game => v(game.wordsRevealedCount < game.hintWordCount + 1, "tooMuchGuesses")

const wordIsNotRevealed = (row: number, col: number): GameRule => game =>
  v(!game.board[row][col].revealed, "alreadyRevealed")

export const joinTeam = validate([])

export const startGame = validate([idle, hasBothSpyMasters, hasAtleastTwoPlayesAtEachTeam])

export const setSpyMaster = (team: Teams) => or([idle], [running, spyMasterIsNotSet(team)])

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
