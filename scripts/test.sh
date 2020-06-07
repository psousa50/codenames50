#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=5f67fc72-d688-4b75-b6f0-d7d442e9f82e"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
