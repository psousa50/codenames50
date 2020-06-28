import * as R from "ramda"
import * as GameActions from "../src/actions"
import { GameStates, Teams, WordType } from "../src/models"

describe("addPlayer", () => {
  it("adds a player to the game", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
      redTeam: {},
      blueTeam: {},
    }

    const userToAddId = "user-to-add"
    const p2 = { userId: userToAddId, team: Teams.red }
    const expectedGame = {
      players: [p1, p2],
      redTeam: {},
      blueTeam: {},
    }

    expect(GameActions.addPlayer(userToAddId)(game as any)).toEqual(expectedGame)
  })

  it("adds a player to the red team if it is assigned as SpyMaster", () => {
    const userId = "some-user-id"
    const game = {
      players: [],
      redTeam: {
        spyMaster: userId,
      },
      blueTeam: {},
    }

    const updatedGame = GameActions.addPlayer(userId)(game as any)

    expect(updatedGame.players).toEqual([{ userId, team: Teams.red }])
  })

  it("adds a player to the blue team if it is assigned as SpyMaster", () => {
    const userId = "some-user-id"
    const game = {
      players: [],
      redTeam: {},
      blueTeam: {
        spyMaster: userId,
      },
    }

    const updatedGame = GameActions.addPlayer(userId)(game as any)

    expect(updatedGame.players).toEqual([{ userId, team: Teams.blue }])
  })

  it("adds the player to the team with less elements", () => {
    const p1 = { userId: "some-user-id-1", team: Teams.red }
    const p2 = { userId: "some-user-id-2", team: Teams.red }
    const p3 = { userId: "some-user-id-3", team: Teams.blue }
    const game = {
      players: [p1, p2, p3],
      redTeam: {},
      blueTeam: {},
    }

    const userToAddId = "user-to-add"
    const p4 = { userId: userToAddId, team: Teams.blue }
    const expectedGame = {
      players: [p1, p2, p3, p4],
      redTeam: {},
      blueTeam: {},
    }

    expect(GameActions.addPlayer(userToAddId)(game as any)).toEqual(expectedGame)
  })

  it("does not add player if it is already there", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
      redTeam: {},
      blueTeam: {},
    }

    const expectedGame = {
      players: [p1],
      redTeam: {},
      blueTeam: {},
    }

    expect(GameActions.addPlayer(userId)(game as any)).toEqual(expectedGame)
  })
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

  it("does not clear red spyMaster if player is removed", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
      redTeam: {
        spyMaster: userId,
      },
      blueTeam: {},
    }

    expect(GameActions.removePlayer(userId)(game as any).redTeam.spyMaster).toBe(userId)
  })

  it("does not clear blue spyMaster if player is removed", () => {
    const userId = "some-user-id"
    const p1 = { userId }
    const game = {
      players: [p1],
      redTeam: {},
      blueTeam: {
        spyMaster: userId,
      },
    }

    expect(GameActions.removePlayer(userId)(game as any).blueTeam.spyMaster).toBe(userId)
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

describe("randomizeTeams", () => {
  it("assigns a random team to each player, evenly distributed", () => {
    const game = {
      players: R.range(0, 21).map(i => ({ userId: `${i}`, team: i > 15 ? Teams.red : Teams.blue })),
    }

    const updatedGame = GameActions.randomizeTeams(game as any)
    const redPlayers = updatedGame.players.filter(p => p.team === Teams.red)
    const bluePlayers = updatedGame.players.filter(p => p.team === Teams.blue)

    expect(redPlayers.length).toBe(10)
    expect(bluePlayers.length).toBe(11)

    expect(redPlayers.map(p => p.userId)).not.toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
  })

  it("clears Spy Masters", () => {
    const game = {
      players: [],
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    }

    const expectedGame = {
      players: [],
      blueTeam: {
        spyMaster: undefined,
      },
      redTeam: {
        spyMaster: undefined,
      },
    }

    expect(GameActions.randomizeTeams(game as any)).toEqual(expectedGame)
  })
})

describe("startGame", () => {
  it("sets the rame running", () => {
    const now = 1234567890
    const config = { some: "config" } as any
    const w00 = { word: "w00", type: WordType.blue }
    const w01 = { word: "w01", type: WordType.red }
    const w10 = { word: "w10", type: WordType.blue }
    const w11 = { word: "w11", type: WordType.assassin }
    const board = [
      [w00, w01],
      [w10, w11],
    ] as any
    const game = {
      board: [],
      redTeam: {
        spyMaster: "some-red-user",
      },
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      state: GameStates.idle,
    }

    const expectedGame = {
      gameStartedTime: now,
      config,
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
      turnStartedTime: now,
    }

    expect(GameActions.startGame(config, board, now)(game as any)).toEqual(expectedGame)
  })
})

describe("restartGame", () => {
  it("prepares a game to start again", () => {
    const game = {
      state: GameStates.running,
      hintWord: "some-hint",
      hintWordCount: 3,
      wordsRevealedCount: 2,
      something: "else",
    } as any

    const expectedGame = {
      state: GameStates.idle,
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
      something: "else",
    }

    expect(GameActions.restartGame(game as any)).toEqual(expectedGame)
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
  const now = 1234567890
  const userId = "some-user-id"
  const buildGameForRevealWord = (type: WordType, playerTeam: Teams) => {
    const w00 = { word: "w00", type, revealed: false }
    const board = [[w00]] as any
    const p1 = { userId, team: playerTeam }
    const game = {
      board,
      players: [p1],
      turn: playerTeam,
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

  const revealWordAt00 = GameActions.revealWord(userId, 0, 0, now)

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

    expect(GameActions.revealWord("some-user-id", 0, 1, now)(game as any).board[0][1].revealed).toBeTruthy()
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

    const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game as any)

    expect(updatedGame.wordsRevealedCount).toBe(2)
  })

  describe("sets the turn outcome", () => {
    const buildGame = (playerTeam: Teams, wordType: WordType) => {
      const userId = "some-user-id"
      const w00 = { word: "w00", type: wordType, revealed: false }
      const board = [[w00]] as any

      return {
        board,
        players: [{ userId, team: playerTeam }],
        blueTeam: {},
        redTeam: {},
        hintWordCount: 2,
        wordsRevealedCount: 1,
      }
    }

    it("to success if blue player reveals blue word", () => {
      const game = buildGame(Teams.blue, WordType.blue)
      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game as any)

      expect(updatedGame.turnOutcome).toBe("success")
    })

    it("to success if red player reveals red word", () => {
      const game = buildGame(Teams.red, WordType.red)
      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game as any)

      expect(updatedGame.turnOutcome).toBe("success")
    })

    it("to failure if player reveals inocent word", () => {
      const game = buildGame(Teams.red, WordType.inocent)
      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game as any)

      expect(updatedGame.turnOutcome).toBe("failure")
    })

    it("to assassin if player reveals assassin word", () => {
      const game = buildGame(Teams.red, WordType.assassin)
      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game as any)

      expect(updatedGame.turnOutcome).toBe("assassin")
    })
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

      expect(revealWordAt00(game).blueTeam.wordsLeft).toBe(2)
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

      expect(revealWordAt00(game).blueTeam.wordsLeft).toBe(2)
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

      expect(revealWordAt00(game).blueTeam.wordsLeft).toBe(2)
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

      expect(revealWordAt00(game).redTeam.wordsLeft).toBe(2)
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

      expect(revealWordAt00(game).redTeam.wordsLeft).toBe(2)
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

      expect(revealWordAt00(game).redTeam.wordsLeft).toBe(2)
    })
  })

  describe("ends the turn", () => {
    it("if revealed word is from a different team", () => {
      const game = buildGameForRevealWord(WordType.blue, Teams.red)

      expect(revealWordAt00(game).turn).toBe(Teams.blue)
    })

    it("if revealed word is from a different team", () => {
      const game = buildGameForRevealWord(WordType.red, Teams.blue)

      expect(revealWordAt00(game).turn).toBe(Teams.red)
    })

    it("if revealed word is an inocent", () => {
      const game = buildGameForRevealWord(WordType.inocent, Teams.blue)

      expect(revealWordAt00(game).turn).toBe(Teams.red)
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

      expect(revealWordAt00(game).turn).toBe(Teams.red)
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

      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game)
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

      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.blue)
    })

    it("if red reveals the assassin, blue wins", () => {
      const game = buildGameForRevealWord(WordType.assassin, Teams.red)

      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.blue)
    })

    it("if blue reveals the assassin, red wins", () => {
      const game = buildGameForRevealWord(WordType.assassin, Teams.blue)

      const updatedGame = GameActions.revealWord(userId, 0, 0, now)(game)
      expect(updatedGame.state).toBe(GameStates.ended)
      expect(updatedGame.winner).toBe(Teams.red)
    })
  })
})

describe("changeTurn", () => {
  const now = 1234567890
  const userId = "some-user-id"
  it("change the team to the other team", () => {
    const game = {
      players: [{ userId, team: Teams.red }],
      turn: Teams.red,
      turnStartedTime: 10,
    }

    const expectedGame = {
      ...game,
      turn: Teams.blue,
      hintWord: "",
      hintWordCount: 0,
      wordsRevealedCount: 0,
      turnStartedTime: now,
    }

    expect(GameActions.changeTurn(userId, now)(game as any)).toEqual(expectedGame)
  })
})
