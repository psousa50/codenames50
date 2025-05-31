import { Box, Typography } from "@mui/material"
import { common } from "@mui/material/colors"
import { Star as StarIcon } from "@mui/icons-material"
import React from "react"
import { GameModels } from "@codenames50/core"

export interface UserProps {
  userId: string
  team?: GameModels.Teams
  spyMaster?: boolean
}

export const User: React.FC<UserProps> = ({ userId, team, spyMaster }) => {
  const teamColor = team === GameModels.Teams.red ? "#f8931f" : team === GameModels.Teams.blue ? "#1b74ca" : "#bdbdbd"

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        padding: 1,
        borderRadius: 1,
        backgroundColor: teamColor,
        color: common.white,
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: spyMaster ? "bold" : "normal" }}>
        {userId}
      </Typography>
      {spyMaster && (
        <StarIcon
          sx={{
            fontSize: "18px",
            color: common.white,
            marginLeft: "4px",
          }}
        />
      )}
    </Box>
  )
}
