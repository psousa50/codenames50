import * as R from "ramda"
import { BoardWord, CodeNamesGame, GameStates, Teams, WordsBoard, WordType } from "./models"
import { update2dCell } from "./utils/collections"
import { shuffle } from "./utils/random"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

export const createGame = (gameId: string, userId: string, timestamp: string, board: WordsBoard): CodeNamesGame => ({
  gameId,
  timestamp,
  userId,
  players: [{ userId, team: undefined }],
  redTeam: {
    spyMaster: undefined,
    wordsLeft: undefined,
  },
  blueTeam: {
    spyMaster: undefined,
    wordsLeft: undefined,
  },
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
  const types = shuffle([
    ...new Array(numberOfWordsForTeams).fill(WordType.red),
    ...new Array(numberOfWordsForTeams).fill(WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(WordType.inocent),
    WordType.assassin,
  ])

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
        blueTeam: {
          ...game.blueTeam,
          spyMaster: team === Teams.red && game.blueTeam.spyMaster === userId ? undefined : game.blueTeam.spyMaster,
        },
        redTeam: {
          ...game.redTeam,
          spyMaster: team === Teams.blue && game.redTeam.spyMaster === userId ? undefined : game.redTeam.spyMaster,
        },
      }
    : game
}

export const setSpyMaster = (userId: string): GameAction => game => {
  const p = getPlayer(game, userId)
  return p && p.team
    ? {
        ...game,
        redTeam: {
          ...game.redTeam,
          spyMaster: p.team === Teams.red ? p.userId : game.redTeam.spyMaster,
        },
        blueTeam: {
          ...game.blueTeam,
          spyMaster: p.team === Teams.blue ? p.userId : game.blueTeam.spyMaster,
        },
      }
    : game
}

const countTypes = (board: WordsBoard, type: WordType) => R.flatten(board).filter(w => w.type === type).length
export const startGame: GameAction = game => ({
  ...game,
  state: GameStates.running,
  turn: Teams.blue,
  redTeam: {
    ...game.redTeam,
    wordsLeft: countTypes(game.board, WordType.red),
  },
  blueTeam: {
    ...game.blueTeam,
    wordsLeft: countTypes(game.board, WordType.blue),
  },
})

export const sendHint = (hintWord: string, hintWordCount: number): GameAction => game => ({
  ...game,
  hintWord,
  hintWordCount,
  wordsRevealedCount: 0,
})

const decreaseWordsLeft = (userId: string): GameAction => game => {
  const team = getPlayer(game, userId)?.team
  return {
    ...game,
    blueTeam: {
      ...game.blueTeam,
      wordsLeft: (game.blueTeam.wordsLeft || 0) - (team === Teams.blue ? 1 : 0),
    },
    redTeam: {
      ...game.redTeam,
      wordsLeft: (game.redTeam.wordsLeft || 0) - (team === Teams.red ? 1 : 0),
    },
  }
}

const reveal = (w: BoardWord) => ({ ...w, revealed: true })
export const revealWord = (userId: string, row: number, col: number) => (game: CodeNamesGame) => {
  const revealedWord = game.board[row][col]
  const team = getPlayer(game, userId)?.team
  const failedGuess =
    (revealedWord.type === WordType.blue && team === Teams.red) ||
    (revealedWord.type === WordType.red && team === Teams.blue) ||
    revealedWord.type === WordType.inocent
  const updatedGame =
    failedGuess || game.wordsRevealedCount === game.hintWordCount
      ? changeTurn(game)
      : revealedWord.type === WordType.assassin
      ? endGame(game)
      : failedGuess
      ? game
      : decreaseWordsLeft(userId)(game)
  return {
    ...updatedGame,
    board: update2dCell(game.board)(reveal, row, col),
    wordsRevealedCount: game.wordsRevealedCount + 1,
  }
}

export const changeTurn = (game: CodeNamesGame) => ({
  ...game,
  turn: game.turn === Teams.blue ? Teams.red : Teams.blue,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
})

export const endGame = (game: CodeNamesGame) => ({
  ...game,
  state: GameStates.ended,
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
  endGame,
}

export type GameActions = typeof gameActions
