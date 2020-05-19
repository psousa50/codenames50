import * as R from "ramda"
import { CodeNamesGame, GameStates, Teams } from "../../src/game/models"
import * as GameRules from "../../src/game/rules"
import { DeepPartial } from "../../src/utils/types"

const userId = "some-user-id"

const buildGame = (validGame: DeepPartial<CodeNamesGame>, game: DeepPartial<CodeNamesGame>) =>
  R.mergeDeepRight(validGame, game)

describe("joinTeam", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
  }

  it("is valid for a valid game", () => {
    expect(GameRules.joinTeam(validGame as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not idle", () => {
      const game = {
        ...validGame,
        state: GameStates.running,
      }

      expect(GameRules.joinTeam(game as any)).toBeFalsy()
    })
  })
})

describe("setSpyMaster", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
    players: [
      {
        userId,
        team: Teams.blue,
      },
    ],
  }

  it("is valid for a valid game", () => {
    expect(GameRules.setSpyMaster(userId)(validGame as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not idle", () => {
      const game = {
        ...validGame,
        state: GameStates.running,
      }

      expect(GameRules.setSpyMaster(userId)(game as any)).toBeFalsy()
    })

    it("if player does not have team", () => {
      const game = buildGame(validGame, {
        ...validGame,
        players: [
          {
            userId,
            team: undefined,
          },
        ],
      })

      expect(GameRules.setSpyMaster(userId)(game as any)).toBeFalsy()
    })
  })
})

describe("startGame", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.idle,
    redSpyMaster: "some-user-1",
    blueSpyMaster: "some-user-2",
  }
  it("is valid for a valid game", () => {
    expect(GameRules.startGame(validGame as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not idle", () => {
      const game = {
        ...validGame,
        state: GameStates.running,
      }

      expect(GameRules.startGame(game as any)).toBeFalsy()
    })

    it("if red spyMasters is not defined", () => {
      const game = {
        ...validGame,
        redSpyMaster: undefined,
      }

      expect(GameRules.startGame(game as any)).toBeFalsy()
    })

    it("if blue spyMasters is not defined", () => {
      const game = {
        ...validGame,
        blueSpyMaster: undefined,
      }

      expect(GameRules.startGame(game as any)).toBeFalsy()
    })
  })
})

describe("sendHint", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.red,
      },
    ],
    hintWordCount: 0,
    turn: Teams.red,
    redSpyMaster: userId,
    blueSpyMaster: "some-blue-player",
  }

  it("is valid for a valid game", () => {
    expect(GameRules.sendHint(userId)(validGame as any)).toBeTruthy()
  })

  it("is valid for a valid game when user is redSpyMaster", () => {
    const game = buildGame(validGame, {
      redSpyMaster: userId,
      blueSpyMaster: "some-blue-user",
    })
    expect(GameRules.sendHint(userId)(game as any)).toBeTruthy()
  })

  it("is valid for a valid game when user is blueSpyMaster", () => {
    const game = buildGame(validGame, {
      redSpyMaster: "some-red-user",
      blueSpyMaster: userId,
    })
    expect(GameRules.sendHint(userId)(game as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.sendHint(userId)(game as any)).toBeFalsy()
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

      expect(GameRules.sendHint(userId)(game as any)).toBeFalsy()
    })

    it("if player is not spyMaster", () => {
      const game = buildGame(validGame, {
        redSpyMaster: "some-red-player",
        blueSpyMaster: "some-blue-player",
      })

      expect(GameRules.sendHint(userId)(game as any)).toBeFalsy()
    })

    it("if there is already a hint running", () => {
      const game = buildGame(validGame, {
        hintWordCount: 1,
      })

      expect(GameRules.sendHint(userId)(game as any)).toBeFalsy()
    })
  })
})

describe("changeTurn", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.blue,
      },
    ],
    hintWordCount: 1,
    wordsRevealedCount: 1,
    turn: Teams.blue,
  }

  it("is valid for a valid game", () => {
    expect(GameRules.changeTurn(userId)(validGame as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
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

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })

    it("if game has no hint running", () => {
      const game = buildGame(validGame, {
        ...validGame,
        hintWordCount: 0,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })

    it("if player is red SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        redSpyMaster: userId,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })

    it("if player is blue SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        blueSpyMaster: userId,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })

    it("if turn has no revealed word", () => {
      const game = buildGame(validGame, {
        ...validGame,
        wordsRevealedCount: 0,
      })

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })
  })
})

describe("revealWord", () => {
  const validGame: DeepPartial<CodeNamesGame> = {
    state: GameStates.running,
    players: [
      {
        userId,
        team: Teams.blue,
      },
    ],
    turn: Teams.blue,
    hintWordCount: 2,
    wordsRevealedCount: 2,
    board: [[{}]],
  }

  it("is valid for a valid game", () => {
    expect(GameRules.revealWord(0, 0, userId)(validGame as any)).toBeTruthy()
  })

  describe("is invalid", () => {
    it("if game is not running", () => {
      const game = {
        ...validGame,
        state: GameStates.idle,
      }

      expect(GameRules.revealWord(0, 0, userId)(game as any)).toBeFalsy()
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

      expect(GameRules.changeTurn(userId)(game as any)).toBeFalsy()
    })

    it("if player is red SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        redSpyMaster: userId,
      })

      expect(GameRules.revealWord(0, 0, userId)(game as any)).toBeFalsy()
    })

    it("if player is blue SpyMaster", () => {
      const game = buildGame(validGame, {
        ...validGame,
        blueSpyMaster: userId,
      })

      expect(GameRules.revealWord(0, 0, userId)(game as any)).toBeFalsy()
    })

    it("if word is already revealed", () => {
      const game = buildGame(validGame, {
        ...validGame,
        board: [[{ revealed: true }]],
      })

      expect(GameRules.revealWord(0, 0, userId)(game as any)).toBeFalsy()
    })

    it("if revealedWords is less than hintWordCount + 1", () => {
      const game = buildGame(validGame, {
        ...validGame,
        hintWordCount: 2,
        wordsRevealedCount: 3,
      })

      expect(GameRules.revealWord(0, 0, userId)(game as any)).toBeFalsy()
    })
  })
})
