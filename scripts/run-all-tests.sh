#!/bin/bash

yarn workspace @psousa50/shared exec yarn tsc
yarn workspace codenames50-core exec yarn tsc

yarn workspace codenames50-server exec yarn test
