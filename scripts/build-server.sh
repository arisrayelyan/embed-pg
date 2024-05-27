#!/usr/bin/env bash
set -e # Exit on any error

echo "Building server image..."
TAG=${SHORT_SHA:-latest}

# build server image
docker build -t embed-pg:${TAG} -f Dockerfile --target production \
  --build-arg NODE_ENV="$NODE_ENV" \
  --build-arg PORT="$PORT" \
  --build-arg DB_USERNAME="$DB_USERNAME" \
  --build-arg DB_PASSWORD="$DB_PASSWORD" \
  --build-arg DB_NAME="$DB_NAME" \
  --build-arg DB_HOST="$DB_HOST" \
  --build-arg DB_PORT="$DB_PORT" \
  --build-arg CORS_ORIGINS="$CORS_ORIGINS" \
  --build-arg OPENAI_API_KEY="$OPENAI_API_KEY" \
  --build-arg OPEN_AI_MODEL="$OPEN_AI_MODEL" \
  --build-arg OPEN_AI_API_ENDPOINT="$OPEN_AI_API_ENDPOINT" .
