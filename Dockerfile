
FROM node:alpine

WORKDIR /usr/src/bananabot
COPY package*.json ./
RUN npm install
COPY . .

WORKDIR /usr/src/bananabot
EXPOSE 80
CMD [ "node", "index.js" ]