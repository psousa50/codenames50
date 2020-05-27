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

describe("createGame", () => {
  it("creates a new game", () => {
    const gameId = "some-gameId"
    const userId = "some-userId"
    const timestamp = "some-timestamp"
    const language = "some-language"
    const board = { some: "board" } as any

    const expectedGame = {
      gameId,
      timestamp,
      userId,
      players: [{ userId, team: Teams.red }],
      redTeam: {},
      blueTeam: {},
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
      state: GameStates.idle,
      language,
      board,
    }

    const newGame = GameActions.createGame(gameId, userId, timestamp, language, board)

    expect(newGame).toEqual(expectedGame)
  })
})

describe("resetGame", () => {
  const gameId = "some-gameId"
  const userId = "some-userId"
  const timestamp = "some-timestamp"
  const language = "some-language"
  const board = { some: "board" } as any
  const newTimestamp = "some-new-timestamp"
  const newlanguage = "some-new-language"
  const newBoard = { some: "new-board" } as any
  it("resets the game to starting state, keeping the teams structure", () => {
    const game = {
      gameId,
      timestamp,
      userId,
      players: [{ some: "players" }],
      redTeam: {
        spyMaster: "some-spy-master-1",
        wordsLeft: 1,
      },
      blueTeam: {
        spyMaster: "some-spy-master-2",
        wordsLeft: 2,
      },
      hintWord: "some-word",
      hintWordCount: 1,
      wordsRevealedCount: 2,
      state: GameStates.ended,
      language,
      board,
    } as any

    const resetedGame = {
      gameId,
      timestamp: newTimestamp,
      userId,
      players: [{ some: "players" }],
      redTeam: {},
      blueTeam: {},
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
      state: GameStates.idle,
      language: newlanguage,
      board: newBoard,
    }

    expect(GameActions.resetGame(newTimestamp, newlanguage, newBoard)(game)).toEqual(resetedGame)
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
    const p2 = { userId: userToAddId, team: Teams.red }
    const expectedGame = {
      players: [p1, p2],
    }

    expect(GameActions.addPlayer(userToAddId)(game as any)).toEqual(expectedGame)
  })

  it("adds the player to the team with less elements", () => {
    const p1 = { userId: "some-user-id-1", team: Teams.red }
    const p2 = { userId: "some-user-id-2", team: Teams.red }
    const p3 = { userId: "some-user-id-3", team: Teams.blue }
    const game = {
      players: [p1, p2, p3],
    }

    const userToAddId = "user-to-add"
    const p4 = { userId: userToAddId, team: Teams.blue }
    const expectedGame = {
      players: [p1, p2, p3, p4],
    }

    expect(GameActions.addPlayer(userToAddId)(game as any)).toEqual(expectedGame)
  })

  describe("removePlayer", () => {
    it("removes a player from the game", () => {
      const userId = "some-user-id"
      const p1 = { userId }
      const p2 = { userId: "some-user-id-2" }
      const game = {
        players: [p1, p2],
        redTeam: {},
        blueTeam: {},
      }

      const expectedGame = {
        players: [p2],
        redTeam: {},
        blueTeam: {},
      }

      expect(GameActions.removePlayer(userId)(game as any)).toEqual(expectedGame)
    })

    it("removes red spyMaster if player is removed", () => {
      const userId = "some-user-id"
      const p1 = { userId }
      const game = {
        players: [p1],
        redTeam: {
          spyMaster: userId,
        },
        blueTeam: {},
      }

      expect(GameActions.removePlayer(userId)(game as any).redTeam.spyMaster).toBeUndefined()
    })

    it("removes blue spyMaster if player is removed", () => {
      const userId = "some-user-id"
      const p1 = { userId }
      const game = {
        players: [p1],
        redTeam: {},
        blueTeam: {
          spyMaster: userId,
        },
      }

      expect(GameActions.removePlayer(userId)(game as any).blueTeam.spyMaster).toBeUndefined()
    })
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
    const game = {
      players: [{ userId, team: Teams.blue }],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [{ userId, team: Teams.red }],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: userId,
      },
    }

    expect(GameActions.setSpyMaster(userId, Teams.red)(game as any)).toEqual(expectedGame)
  })

  it("clears the blue spy master if setting for red tean", () => {
    const userId = "some-user-id"
    const game = {
      players: [{ userId, team: Teams.blue }],
      blueTeam: {
        spyMaster: userId,
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [{ userId, team: Teams.red }],
      blueTeam: {
        spyMaster: undefined,
      },
      redTeam: {
        spyMaster: userId,
      },
    }

    expect(GameActions.setSpyMaster(userId, Teams.red)(game as any)).toEqual(expectedGame)
  })

  it("sets the spy master for team blue", () => {
    const userId = "some-user-id"
    const game = {
      players: [{ userId, team: Teams.red }],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [{ userId, team: Teams.blue }],
      blueTeam: {
        spyMaster: userId,
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    expect(GameActions.setSpyMaster(userId, Teams.blue)(game as any)).toEqual(expectedGame)
  })

  it("clears the red spy master when setting for team blue", () => {
    const userId = "some-user-id"
    const game = {
      players: [{ userId, team: Teams.red }],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: userId,
      },
    }

    const expectedGame = {
      players: [{ userId, team: Teams.blue }],
      blueTeam: {
        spyMaster: userId,
      },
      redTeam: {
        spyMaster: undefined,
      },
    }

    expect(GameActions.setSpyMaster(userId, Teams.blue)(game as any)).toEqual(expectedGame)
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
  const userId = "some-user-id"
  const buildGameForRevealWord = (type: WordType, team: Teams) => {
    const w00 = { word: "w00", type, revealed: false }
    const board = [[w00]] as any
    const p1 = { userId, team }
    const game = {
      board,
      players: [p1],
      turn: Teams.red,
      hintWordCount: 2,
      wordsRevealedCount: 2,
      redTeam: {
        wordsLeft: 3,
      },
      blueTeam: {
        wordsLeft: 2,
      },
    }

    return game as any
  }

  const revealWord = GameActions.revealWord(userId, 0, 0)

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
    const game = {
      board,
      players: [],
      blueTeam: {},
      redTeam: {},
      hintWordCount: 2,
      wordsRevealedCount: 1,
    }

    const updatedGame = GameActions.revealWord(userId, 0, 0)(game as any)

    expect(updatedGame.wordsRevealedCount).toBe(2)
  })

  describe("decreases words left", () => {
    it("if word is from the players blue team", () => {
      const game = {
        ...buildGameForRevealWord(WordType.blue, Teams.blue),
        hintWordCount: 2,
        wordsRevealedCount: 1,
        blueTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).blueTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players blue team when red is playing", () => {
      const game = {
        ...buildGameForRevealWord(WordType.blue, Teams.red),
        hintWordCount: 2,
        wordsRevealedCount: 1,
        blueTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).blueTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players blue team and turn finishes", () => {
      const game = {
        ...buildGameForRevealWord(WordType.blue, Teams.blue),
        hintWordCount: 1,
        wordsRevealedCount: 1,
        blueTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).blueTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players redteam", () => {
      const game = {
        ...buildGameForRevealWord(WordType.red, Teams.red),
        hintWordCount: 2,
        wordsRevealedCount: 1,
        redTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).redTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players redteam when blue is playing", () => {
      const game = {
        ...buildGameForRevealWord(WordType.red, Teams.blue),
        hintWordCount: 2,
        wordsRevealedCount: 1,
        redTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).redTeam.wordsLeft).toBe(2)
    })

    it("if word is from the players redteam and turn finishes", () => {
      const game = {
        ...buildGameForRevealWord(WordType.red, Teams.red),
        hintWordCount: 1,
        wordsRevealedCount: 1,
        redTeam: {
          wordsLeft: 3,
        },
      }

      expect(revealWord(game).redTeam.wordsLeft).toBe(2)
    })
  })

  describe("ends the turn", () => {
    it("if revealed word is from a different team", () => {
      const game = buildGameForRevealWord(WordType.blue, Teams.red)

      expect(revealWord(game).turn).toBe(Teams.blue)
    })

    it("if revealed word is from a different team", () => {
      const game = buildGameForRevealWord(WordType.red, Teams.blue)

      expect(revealWord(game).turn).toBe(Teams.blue)
    })

    it("if revealed word is an inocent", () => {
      const game = buildGameForRevealWord(WordType.inocent, Teams.blue)

      expect(revealWord(game).turn).toBe(Teams.blue)
    })

    it("if guesses limit reached", () => {
      const userId = "some-user-id"
      const w00 = { word: "w00", type: Teams.blue, revealed: false }
      const board = [[w00]] as any
      const p1 = { userId, team: Teams.blue }
      const game = {
        board,
        players: [p1],
        blueTeam: {},
        redTeam: {},
        hintWordCount: 2,
        wordsRevealedCount: 2,
        turn: Teams.blue,
      } as any

      expect(revealWord(game).turn).toBe(Teams.red)
    })
  })

  describe("ends the game", () => {
    it("if red team gets all of their words revealed", () => {
      const game = {
        ...buildGameForRevealWord(WordType.red, Teams.red),
        hintWordCount: 1,
        wordsRevealedCount: 1,
        redTeam: {
          wordsLeft: 1,
        },
      }

      const updatedGame = GameActions.revealWord(userId, 0, 0)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.red)
    })

    it("if blue team gets all of their words revealed", () => {
      const game = {
        ...buildGameForRevealWord(WordType.blue, Teams.red),
        hintWordCount: 1,
        wordsRevealedCount: 1,
        blueTeam: {
          wordsLeft: 1,
        },
      }

      const updatedGame = GameActions.revealWord(userId, 0, 0)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.blue)
    })

    it("if red reveals the assassin, blue wins", () => {
      const game = buildGameForRevealWord(WordType.assassin, Teams.red)

      const updatedGame = GameActions.revealWord(userId, 0, 0)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.blue)
    })

    it("if blue reveals the assassin, red wins", () => {
      const game = buildGameForRevealWord(WordType.assassin, Teams.blue)

      const updatedGame = GameActions.revealWord(userId, 0, 0)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.red)
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
