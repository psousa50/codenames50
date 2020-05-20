import * as R from "ramda"
import * as GameActions from "../../src/game/main"
import { GameStates, Teams, WordType } from "../../src/game/models"

describe("buildBoards", () => {
  const words = R.range(0, 80).map(i => `word-${i}`)

  it("creates an empty board", () => {
    expect(GameActions.buildBoard(0, 0, words)).toEqual([])
  })

  it("creates a board with the correct number of unrevealed word types", () => {
    const board = GameActions.buildBoard(5, 5, words)

    const flattenBoard = R.flatten(board)
    expect(flattenBoard.filter(b => b.type === WordType.red).length).toBe(8)
    expect(flattenBoard.filter(b => b.type === WordType.blue).length).toBe(8)
    expect(flattenBoard.filter(b => b.type === WordType.inocent).length).toBe(8)
    expect(flattenBoard.filter(b => b.type === WordType.assassin).length).toBe(1)
    expect(flattenBoard.filter(b => b.revealed).length).toBe(0)
  })

  it("creates a board with random words", () => {
    const board1 = GameActions.buildBoard(5, 5, words)
    const board2 = GameActions.buildBoard(5, 5, words)

    const flattenBoard1 = R.flatten(board1)
    const flattenBoard2 = R.flatten(board2)

    expect(flattenBoard1).not.toEqual(flattenBoard2)
  })
})

describe("addPlayer", () => {
  it("adds a player to the game", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
    }

    const userToAddId = "user-to-add"
    const p2 = { userId: userToAddId }
    const expectedGame = {
      players: [p1, p2],
    }

    expect(GameActions.addPlayer(userToAddId)(game as any)).toEqual(expectedGame)
  })

  it("does not add player if it is already there", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
    }

    const expectedGame = {
      players: [p1],
    }

    expect(GameActions.addPlayer(userId)(game as any)).toEqual(expectedGame)
  })
})

describe("joinTeam", () => {
  it("sets the team of a player", () => {
    const userId = "some-user-id"
    const p1 = { userId, team: "some-team" }
    const game = {
      players: [p1],
    }

    const team = Teams.red
    const p2 = { userId, team }
    const expectedGame = {
      players: [p2],
    }

    expect(GameActions.joinTeam(userId, team)(game as any)).toEqual(expectedGame)
  })
})

describe("setSpyMaster", () => {
  it("sets the spy master for team red", () => {
    const userId = "some-user-id"
    const p1 = { userId, team: Teams.red }
    const game = {
      players: [p1],
      blueSpyMaster: "some-blue-user",
      redSpyMaster: "some-red-user",
    }

    const expectedGame = {
      players: [p1],
      blueSpyMaster: "some-blue-user",
      redSpyMaster: userId,
    }

    expect(GameActions.setSpyMaster(userId)(game as any)).toEqual(expectedGame)
  })

  it("sets the spy master for team blue", () => {
    const userId = "some-user-id"
    const p1 = { userId, team: Teams.blue }
    const game = {
      players: [p1],
      blueSpyMaster: "some-blue-user",
      redSpyMaster: "some-red-user",
    }

    const expectedGame = {
      players: [p1],
      blueSpyMaster: userId,
      redSpyMaster: "some-red-user",
    }

    expect(GameActions.setSpyMaster(userId)(game as any)).toEqual(expectedGame)
  })
})

describe("startGame", () => {
  it("sets the rame running", () => {
    const w00 = { word: "w00", type: WordType.blue }
    const w01 = { word: "w01", type: WordType.red }
    const w10 = { word: "w10", type: WordType.blue }
    const w11 = { word: "w11", type: WordType.assassin }
    const board = [
      [w00, w01],
      [w10, w11],
    ] as any
    const game = {
      board,
      state: GameStates.idle,
    }

    const expectedGame = {
      board,
      state: GameStates.running,
      turn: Teams.blue,
      blueScore: 2,
      redScore: 1,
    }

    expect(GameActions.startGame(game as any)).toEqual(expectedGame)
  })
})

describe("sendHint", () => {
  it("sets the hint for the turn", () => {
    const game = {}

    const hintWord = "some-hint"
    const hintWordCount = 3
    const expectedGame = {
      hintWord,
      hintWordCount,
      wordsRevealedCount: 0,
    }

    expect(GameActions.sendHint(hintWord, hintWordCount)(game as any)).toEqual(expectedGame)
  })
})

describe("revealWord", () => {
  it("reveals a word", () => {
    const w00 = { word: "w00" }
    const w01 = { word: "w01" }
    const w10 = { word: "w10" }
    const w11 = { word: "w11" }
    const board = [
      [w00, w01],
      [w10, w11],
    ] as any
    const game = {
      board,
      players: [],
      wordsRevealedCount: 3,
    }

    const expectedBoard = [
      [w00, { ...w01, revealed: true }],
      [w10, w11],
    ] as any
    const expectedGame = {
      board: expectedBoard,
      players: [],
      wordsRevealedCount: 4,
    }

    expect(GameActions.revealWord("some-user-id", 0, 1)(game as any)).toEqual(expectedGame)
  })

  const revealWord = (type: WordType, team: Teams) => {
    const userId = "some-user-id"
    const w00 = { word: "w00", type, revealed: false }
    const board = [[w00]] as any
    const p1 = { userId, team }
    const game = {
      board,
      players: [p1],
      turn: Teams.red,
    }

    return GameActions.revealWord(userId, 0, 0)(game as any)
  }
  describe("ends the turn", () => {
    it("if revealed word is from a different team", () => {
      expect(revealWord(WordType.blue, Teams.red).turn).toBe(Teams.blue)
    })

    it("if revealed word is from a different team", () => {
      expect(revealWord(WordType.red, Teams.blue).turn).toBe(Teams.blue)
    })

    it("if revealed word is an inocent", () => {
      expect(revealWord(WordType.inocent, Teams.blue).turn).toBe(Teams.blue)
    })
  })

  describe("end the game", () => {
    it("if revealed word is the assassin", () => {
      expect(revealWord(WordType.assassin, Teams.blue).state).toBe(GameStates.ended)
    })
  })
})

describe("changeTurn", () => {
  it("change the team from red to blue", () => {
    const game = {
      turn: Teams.red,
    }

    const expectedGame = {
      turn: Teams.blue,
    }

    expect(GameActions.changeTurn(game as any)).toEqual(expectedGame)
  })

  it("change the team from blue to red", () => {
    const game = {
      turn: Teams.blue,
    }

    const expectedGame = {
      turn: Teams.red,
    }

    expect(GameActions.changeTurn(game as any)).toEqual(expectedGame)
  })
})
