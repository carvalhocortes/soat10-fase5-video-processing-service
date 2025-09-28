FROM node:latest

WORKDIR /dist

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN rm -rf src

EXPOSE 3333

CMD ["node", "dist/index.js"]
