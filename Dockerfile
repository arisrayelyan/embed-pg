# syntax=docker/dockerfile:1

FROM node:20-alpine as base

# requirments
RUN apk add --no-cache curl
RUN apk add --no-cache bash
RUN npm install -g pnpm@8.15.4
RUN npm install -g pm2@latest


ARG PORT='3000'
ARG DB_USERNAME=''
ARG DB_PASSWORD=''
ARG DB_NAME=''
ARG DB_HOST=''
ARG DB_PORT=''
ARG CORS_ORIGINS="http://localhost:3000"
ARG OPENAI_API_KEY=''
ARG OPEN_AI_MODEL=''
ARG OPEN_AI_API_ENDPOINT='https://api.openai.com/v1'

ENV NODE_ENV=development
ENV PORT=$PORT
ENV DB_USERNAME=$DB_USERNAME
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_NAME=$DB_NAME
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV CORS_ORIGINS=$CORS_ORIGINS
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV OPEN_AI_MODEL=$OPEN_AI_MODEL
ENV OPEN_AI_API_ENDPOINT=$OPEN_AI_API_ENDPOINT


WORKDIR /app 

COPY package.json pnpm-lock.yaml ./

# install dependencies with development dependencies
RUN pnpm i --frozen-lockfile

# copy source code
COPY . .


# run the build
RUN pnpm run build


FROM base as production

ENV NODE_ENV=production

COPY --from=base /app/dist ./app

EXPOSE ${PORT}

CMD ["pnpm", "run", "start"]