#!/bin/bash

gameID=$1

open "http://localhost:3000/game?gameId=$gameID&userId=Pedro"
open "http://localhost:3000/game?gameId=$gameID&userId=Carla"
open "http://localhost:3000/game?gameId=$gameID&userId=Vasco"
open "http://localhost:3000/game?gameId=$gameID&userId=Guiga"
