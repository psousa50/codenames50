#!/bin/bash

JOIN_URL="http://192.168.1.67:3000/join?gameId=71eeb78e-39aa-4c6f-beaf-a21378098407"
GAME_URL=${JOIN_URL/join/game}

open "$GAME_URL&userId=Carla"
open "$GAME_URL&userId=Vasco"
open "$GAME_URL&userId=Guiga"
