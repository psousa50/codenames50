import * as R from "ramda"
import { Random } from "@psousa50/shared"
import * as Models from "./models"
import * as Rules from "./rules"
import * as Actions from "./actions"
import { isPlayerTurn } from "./helpers"

export type GamePort = (game: Models.CodeNamesGame) => Models.CodeNamesGame | Rules.ValidationError

export const createGame = (gameId: string, userId: string, now: number): Models.CodeNamesGame =>
  Actions.addPlayer(userId)({
    gameId,
    gameCreatedTime: now,
    gameStartedTime: undefined,
    config: {
      language: undefined,
      turnTimeoutSec: undefined,
      variant: Models.GameVariant.classic,
    },
    userId,
    players: [],
    redTeam: {
      spyMaster: undefined,
      wordsLeft: undefined,
      score: 0,
    },
    blueTeam: {
      spyMaster: undefined,
      wordsLeft: undefined,
      score: 0,
    },
    hintWord: "",
    hintWordCount: 0,
    turnStartedTime: undefined,
    wordsRevealedCount: 0,
    state: Models.GameStates.idle,
    turn: undefined,
    turnCount: undefined,
    turnTimeoutSec: undefined,
    turnOutcome: undefined,
    winner: undefined,
    board: [],
    interceptPhase: false,
    interceptUsed: false,
    interceptingTeam: undefined,
  })

export const buildBoard = (boardWidth: number, boardHeight: number, words: string[], variant: Models.GameVariant = Models.GameVariant.classic): Models.WordsBoard => {
  const numberOfWords = boardWidth * boardHeight
  
  let reds: number, blues: number, numberOfWordsForInocents: number
  
  if (variant === Models.GameVariant.interception) {
    // Interception: 8 words each team, 1 assassin, rest innocents
    reds = 8
    blues = 8
    numberOfWordsForInocents = numberOfWords - 1 - reds - blues // 1 for assassin
  } else {
    // Classic: standard distribution with assassin
    const numberOfWordsForTeams = Math.max(0, Math.floor((numberOfWords - 1) / 3))
    reds = numberOfWordsForTeams + (Math.random() < 0.5 ? 1 : 0)
    blues = numberOfWordsForTeams * 2 + 1 - reds
    numberOfWordsForInocents = Math.max(numberOfWords - 1 - reds - blues, 0)
  }
  
  const types = Random.shuffle([
    ...new Array(reds).fill(Models.WordType.red),
    ...new Array(blues).fill(Models.WordType.blue),
    ...new Array(numberOfWordsForInocents).fill(Models.WordType.inocent),
    Models.WordType.assassin, // Both variants have assassin
  ])

  const boardWords = Random.shuffle(words)
    .slice(boardWidth * boardHeight)
    .map((word, i) => ({ word, type: types[i], revealed: false }))

  return R.range(0, boardHeight).map(r => boardWords.slice(r * boardWidth, r * boardWidth + boardWidth))
}

const checkRuleAction = (rule: Rules.GameRule, action: Actions.GameAction) => (game: Models.CodeNamesGame) =>
  rule(game) || action(game)

const restartGame = Actions.restartGame

const addPlayer = Actions.addPlayer

const removePlayer = Actions.removePlayer

const joinTeam = Actions.joinTeam

const setSpyMaster = (userId: string, team: Models.Teams) =>
  checkRuleAction(Rules.setSpyMaster(team), Actions.setSpyMaster(userId, team))

const randomizeTeams = () => checkRuleAction(Rules.randomizeTeams, Actions.randomizeTeams)

const startGame = (config: Models.GameConfig, board: Models.WordsBoard, now: number) =>
  checkRuleAction(Rules.startGame(config), Actions.startGame(config, board, now))

const sendHint = (userId: string, hintWord: string, hintWordCount: number) =>
  checkRuleAction(Rules.sendHint(userId), Actions.sendHint(hintWord, hintWordCount))

const interceptWord = (userId: string, row: number, col: number) =>
  checkRuleAction(Rules.interceptWord(userId, row, col), Actions.interceptWord(userId, row, col))

const revealWord = (userId: string, row: number, col: number, now: number) =>
  checkRuleAction(Rules.revealWord(userId, row, col), Actions.revealWord(userId, row, col, now))

const changeTurn = (userId: string, now: number) =>
  checkRuleAction(Rules.changeTurn(userId), Actions.changeTurn(userId, now))

const forceChangeTurn = (userId: string, now: number) => Actions.changeTurn(userId, now)

export const checkTurnTimeout = (userId: string, now: number) => (game: Models.CodeNamesGame) =>
  game.turnStartedTime !== undefined &&
  game.turnTimeoutSec !== undefined &&
  isPlayerTurn(game, userId) &&
  now - game.turnStartedTime > game.turnTimeoutSec * 1000

export const gamePorts = {
  addPlayer,
  buildBoard,
  changeTurn,
  checkTurnTimeout,
  createGame,
  forceChangeTurn,
  interceptWord,
  joinTeam,
  randomizeTeams,
  removePlayer,
  restartGame,
  revealWord,
  sendHint,
  setSpyMaster,
  startGame,
}

export type GamePorts = typeof gamePorts
