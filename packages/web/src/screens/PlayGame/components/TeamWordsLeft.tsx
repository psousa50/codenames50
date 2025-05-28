import { GameModels } from "@codenames50/core"
import { Theme } from "@material-ui/core"
import { common } from "@material-ui/core/colors"
import Typography from "@material-ui/core/Typography"
import { createStyles, makeStyles } from "@material-ui/styles"
import React from "react"
import { teamColor } from "../../../utils/styles"

interface TeamWordsLeftProps {
  team?: GameModels.Teams
  count?: number
  size?: "normal" | "small"
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    count: {
      display: "flex",
      borderRadius: "50%",
      alignItems: "center",
      justifyContent: "center",
      userSelect: "none",
      color: common.white,
    },
    normal: {
      width: "min(50px, 12vw)",
      height: "min(50px, 12vw)",
    },
    small: {
      width: "min(35px, 8vw)",
      height: "min(35px, 8vw)",
    },
  }),
)

export const TeamWordsLeft: React.FC<TeamWordsLeftProps> = ({ count, team, size = "normal" }) => {
  const classes = useStyles()

  const styles = {
    count: {
      backgroundColor: teamColor(team),
    },
  }

  const sizeClass = size === "small" ? classes.small : classes.normal
  const variant = size === "small" ? "h5" : "h4"

  return count !== undefined ? (
    <Typography variant={variant} style={styles.count} className={`${classes.count} ${sizeClass}`}>
      {count.toString()}
    </Typography>
  ) : null
}
