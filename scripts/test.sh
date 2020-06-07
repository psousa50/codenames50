#!/bin/bash

JOIN_URL="http://localhost:4000/join?gameId=c5b6a79a-dec4-4745-af9e-00a55a748bea"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
