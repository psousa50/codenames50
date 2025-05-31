import { createTheme, CssBaseline, responsiveFontSizes, ThemeProvider } from "@mui/material"
import { common, grey } from "@mui/material/colors"
import React from "react"
import { BrowserRouter } from "react-router-dom"
import { AppRouter } from "./AppRouter"
import { EnvironmentContext, useEnvironment } from "./environment"
import { ViewportProvider } from "./utils/viewPort"
import { redColor, blueColor, backgroundColor } from "./utils/styles"

const darkTheme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: "dark",
      primary: {
        main: blueColor,
      },
      secondary: {
        main: redColor,
      },
      background: {
        default: backgroundColor,
        paper: grey[800],
      },
      text: {
        primary: common.white,
        secondary: grey[300],
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: backgroundColor,
            fontFamily: "\"Roboto\", \"Helvetica\", \"Arial\", sans-serif",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
          },
          contained: {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: grey[800],
            borderRadius: 12,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: grey[800],
            borderRadius: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          },
        },
      },
    },
    shape: {
      borderRadius: 8,
    },
    spacing: 8,
  }),
)

export const App = () => {
  const environment = useEnvironment()

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
