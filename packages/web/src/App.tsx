import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { blueGrey, lightBlue } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import useSound from "use-sound"
import { AppRouter } from "./AppRouter"
import { defaultConfig, Environment, EnvironmentContext } from "./environment"
import { ViewportProvider } from "./utils/viewPort"
import { socketMessaging } from "./socketMessaging"

const darkTheme = responsiveFontSizes(
  createMuiTheme({
    palette: {
      type: "dark",
      primary: lightBlue,
      secondary: blueGrey,
    },
  }),
)

export const App = () => {
  const savedConfig = JSON.parse(localStorage.getItem("config") || "{}")
  const defaultEnvironment: Environment = {
    config: { ...defaultConfig, ...savedConfig },
    useSound,
    toggleSound: () =>
      setEnvironment(e => {
        const newConfig = {
          ...e.config,
          soundOn: !e.config.soundOn,
        }
        localStorage.setItem("config", JSON.stringify(newConfig))
        return { ...e, config: newConfig }
      }),
    socketMessaging,
  }

  const [environment, setEnvironment] = useState(defaultEnvironment)

  return (
    <React.StrictMode>
      <ViewportProvider>
        <EnvironmentContext.Provider value={environment}>
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ThemeProvider>
        </EnvironmentContext.Provider>
      </ViewportProvider>
    </React.StrictMode>
  )
}
