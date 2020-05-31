import React from "react"

interface ViewPort {
  width?: number
  height?: number
}

const ViewportContext = React.createContext<ViewPort>({})

const getViewport = () => ({ width: window.innerWidth, height: window.innerHeight })

export const ViewportProvider: React.FC = ({ children }) => {
  const [viewport, setViewport] = React.useState(getViewport())

  const onResize = () => {
    setViewport(getViewport())
  }

  React.useEffect(() => {
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  return <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>
}

export const useViewport = () => React.useContext(ViewportContext)
