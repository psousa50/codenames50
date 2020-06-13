import { CodeNamesGame, GameConfig, GameStates, Teams } from "./models"

export type ValidationError =
  | "alreadyHasHint"
  | "alreadyRevealed"
  | "cantBeSpyMaster"
  | "gameIsAlreadyRunning"
  | "gameIsNotRunning"
  | "missingLanguage"
  | "mustBeSpyMaster"
  | "mustGuessOnce"
  | "mustHaveSpyMasters"
  | "mustHaveTwoPlayers"
  | "noHint"
  | "notPlayersTurn"
  | "playerMustHaveTeam"
  | "spyMasterAlreadySet"
  | "tooMuchGuesses"

export type GameRule = (game: CodeNamesGame) => ValidationError | undefined

export const message = (e: ValidationError) => e

const exists = (v: any) => v !== undefined && v !== null

const v = (valid: boolean, error: ValidationError) => (valid ? undefined : error)

const validIfAll = (rules: GameRule[]): GameRule => game =>
  rules.reduce((acc, rule) => acc || rule(game), undefined as ValidationError | undefined)

const validIfOneOf = (groupOfRules: GameRule[][]): GameRule => game =>
  groupOfRules.reduce(
    (acc, rules) => (acc === undefined ? undefined : validIfAll(rules)(game)),
    validIfAll(groupOfRules[0])(game),
  )

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

export const joinTeam = validIfAll([])

const configIsValid = (config: GameConfig): GameRule => _ => v(exists(config.language), "missingLanguage")

export const startGame = (config: GameConfig) =>
  validIfAll([idle, configIsValid(config), hasBothSpyMasters, hasAtleastTwoPlayesAtEachTeam])

export const setSpyMaster = (team: Teams) => validIfOneOf([[idle], [running, spyMasterIsNotSet(team)]])

export const randomizeTeams = validIfAll([idle])

export const sendHint = (userId: string) =>
  validIfAll([running, isPlayersTurn(userId), doesNotHaveHint, playerIsSpyMaster(userId)])

export const changeTurn = (userId: string) =>
  validIfAll([running, hasHint, isPlayersTurn(userId), playerIsNotSpyMaster(userId), hasAtLeastOneGuess])

export const revealWord = (userId: string, row: number, col: number) =>
  validIfAll([
    running,
    isPlayersTurn(userId),
    playerIsNotSpyMaster(userId),
    hasHint,
    hasMoreGuesses,
    wordIsNotRevealed(row, col),
  ])

export const gameRules = {
  changeTurn,
  joinTeam,
  revealWord,
  sendHint,
  setSpyMaster,
  startGame,
  randomizeTeams,
}

export type GameRules = typeof gameRules
