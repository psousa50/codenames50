import { Messages } from "@codenames50/messaging"
import { render, act } from "@testing-library/react"
import React from "react"
import { Environment, EnvironmentContext } from "../../environment"
import { CodeNamesGameLoader } from "./CodeNamesGameLoader"

describe("CodeNamesGameLoader", () => {
  it("on server connection emits messages to register the user socket and to join the game", () => {
    const userId = "Some Name"
    const gameId = "some-game-id"
    const emitMessage = jest.fn()

    const messageHandlers = {} as any
    const socketMessaging = {
      connect: () => {},
      disconnect: () => {},
      emitMessage: jest.fn(() => emitMessage),
      addMessageHandler: () => (handler: Messages.GameMessageHandler) => {
        messageHandlers[handler.type] = handler.handler
      },
    }

    const environment: Environment = {
      config: {},
      useSound: () => [jest.fn()],
      socketMessaging,
    } as any

    render(
      <EnvironmentContext.Provider value={environment}>
        <CodeNamesGameLoader gameId={gameId} userId={userId} />
      </EnvironmentContext.Provider>,
    )

    act(() => messageHandlers["connect"]())

    expect(emitMessage).toHaveBeenCalledWith(Messages.registerUserSocket({ userId }))
    expect(emitMessage).toHaveBeenCalledWith(Messages.joinGame({ gameId, userId }))
  })
})
