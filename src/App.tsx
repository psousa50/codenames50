import { createMuiTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@material-ui/core"
import { cyan, teal } from "@material-ui/core/colors"
import React, { useState } from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRouter } from "./AppRouter"
import { Environment, EnvironmentContext } from "./environment"
import { ViewportProvider } from "./utils/viewPort"

export const App = () => {
  const defaultEnvironment: Environment = {
    soundOn: false,
    toggleSound: () => setEnvironment(e => ({ ...e, soundOn: !e.soundOn })),
  }

  const [environment, setEnvironment] = useState(defaultEnvironment)

  const theme = responsiveFontSizes(
    createMuiTheme({
      palette: {
        type: "dark",
        primary: teal,
        secondary: cyan,
      },
    }),
  )

  return (
    <React.StrictMode>
      <ViewportProvider>
        <EnvironmentContext.Provider value={environment}>
          <ThemeProvider theme={theme}>
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
