FROM golang:1.21-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

COPY . .

RUN go mod tidy

RUN mkdir -p uploads outputs temp

EXPOSE 8080

CMD ["go", "run", "./cmd/server"]
