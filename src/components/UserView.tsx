import { Chip } from "@material-ui/core"
import FaceIcon from "@material-ui/icons/Face"
import React from "react"
import { Teams } from "../codenames-core/models"
import { blueTeamStyles, redTeamStyles } from "../utils/styles"

interface UserViewProps {
  userId?: string
  team?: Teams
  spyMaster?: boolean
}

const RedChip = redTeamStyles(Chip)
const BlueChip = blueTeamStyles(Chip)

export const UserView: React.FC<UserViewProps> = ({ userId, team, spyMaster }) =>
  userId ? (
    team === Teams.red ? (
      <RedChip icon={<FaceIcon />} label={userId} variant={spyMaster ? "default" : "outlined"} />
    ) : team === Teams.blue ? (
      <BlueChip icon={<FaceIcon />} label={userId} variant={spyMaster ? "default" : "outlined"} />
    ) : (
      <Chip icon={<FaceIcon />} label={userId} variant={spyMaster ? "default" : "outlined"} />
    )
  ) : null
