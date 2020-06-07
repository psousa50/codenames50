import { Typography } from "@material-ui/core"
import moment from "moment"
import React from "react"

interface TimeLeftProps {
  started: number
  responseTimeoutSec: number
  onTimeout: () => void
}

export const TimeLeft: React.FC<TimeLeftProps> = ({ started, responseTimeoutSec, onTimeout }) => {
  const [remaining, setRemaining] = React.useState(responseTimeoutSec)
  const [timedOut, setTimedOut] = React.useState(false)

  React.useEffect(() => {
    setTimedOut(false)
  }, [started])

  React.useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - started
      if (!timedOut && elapsed > responseTimeoutSec * 1000) {
        setTimedOut(true)
        onTimeout()
      }
      setRemaining(Math.max(0, responseTimeoutSec * 1000 - elapsed))
    }, 1000)

    return () => clearInterval(timer)
  })

  return (
    <Typography variant="h5">
      {started > 0 ? moment(moment.duration(remaining).asMilliseconds()).format("mm:ss") : "--:--"}
    </Typography>
  )
}
