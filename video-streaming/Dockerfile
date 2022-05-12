FROM node:14.16.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i --only=production

COPY ./src ./src

COPY ./videos ./videos

CMD npx wait-port rabbit:5672 && npm start