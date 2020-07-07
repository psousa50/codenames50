import { Messages } from "@codenames50/messaging"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Environment, EnvironmentContext } from "../environment"
import { CreateGameView } from "./CreateGameView"

interface TestRedirectProps {
  ComponentWithRedirection: React.ComponentType
  redirectUrl: string
}

const TestRedirect: React.FC<TestRedirectProps> = ({ ComponentWithRedirection, redirectUrl }) => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact={true} render={() => <ComponentWithRedirection />} />
      <Route
        path={redirectUrl}
        render={({ location: { pathname, search } }) => <div data-testid="redirect-url">{`${pathname}${search}`}</div>}
      />
    </Switch>
  </BrowserRouter>
)

describe("CreateGameView", () => {
  const userId = "Some Name"

  describe("when the user types a name and presses create game button", () => {
    const userTypesNameAndPressesCreateGameButton = () => {
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

      const callMessagehandler = (messageType: string) => messageHandlers[messageType]

      const environment: Environment = {
        socketMessaging,
      } as any

      render(
        <EnvironmentContext.Provider value={environment}>
          <TestRedirect ComponentWithRedirection={CreateGameView} redirectUrl={"/game"} />
        </EnvironmentContext.Provider>,
      )

      userEvent.type(screen.getByRole("textbox", { name: "Your Name" }), userId)
      userEvent.click(screen.getByTestId("create-game-button"))

      return {
        emitMessage,
        callMessagehandler,
      }
    }

    it("emits messages to register the user socket and to create the game", () => {
      const { emitMessage } = userTypesNameAndPressesCreateGameButton()

      expect(emitMessage).toHaveBeenCalledWith(Messages.registerUserSocket({ userId }))
      expect(emitMessage).toHaveBeenCalledWith(Messages.createGame({ userId }))
    })

    it("redirects to the game page when the game is created", async () => {
      const { callMessagehandler } = userTypesNameAndPressesCreateGameButton()

      const gameId = "some-game-id"
      const game = { gameId, some: "game" }
      act(() => callMessagehandler("gameCreated")(game))

      const redirect = screen.getByTestId("redirect-url")
      expect(redirect.innerHTML).toEqual(expect.stringContaining(`/game?gameId=${gameId}&amp;userId=${userId}`))
    })
  })
})
