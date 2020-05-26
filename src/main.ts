import * as R from "ramda"
import { BoardWord, CodeNamesGame, GameStates, Teams, WordsBoard, WordType } from "./models"
import { update2dCell } from "./utils/collections"
import { shuffle } from "./utils/random"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

const nullAction = (game: CodeNamesGame) => game
const conditionalAction = (v: boolean, action: GameAction) => (v ? action : nullAction)
const act = (actions: GameAction[]) => (game: CodeNamesGame) => actions.reduce((acc, action) => action(acc), game)

const getPlayer = (game: CodeNamesGame, userId: string) => game.players.find(p => p.userId === userId)

const otherTeam = (team?: Teams) => (team === Teams.red ? Teams.blue : team === Teams.blue ? Teams.red : undefined)

export const createGame = (gameId: string, userId: string, timestamp: string, board: WordsBoard): CodeNamesGame =>
  addPlayer(userId)({
    gameId,
    timestamp,
    userId,
    players: [],
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
    winner: undefined,
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

export const addPlayer = (userId: string): GameAction => game => {
  const teamRedCount = game.players.filter(p => p.team === Teams.red).length
  const teamBlueCount = game.players.filter(p => p.team === Teams.blue).length
  const team = teamBlueCount < teamRedCount ? Teams.blue : Teams.red

  return game.players.find(p => p.userId === userId)
    ? game
    : {
        ...game,
        players: [...game.players, { userId, team }],
      }
}

export const removePlayer = (userId: string): GameAction => game => {
  return {
    ...game,
    players: game.players.filter(p => p.userId !== userId),
    redTeam: {
      ...game.redTeam,
      spyMaster: game.redTeam.spyMaster === userId ? undefined : game.redTeam.spyMaster,
    },
    blueTeam: {
      ...game.blueTeam,
      spyMaster: game.blueTeam.spyMaster === userId ? undefined : game.blueTeam.spyMaster,
    },
  }
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
export const startGame: GameAction = game => {
  const redWordsLeft = countTypes(game.board, WordType.red)
  const blueWordsLeft = countTypes(game.board, WordType.blue)
  return {
    ...game,
    state: GameStates.running,
    turn: redWordsLeft > blueWordsLeft ? Teams.red : Teams.blue,
    redTeam: {
      ...game.redTeam,
      wordsLeft: redWordsLeft,
    },
    blueTeam: {
      ...game.blueTeam,
      wordsLeft: blueWordsLeft,
    },
  }
}

export const sendHint = (hintWord: string, hintWordCount: number): GameAction => game => ({
  ...game,
  hintWord,
  hintWordCount,
  wordsRevealedCount: 0,
})

const decreaseWordsLeft = (team?: Teams): GameAction => game => ({
  ...game,
  blueTeam: {
    ...game.blueTeam,
    wordsLeft: (game.blueTeam.wordsLeft || 0) - (team === Teams.blue ? 1 : 0),
  },
  redTeam: {
    ...game.redTeam,
    wordsLeft: (game.redTeam.wordsLeft || 0) - (team === Teams.red ? 1 : 0),
  },
})

const reveal = (w: BoardWord) => ({ ...w, revealed: true })
const checkWin = (game: CodeNamesGame) => ({
  ...game,
  state: game.redTeam.wordsLeft === 0 || game.blueTeam.wordsLeft === 0 ? GameStates.ended : game.state,
  winner: game.redTeam.wordsLeft === 0 ? Teams.red : game.blueTeam.wordsLeft === 0 ? Teams.blue : game.winner,
})

export const revealWord = (userId: string, row: number, col: number) => (game: CodeNamesGame) => {
  const revealedWord = game.board[row][col]
  const revealedWordTeam =
    revealedWord.type === WordType.blue ? Teams.blue : revealedWord.type === WordType.red ? Teams.red : undefined
  const playerTeam = getPlayer(game, userId)?.team
  const failedGuess = playerTeam && revealedWordTeam !== playerTeam

  const updatedGame = act([
    conditionalAction(revealedWord.type === WordType.assassin, endGame(otherTeam(playerTeam))),
    decreaseWordsLeft(revealedWordTeam),
    conditionalAction(failedGuess || game.wordsRevealedCount >= game.hintWordCount, changeTurn),
    checkWin,
  ])(game)

  return {
    ...updatedGame,
    board: update2dCell(updatedGame.board)(reveal, row, col),
    wordsRevealedCount: updatedGame.wordsRevealedCount + 1,
  }
}

export const changeTurn = (game: CodeNamesGame) => ({
  ...game,
  turn: game.turn === Teams.blue ? Teams.red : Teams.blue,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
})

export const endGame = (winner: Teams | undefined) => (game: CodeNamesGame) => ({
  ...game,
  state: GameStates.ended,
  winner,
})

export const gameActions = {
  createGame,
  buildBoard,
  addPlayer,
  removePlayer,
  joinTeam,
  setSpyMaster,
  startGame,
  sendHint,
  revealWord,
  changeTurn,
  endGame,
}

export type GameActions = typeof gameActions
