#!/bin/bash

yarn workspace @codenames50/core test

yarn workspace @psousa50/shared build
yarn workspace @codenames50/core build
yarn workspace @codenames50/messaging build

# Build web app with Vite
yarn workspace @codenames50/web build
