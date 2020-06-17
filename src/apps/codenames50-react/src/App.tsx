import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { blueGrey, lightBlue } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRouter } from "./AppRouter"
import { Environment, EnvironmentContext } from "./environment"
import { ViewportProvider } from "./utils/viewPort"

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
  const defaultEnvironment: Environment = {
    soundOn: (localStorage.getItem("soundOn") || "") === "true",
    toggleSound: () =>
      setEnvironment(e => {
        const soundOn = !e.soundOn
        localStorage.setItem("soundOn", soundOn ? "true" : "false")
        return { ...e, soundOn }
      }),
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
