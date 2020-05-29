#!/bin/bash

JOIN_URL=http://localhost:3000/join?gameId=cde20ffe-51d0-453c-ba4a-62dcf549a075
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
