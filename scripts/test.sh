#!/bin/bash

JOIN_URL=http://localhost:3000/join?gameId=4cb9e55f-bb2e-453e-8da3-0b244e4678ef
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
