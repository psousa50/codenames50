import { CodeNamesGame, GameStates } from "./models"

export type GameRule = (game: CodeNamesGame) => boolean

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const idle: GameRule = (game: CodeNamesGame) => game.state === GameStates.idle

const running: GameRule = (game: CodeNamesGame) => game.state === GameStates.running

const hasHint: GameRule = (game: CodeNamesGame) => game.hintWordCount > 0

const doesNotHaveHint: GameRule = (game: CodeNamesGame) => game.hintWordCount === 0

const isPlayersTurn = (userId: string): GameRule => game => game.turn === getPlayer(game, userId)?.team

const playerIsSpyMaster = (userId: string): GameRule => game =>
  game.redSpyMaster === userId || game.blueSpyMaster === userId

const playerIsNotSpyMaster = (userId: string): GameRule => game =>
  game.redSpyMaster !== userId && game.blueSpyMaster !== userId

export const joinTeam: GameRule = game => idle(game)

export const startGame: GameRule = game =>
  idle(game) && game.redSpyMaster !== undefined && game.blueSpyMaster !== undefined

export const setSpyMaster = (userId: string): GameRule => game =>
  idle(game) && getPlayer(game, userId)?.team !== undefined

export const sendHint = (userId: string): GameRule => game =>
  running(game) && isPlayersTurn(userId)(game) && doesNotHaveHint(game) && playerIsSpyMaster(userId)(game)

export const changeTurn = (userId: string): GameRule => game =>
  running(game) &&
  hasHint(game) &&
  isPlayersTurn(userId)(game) &&
  playerIsNotSpyMaster(userId)(game) &&
  game.wordsRevealedCount > 0

export const revealWord = (row: number, col: number, userId: string): GameRule => game =>
  running(game) &&
  isPlayersTurn(userId)(game) &&
  playerIsNotSpyMaster(userId)(game) &&
  game.wordsRevealedCount < game.hintWordCount + 1 &&
  !game.board[row][col].revealed

export const gameRules = {
  joinTeam,
  startGame,
  setSpyMaster,
  sendHint,
  changeTurn,
  revealWord,
}

export type GameRules = typeof gameRules
