import * as R from "ramda"
import * as GameActions from "../src/main"
import { GameStates, Teams, WordType } from "../src/models"

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

  it("distributes word types randomlly", () => {
    const board = GameActions.buildBoard(5, 5, words)

    const flattenBoard = R.flatten(board)
    const redTypesIndexes = flattenBoard
      .map((w, i) => ({ w, i }))
      .filter(wi => wi.w.type === WordType.red)
      .map(wi => wi.i)
    const redDiffSum = redTypesIndexes.reduce((acc, sum, i) => acc + sum - (i === 0 ? 0 : redTypesIndexes[i - 1]), 0)

    expect(redDiffSum).toBeGreaterThan(redTypesIndexes.length - 1)
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
      blueTeam: {},
      redTeam: {},
    }

    const team = Teams.red
    const p2 = { userId, team }
    const expectedGame = {
      players: [p2],
      blueTeam: {},
      redTeam: {},
    }

    expect(GameActions.joinTeam(userId, team)(game as any)).toEqual(expectedGame)
  })

  it("removes spyMaster from blue team if joining red team", () => {
    const userId = "some-user-id"
    const game = {
      players: [{ userId }],
      redTeam: {},
      blueTeam: {
        spyMaster: userId,
      },
    }

    expect(GameActions.joinTeam(userId, Teams.red)(game as any).blueTeam.spyMaster).toBeUndefined()
  })

  it("removes spyMaster from red team if joining blue team", () => {
    const userId = "some-user-id"
    const game = {
      players: [{ userId }],
      redTeam: {
        spyMaster: userId,
      },
      blueTeam: {},
    }

    expect(GameActions.joinTeam(userId, Teams.blue)(game as any).redTeam.spyMaster).toBeUndefined()
  })
})

describe("setSpyMaster", () => {
  it("sets the spy master for team red", () => {
    const userId = "some-user-id"
    const p1 = { userId, team: Teams.red }
    const game = {
      players: [p1],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [p1],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: userId,
      },
    }

    expect(GameActions.setSpyMaster(userId)(game as any)).toEqual(expectedGame)
  })

  it("sets the spy master for team blue", () => {
    const userId = "some-user-id"
    const p1 = { userId, team: Teams.blue }
    const game = {
      players: [p1],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [p1],
      blueTeam: {
        spyMaster: userId,
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
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
      redTeam: {
        spyMaster: "some-red-user",
      },
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      state: GameStates.idle,
    }

    const expectedGame = {
      board,
      state: GameStates.running,
      turn: Teams.blue,
      redTeam: {
        spyMaster: "some-red-user",
        wordsLeft: 1,
      },
      blueTeam: {
        spyMaster: "some-blue-user",
        wordsLeft: 2,
      },
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
  const revealWord = (type: WordType, team: Teams) => {
    const userId = "some-user-id"
    const w00 = { word: "w00", type, revealed: false }
    const board = [[w00]] as any
    const p1 = { userId, team }
    const game = {
      board,
      players: [p1],
      turn: Teams.red,
      hintWordCount: 2,
      blueTeam: {
        wordsLeft: 3,
      },
      redTeam: {
        wordsLeft: 2,
      },
    }

    return GameActions.revealWord(userId, 0, 0)(game as any)
  }

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
      blueTeam: {},
      redTeam: {},
      players: [],
    }

    expect(GameActions.revealWord("some-user-id", 0, 1)(game as any).board[0][1].revealed).toBeTruthy()
  })

  it("increases words revealed", () => {
    const userId = "some-user-id"
    const w00 = { word: "w00", type: Teams.blue, revealed: false }
    const board = [[w00]] as any
    const p1 = { userId, team: Teams.blue }
    const game = {
      board,
      players: [],
      blueTeam: {},
      redTeam: {},
      wordsRevealedCount: 2,
    }

    const updatedGame = GameActions.revealWord(userId, 0, 0)(game as any)

    expect(updatedGame.wordsRevealedCount).toBe(3)
  })

  describe("decreases words left", () => {
    it("if word is from the players team", () => {
      expect(revealWord(WordType.blue, Teams.blue).blueTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players team", () => {
      expect(revealWord(WordType.red, Teams.red).redTeam.wordsLeft).toBe(1)
    })
  })

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

    it("if guesses limit reached", () => {
      const userId = "some-user-id"
      const w00 = { word: "w00", type: Teams.blue, revealed: false }
      const board = [[w00]] as any
      const p1 = { userId, team: Teams.blue }
      const game = {
        board,
        players: [p1],
        hintWordCount: 2,
        wordsRevealedCount: 2,
        turn: Teams.blue,
      }

      const updatedGame = GameActions.revealWord(userId, 0, 0)(game as any)

      expect(updatedGame.turn).toBe(Teams.red)
    })
  })

  describe("end the game", () => {
    it("if revealed word is the assassin", () => {
      expect(revealWord(WordType.assassin, Teams.red).state).toBe(GameStates.ended)
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
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
    }

    expect(GameActions.changeTurn(game as any)).toEqual(expectedGame)
  })

  it("change the team from blue to red", () => {
    const game = {
      turn: Teams.blue,
    }

    const expectedGame = {
      turn: Teams.red,
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
    }

    expect(GameActions.changeTurn(game as any)).toEqual(expectedGame)
  })
})
