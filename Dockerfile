FROM node:alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV PORT $PORT

EXPOSE $PORT

CMD [ "node", "dist/index.js" ]