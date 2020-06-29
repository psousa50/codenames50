import { buildBoard, createGame, checkTurnTimeout } from "../src/ports"
import * as GameModels from "../src/models"
import * as R from "ramda"

describe("buildBoards", () => {
  const words = R.range(0, 80).map(i => `word-${i}`)

  it("creates an empty board", () => {
    expect(buildBoard(0, 0, words)).toEqual([])
  })

  it("creates a board with the correct number of unrevealed word types", () => {
    const board = buildBoard(5, 5, words)

    const flattenBoard = R.flatten(board)
    const reds = flattenBoard.filter(b => b.type === GameModels.WordType.red).length
    const blues = flattenBoard.filter(b => b.type === GameModels.WordType.blue).length
    expect(reds).toBeGreaterThanOrEqual(8)
    expect(reds).toBeLessThanOrEqual(9)
    expect(blues).toBeGreaterThanOrEqual(8)
    expect(blues).toBeLessThanOrEqual(9)
    expect(reds + blues).toBe(17)
    expect(flattenBoard.filter(b => b.type === GameModels.WordType.inocent).length).toBe(7)
    expect(flattenBoard.filter(b => b.type === GameModels.WordType.assassin).length).toBe(1)
    expect(flattenBoard.filter(b => b.revealed).length).toBe(0)
  })

  it("creates a board with random words", () => {
    const board1 = buildBoard(5, 5, words)
    const board2 = buildBoard(5, 5, words)

    const flattenBoard1 = R.flatten(board1)
    const flattenBoard2 = R.flatten(board2)

    expect(flattenBoard1).not.toEqual(flattenBoard2)
  })

  it("distributes word types randomlly", () => {
    const board = buildBoard(5, 5, words)

    const flattenBoard = R.flatten(board)
    const redTypesIndexes = flattenBoard
      .map((w, i) => ({ w, i }))
      .filter(wi => wi.w.type === GameModels.WordType.red)
      .map(wi => wi.i)
    const redDiffSum = redTypesIndexes.reduce((acc, sum, i) => acc + sum - (i === 0 ? 0 : redTypesIndexes[i - 1]), 0)

    expect(redDiffSum).toBeGreaterThan(redTypesIndexes.length - 1)
  })
})

describe("createGame", () => {
  const now = 1234567890
  it("creates a new game", () => {
    const gameId = "some-gameId"
    const userId = "some-userId"

    const expectedGame = {
      gameId,
      gameCreatedTime: now,
      config: {
        language: undefined,
        turnTimeoutSec: undefined,
      },
      userId,
      players: [{ userId, team: GameModels.Teams.red }],
      redTeam: {},
      blueTeam: {},
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
      state: GameModels.GameStates.idle,
      board: [],
    }

    const newGame = createGame(gameId, userId, now)

    expect(newGame).toEqual(expectedGame)
  })
})

describe("checkTurnTimeout", () => {
  const userId = "some-user-id"
  it("return true if current turn has timed out", () => {
    const now = 10 * 1000
    const game = {
      players: [{ userId, team: GameModels.Teams.blue }],
      turn: GameModels.Teams.blue,
      turnTimeoutSec: 1,
      turnStartedTime: now - 3 * 1000,
    }

    expect(checkTurnTimeout(userId, now)(game as any)).toBeTruthy()
  })

  it("return false if current turn has timed out but user is not from the current team", () => {
    const now = 10 * 1000
    const game = {
      players: [{ userId, team: GameModels.Teams.red }],
      turn: GameModels.Teams.blue,
      turnTimeoutSec: 1,
      turnStartedTime: now - 3 * 1000,
    }

    const expectedGame = game

    expect(checkTurnTimeout(userId, now)(game as any)).toBeFalsy()
  })

  it("returns false if current turn has NOT timed out", () => {
    const now = 10 * 1000
    const game = {
      players: [{ userId, team: GameModels.Teams.blue }],
      turn: GameModels.Teams.blue,
      turnTimeoutSec: 5,
      turnStartedTime: now - 3 * 1000,
    }

    expect(checkTurnTimeout(userId, now)(game as any)).toBeFalsy()
  })
})
