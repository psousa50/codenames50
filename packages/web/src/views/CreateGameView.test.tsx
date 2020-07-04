import { Messages } from "@codenames50/messaging"
import { fireEvent, render } from "@testing-library/react"
import React from "react"
import { BrowserRouter, Route, Switch } from "react-router-dom"
import { Environment, EnvironmentContext, SocketMessaging } from "../environment"
import { CreateGameView } from "./CreateGameView"

interface TestRedirectProps {
  ComponentWithRedirection: React.ComponentType
  redirectUrl: string
}
const TestRedirect: React.FC<TestRedirectProps> = ({ ComponentWithRedirection, redirectUrl }) => (
  <BrowserRouter>
    <Switch>
      <Route path="/" exact={true} render={() => <ComponentWithRedirection />} />
      <Route path={redirectUrl} render={({ location: { pathname, search } }) => <div>{`${pathname}${search}`}</div>} />
    </Switch>
  </BrowserRouter>
)

type UseSocketMessagingTestParams = {
  on: string
  callHandlerFor: string
  with: Record<string, unknown>
}
const useSocketMessagingTest = (parameters: UseSocketMessagingTestParams): SocketMessaging => {
  const useSocketMessaging: SocketMessaging = (_, onConnect) => {
    const [gameCreatedHandler, setGameCreatedHandler] = React.useState<any>()

    const addMessageHandler = jest.fn((messageHandler: Messages.GameMessageHandler) => {
      setGameCreatedHandler((handler: any) =>
        messageHandler.type === parameters.callHandlerFor ? messageHandler.handler : handler,
      )
    })
    const emitMessage = jest.fn((message: Messages.GameMessage) =>
      message.type === parameters.on && gameCreatedHandler ? gameCreatedHandler(parameters.with) : undefined,
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    React.useEffect(() => onConnect(), [])

    return [emitMessage, addMessageHandler]
  }

  return useSocketMessaging
}

describe("CreateGameView", () => {
  it("creates a game for a user and redirects to the game page", () => {
    const game = { gameId: "game-id", some: "game" }
    const useSocketMessaging = useSocketMessagingTest({ on: "createGame", callHandlerFor: "gameCreated", with: game })

    const environment: Environment = {
      useSocketMessaging,
    } as any

    const { container, getByTestId, getByRole } = render(
      <EnvironmentContext.Provider value={environment}>
        <TestRedirect ComponentWithRedirection={CreateGameView} redirectUrl={"/game"} />
      </EnvironmentContext.Provider>,
    )

    fireEvent.change(getByRole("textbox", { name: "Your Name" }), { target: { value: "Some Name" } })

    fireEvent.click(getByTestId("create-game-button"))

    expect(container.innerHTML).toEqual(expect.stringContaining("/game?gameId=game-id&amp;userId=Some Name"))
  })
})
