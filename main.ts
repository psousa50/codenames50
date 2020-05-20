import * as R from "ramda"
import { update2dCell } from "../utils/collections"
import { shuffle } from "../utils/random"
import { BoardWord, CodeNamesGame, GameStates, Teams, WordsBoard, WordType } from "./models"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

export const createGame = (gameId: string, userId: string, timestamp: string, board: WordsBoard): CodeNamesGame => ({
  gameId,
  timestamp,
  userId,
  players: [{ userId, team: undefined }],
  blueSpyMaster: undefined,
  redSpyMaster: undefined,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
  state: GameStates.idle,
  turn: undefined,
  board,
})

export const buildBoard = (boardWidth: number, boardHeight: number, words: string[]): WordsBoard => {
  const numberOfWords = boardWidth * boardHeight
  const numberOfWordsForTeams = Math.max(0, Math.floor((numberOfWords - 1) / 3))
  const numberOfWordsForInocents = Math.max(numberOfWords - 1 - numberOfWordsForTeams * 2, 0)
  const types = [
    ...new Array(numberOfWordsForTeams).fill(WordType.red),
    ...new Array(numberOfWordsForTeams).fill(WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(WordType.inocent),
    WordType.assassin,
  ]
  const wordTypes = shuffle(words).map((word, i) => ({ word, type: types[i], revealed: false }))

  return R.range(0, boardHeight).map(r => wordTypes.slice(r * boardWidth, r * boardWidth + boardWidth))
}

export const addPlayer = (userId: string): GameAction => game =>
  game.players.find(p => p.userId === userId)
    ? game
    : {
        ...game,
        players: [...game.players, { userId, team: undefined }],
      }

export const joinTeam = (userId: string, team: Teams): GameAction => game => {
  const player = getPlayer(game, userId)
  return player
    ? {
        ...game,
        players: game.players.map(p => (p.userId === userId ? { ...p, team } : p)),
      }
    : game
}

export const setSpyMaster = (userId: string): GameAction => game => {
  const p = getPlayer(game, userId)
  return p && p.team
    ? {
        ...game,
        redSpyMaster: p.team === Teams.red ? p.userId : game.redSpyMaster,
        blueSpyMaster: p.team === Teams.blue ? p.userId : game.blueSpyMaster,
      }
    : game
}

export const startGame: GameAction = game => ({
  ...game,
  state: GameStates.running,
  turn: Teams.red,
})

export const sendHint = (hintWord: string, hintWordCount: number): GameAction => game => ({
  ...game,
  hintWord,
  hintWordCount,
  wordsRevealedCount: 0,
})

const reveal = (w: BoardWord) => ({ ...w, revealed: true })
export const revealWord = (row: number, col: number) => (game: CodeNamesGame) => ({
  ...game,
  board: update2dCell(game.board)(reveal, row, col),
})

export const changeTurn = (game: CodeNamesGame) => ({
  ...game,
  turn: game.turn === Teams.blue ? Teams.red : Teams.blue,
})

export const gameActions = {
  createGame,
  buildBoard,
  addPlayer,
  joinTeam,
  setSpyMaster,
  startGame,
  sendHint,
  revealWord,
  changeTurn,
}

export type GameActions = typeof gameActions
