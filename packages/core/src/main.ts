import { Collections, Random } from "@psousa50/shared"
import * as R from "ramda"
import { BoardWord, CodeNamesGame, GameConfig, GameStates, Teams, WordsBoard, WordType } from "./models"
import { getPlayer, otherTeam } from "./helpers"

export type GameAction = (game: CodeNamesGame) => CodeNamesGame

const nullAction = (game: CodeNamesGame) => game
const conditionalAction = (v: boolean, action: GameAction) => (v ? action : nullAction)
const act = (actions: GameAction[]) => (game: CodeNamesGame) => actions.reduce((acc, action) => action(acc), game)

export const restartGame: GameAction = game => ({
  ...game,
  state: GameStates.idle,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
})

export const addPlayer = (userId: string): GameAction => game => {
  const teamRedCount = game.players.filter(p => p.team === Teams.red).length
  const teamBlueCount = game.players.filter(p => p.team === Teams.blue).length
  const team =
    game.redTeam.spyMaster === userId
      ? Teams.red
      : game.blueTeam.spyMaster === userId
      ? Teams.blue
      : teamBlueCount < teamRedCount
      ? Teams.blue
      : Teams.red

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

export const setSpyMaster = (userId: string, team: Teams): GameAction => game => ({
  ...game,
  redTeam: {
    ...game.redTeam,
    spyMaster: team === Teams.red ? userId : game.redTeam.spyMaster === userId ? undefined : game.redTeam.spyMaster,
  },
  blueTeam: {
    ...game.blueTeam,
    spyMaster: team === Teams.blue ? userId : game.blueTeam.spyMaster === userId ? undefined : game.blueTeam.spyMaster,
  },
  players: game.players.map(p => (p.userId === userId ? { ...p, team } : p)),
})

export const randomizeTeams: GameAction = game => {
  const middle = Math.floor(game.players.length / 2)
  const randomizedPlayers = Random.shuffle(game.players).map((p, i) => ({
    ...p,
    team: i < middle ? Teams.red : Teams.blue,
  }))

  return {
    ...game,
    players: randomizedPlayers,
    redTeam: {
      ...game.redTeam,
      spyMaster: undefined,
    },
    blueTeam: {
      ...game.blueTeam,
      spyMaster: undefined,
    },
  }
}

const countTypes = (board: WordsBoard, type: WordType) => R.flatten(board).filter(w => w.type === type).length

export const startGame = (config: GameConfig, board: WordsBoard, now: number): GameAction => game => {
  const redWordsLeft = countTypes(board, WordType.red)
  const blueWordsLeft = countTypes(board, WordType.blue)
  return {
    ...game,
    gameStartedTime: now,
    config,
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
    turnStartedTime: now,
    board,
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

export const revealWord = (userId: string, row: number, col: number, now: number): GameAction => game => {
  const revealedWord = game.board[row][col]
  const revealedWordTeam =
    revealedWord.type === WordType.blue ? Teams.blue : revealedWord.type === WordType.red ? Teams.red : undefined
  const playerTeam = getPlayer(game, userId)?.team
  const failedGuess = playerTeam && revealedWordTeam !== playerTeam

  const updatedGame = act([
    conditionalAction(revealedWord.type === WordType.assassin, endGame(otherTeam(playerTeam))),
    decreaseWordsLeft(revealedWordTeam),
    conditionalAction(failedGuess || game.wordsRevealedCount >= game.hintWordCount, changeTurn(now)),
    checkWin,
  ])(game)

  return {
    ...updatedGame,
    turnOutcome: revealedWord.type === WordType.assassin ? "assassin" : failedGuess ? "failure" : "success",
    board: Collections.update2dCell(updatedGame.board)(reveal, row, col),
    wordsRevealedCount: updatedGame.wordsRevealedCount + 1,
  }
}

export const changeTurn = (now: number): GameAction => game => ({
  ...game,
  turn: game.turn === Teams.blue ? Teams.red : Teams.blue,
  hintWord: "",
  hintWordCount: 0,
  wordsRevealedCount: 0,
  turnStartedTime: now,
})

const endGame = (winner: Teams | undefined): GameAction => game => ({
  ...game,
  state: GameStates.ended,
  winner,
})
