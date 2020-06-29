import { Types } from "@psousa50/shared"
import * as R from "ramda"
import { CodeNamesGame, GameStates, Teams } from "../src/models"
import * as GameRules from "../src/rules"

const userId = "some-user-id"

const buildGame = (validGame: Types.DeepPartial<CodeNamesGame>, game: Types.DeepPartial<CodeNamesGame>) =>
  R.mergeDeepRight(validGame, game)

describe("joinTeam", () => {
  const validIdleGame: Types.DeepPartial<CodeNamesGame> = {}

  it("is always valid", () => {
    expect(GameRules.joinTeam(validIdleGame as any)).toBeUndefined()
  })
})

describe("setSpyMaster", () => {
  const validIdleGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
  }

  it("is valid for an idle game", () => {
    expect(GameRules.setSpyMaster(Teams.red)(validIdleGame as any)).toBeUndefined()
  })

  const validRunningGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    redTeam: {},
    blueTeam: {},
  }

  it("is valid for a running game with no red Spy Master", () => {
    const game = {
      ...validRunningGame,
    }

    expect(GameRules.setSpyMaster(Teams.red)(game as any)).toBeUndefined()
  })

  it("is valid for a running game with no blue Spy Master", () => {
    const game = {
      ...validRunningGame,
    }

    expect(GameRules.setSpyMaster(Teams.blue)(game as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    describe("when game is running", () => {
      it("and red spyMaster is set", () => {
        const game = {
          ...validRunningGame,
          redTeam: {
            spyMaster: "some-user",
          },
        }

        expect(GameRules.setSpyMaster(Teams.red)(game as any)).toBe(GameRules.message("spyMasterAlreadySet"))
      })

      it("and blue spyMaster is set", () => {
        const game = {
          ...validRunningGame,
          blueTeam: {
            spyMaster: "some-user",
          },
        }

        expect(GameRules.setSpyMaster(Teams.blue)(game as any)).toBe(GameRules.message("spyMasterAlreadySet"))
      })
    })
  })
})

describe("randomizeTeams", () => {
  const validGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
  }

  it("is valid for an idle game", () => {
    expect(GameRules.randomizeTeams(validGame as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    it("if game is not idle", () => {
      const game = {
        ...validGame,
        state: GameStates.running,
      }

      expect(GameRules.randomizeTeams(game as any)).toBe(GameRules.message("gameIsAlreadyRunning"))
    })
  })
})

describe("startGame", () => {
  const validGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
    players: [
      { userId: "some-user-id-1", team: Teams.red },
      { userId: "some-user-id-2", team: Teams.red },
      { userId: "some-user-id-3", team: Teams.blue },
      { userId: "some-user-id-4", team: Teams.blue },
    ],
    blueTeam: {
      spyMaster: "some-blue-user",
    },
    redTeam: {
      spyMaster: "some-red-user",
    },
  }
  const validConfig = {
    language: "some-language",
    turnTimeoutSec: undefined,
  }
  it("is valid for a valid game", () => {
    expect(GameRules.startGame(validConfig)(validGame as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    it("if game is not idle", () => {
      const game = {
        ...validGame,
        state: GameStates.running,
      }

      expect(GameRules.startGame(validConfig)(game as any)).toBe(GameRules.message("gameIsAlreadyRunning"))
    })

    it("if language is not specfied", () => {
      const game = {
        ...validGame,
      }
      const config = { language: undefined, turnTimeoutSec: undefined }

      expect(GameRules.startGame(config)(game as any)).toBe(GameRules.message("missingLanguage"))
    })

    it("if red spyMasters is not defined", () => {
      const game = {
        ...validGame,
        redTeam: {
          spyMaster: undefined,
        },
      }

      expect(GameRules.startGame(validConfig)(game as any)).toBe(GameRules.message("mustHaveSpyMasters"))
    })

    it("if blue spyMasters is not defined", () => {
      const game = {
        ...validGame,
        blueTeam: {
          spyMaster: undefined,
        },
      }

      expect(GameRules.startGame(validConfig)(game as any)).toBe(GameRules.message("mustHaveSpyMasters"))
    })

    it("if red team doesn't have two players", () => {
      const game = {
        ...validGame,
        players: [
          { userId: "some-user-id-1", team: Teams.red },
          { userId: "some-user-id-2", team: Teams.blue },
          { userId: "some-user-id-3", team: Teams.blue },
        ],
      }

      expect(GameRules.startGame(validConfig)(game as any)).toBe(GameRules.message("mustHaveTwoPlayers"))
    })

    it("if red team doesn't have two players", () => {
      const game = {
        ...validGame,
        players: [
          { userId: "some-user-id-1", team: Teams.red },
          { userId: "some-user-id-2", team: Teams.red },
          { userId: "some-user-id-3", team: Teams.blue },
        ],
      }

      expect(GameRules.startGame(validConfig)(game as any)).toBe(GameRules.message("mustHaveTwoPlayers"))
    })
  })
})

describe("sendHint", () => {
  const validGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.red,
      },
    ],
    hintWordCount: 0,
    turn: Teams.red,
    blueTeam: {
      spyMaster: "some-blue-user",
    },
    redTeam: {
      spyMaster: userId,
    },
  }

  it("is valid for a valid game", () => {
    expect(GameRules.sendHint(userId)(validGame as any)).toBeUndefined()
  })

  it("is valid for a valid game when user is redSpyMaster", () => {
    const game = buildGame(validGame, {
      blueTeam: {
        spyMaster: "some-blue-user",
      },
      redTeam: {
        spyMaster: userId,
      },
    })
    expect(GameRules.sendHint(userId)(game as any)).toBeUndefined()
  })

  it("is valid for a valid game when user is blueSpyMaster", () => {
    const game = buildGame(validGame, {
      blueTeam: {
        spyMaster: userId,
      },
      redTeam: {
        spyMaster: "some-red-user",
      },
    })
    expect(GameRules.sendHint(userId)(game as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.sendHint(userId)(game as any)).toBe(GameRules.message("gameIsNotRunning"))
    })

    it("if it's not player's team turn", () => {
      const game = buildGame(validGame, {
        players: [
          {
            userId,
            team: Teams.blue,
          },
        ],
        turn: Teams.red,
      })

      expect(GameRules.sendHint(userId)(game as any)).toBe(GameRules.message("notPlayersTurn"))
    })

    it("if player is not spyMaster", () => {
      const game = buildGame(validGame, {
        blueTeam: {
          spyMaster: "some-blue-user",
        },
        redTeam: {
          spyMaster: "some-red-user",
        },
      })

      expect(GameRules.sendHint(userId)(game as any)).toBe(GameRules.message("mustBeSpyMaster"))
    })

    it("if there is already a hint running", () => {
      const game = buildGame(validGame, {
        hintWordCount: 1,
      })

      expect(GameRules.sendHint(userId)(game as any)).toBe(GameRules.message("alreadyHasHint"))
    })
  })
})

describe("changeTurn", () => {
  const validGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.blue,
      },
    ],
    blueTeam: {},
    redTeam: {},
    hintWordCount: 1,
    wordsRevealedCount: 1,
    turn: Teams.blue,
  }

  it("is valid for a valid game", () => {
    expect(GameRules.changeTurn(userId)(validGame as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("gameIsNotRunning"))
    })

    it("if it's not player's team turn", () => {
      const game = buildGame(validGame, {
        ...validGame,
        players: [
          {
            userId,
            team: Teams.blue,
          },
        ],
        turn: Teams.red,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("notPlayersTurn"))
    })

    it("if game has no hint running", () => {
      const game = buildGame(validGame, {
        ...validGame,
        hintWordCount: 0,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("noHint"))
    })

    it("if player is red SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        redTeam: {
          spyMaster: userId,
        },
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("cantBeSpyMaster"))
    })

    it("if player is blue SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        blueTeam: {
          spyMaster: userId,
        },
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("cantBeSpyMaster"))
    })

    it("if turn has no revealed word", () => {
      const game = buildGame(validGame, {
        ...validGame,
        wordsRevealedCount: 0,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("mustGuessOnce"))
    })
  })
})

describe("revealWord", () => {
  const validGame: Types.DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.blue,
      },
    ],
    blueTeam: {},
    redTeam: {},
    turn: Teams.blue,
    hintWordCount: 2,
    wordsRevealedCount: 2,
    board: [[{}]],
  }

  it("is valid for a valid game", () => {
    expect(GameRules.revealWord(userId, 0, 0)(validGame as any)).toBeUndefined()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.revealWord(userId, 0, 0)(game as any)).toBe(GameRules.message("gameIsNotRunning"))
    })

    it("if it's not player's team turn", () => {
      const game = buildGame(validGame, {
        ...validGame,
        players: [
          {
            userId,
            team: Teams.blue,
          },
        ],
        turn: Teams.red,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBe(GameRules.message("notPlayersTurn"))
    })

    it("if player is red SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        redTeam: {
          spyMaster: userId,
        },
      })

      expect(GameRules.revealWord(userId, 0, 0)(game as any)).toBe(GameRules.message("cantBeSpyMaster"))
    })

    it("if player is blue SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        blueTeam: {
          spyMaster: userId,
        },
      })

      expect(GameRules.revealWord(userId, 0, 0)(game as any)).toBe(GameRules.message("cantBeSpyMaster"))
    })

    it("if word is already revealed", () => {
      const game = buildGame(validGame, {
        ...validGame,
        board: [[{ revealed: true }]],
      })

      expect(GameRules.revealWord(userId, 0, 0)(game as any)).toBe(GameRules.message("alreadyRevealed"))
    })

    it("if revealedWords is higher than hintWordCount + 1", () => {
      const game = buildGame(validGame, {
        ...validGame,
        redTeam: {},
        blueTeam: {},
        hintWordCount: 2,
        wordsRevealedCount: 3,
      })

      expect(GameRules.revealWord(userId, 0, 0)(game as any)).toBe(GameRules.message("tooMuchGuesses"))
    })
  })
})
