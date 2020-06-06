import { Typography } from "@material-ui/core"
import moment from "moment"
import React from "react"

interface TimeLeftProps {
  started: number
  timeoutMs: number
  onTimeout: () => void
}

export const TimeLeft: React.FC<TimeLeftProps> = ({ started, timeoutMs, onTimeout }) => {
  const [remaining, setRemaining] = React.useState(timeoutMs)

  React.useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - started
      if (elapsed > timeoutMs) {
        onTimeout()
      }
      setRemaining(Math.max(0, timeoutMs - elapsed))
    }, 1000)

    return () => clearInterval(timer)
  })

  return (
    <Typography variant="h5">
      {started > 0 ? moment(moment.duration(remaining).asMilliseconds()).format("mm:ss") : "--:--"}
    </Typography>
  )
}
