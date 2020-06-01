#!/bin/bash

JOIN_URL="http://localhost:3000/game?gameId=891150c1-6f38-46ec-ac84-126ccf6d0954"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
