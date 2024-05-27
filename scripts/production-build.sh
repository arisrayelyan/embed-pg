#!/bin/bash
set -e # Exit on any error

echo "Starting production build... 🚧"

./node_modules/.bin/webpack --mode=production --config webpack.config.js

# Install production dependencies
cd ./dist && pnpm i -P

echo "Done! 🚀"