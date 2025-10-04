FROM node:latest

WORKDIR /dist

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN rm -rf src

EXPOSE 3333

CMD ["node", "dist/index.js"]