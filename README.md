# Video Processing Service

Serviço HTTP simples em Go para extrair frames de um vídeo usando FFmpeg e entregar um arquivo ZIP com as imagens geradas. Inclui uma página HTML para upload e acompanhamento do status.

## Requisitos

- Go 1.21+ (para rodar localmente sem Docker)
- FFmpeg instalado e disponível no PATH (apenas para execução local)
- Docker (opcional, para rodar em contêiner)

## Como executar localmente (sem Docker)

1. Instale as dependências do Go:

```bash
go mod download
```

2. Garanta que o FFmpeg esteja instalado e acessível (ex.: `ffmpeg -version`).

3. Execute a aplicação:

```bash
go run .
```

4. Acesse no navegador:

- http://localhost:8080

A aplicação criará (se não existirem) os diretórios `uploads/`, `outputs/`, `temp/` e `public/` no diretório do projeto. A página inicial é servida a partir de `public/index.html`.

## Como executar com Docker

A imagem utiliza Alpine e instala o FFmpeg dentro do contêiner.

1. Build da imagem:

```bash
docker build -t video-processing-service .
```

2. Executar o contêiner mapeando a porta e (opcionalmente) os diretórios de saída/entrada:

```bash
docker run --rm \
  -p 8080:8080 \
  video-processing-service
```

3. Acesse:

- http://localhost:8080

Observações:

- Os volumes são opcionais; ao mapeá-los, os arquivos gerados ficam persistidos na sua máquina.
- O Dockerfile atual é simples e voltado a desenvolvimento (usa `go run`). Para produção, considere um build multi-stage com binário estático e imagem final mínima.

## Endpoints

- GET `/` — Página HTML com formulário de upload.
- POST `/upload` — Recebe um formulário `multipart/form-data` com o campo `video` (arquivo). Processa o vídeo, extrai frames (1 fps) e retorna um JSON com o status e o nome do ZIP gerado.
- GET `/download/:filename` — Baixa o arquivo ZIP gerado (de `outputs/`).
- GET `/api/status` — Lista os arquivos ZIP disponíveis em `outputs/` com metadados básicos.

Diretórios expostos estaticamente:

- `/uploads` → `./uploads`
- `/outputs` → `./outputs`

## Fluxo de processamento

1. Upload do vídeo ➜ salvo em `uploads/`.
2. Extração de frames com FFmpeg (1 frame por segundo) em um diretório temporário `temp/<timestamp>/`.
3. Compactação dos frames em `outputs/frames_<timestamp>.zip`.
4. Limpeza do diretório temporário e remoção do arquivo de vídeo original (quando sucesso).

## Resolução de problemas

- `command not found: go`: Instale o Go (https://go.dev/dl/) ou use Docker.
- `ffmpeg: command not found`: Instale o FFmpeg (macOS via Homebrew: `brew install ffmpeg`) ou use Docker.
- Permissões de escrita: garanta que o processo tenha permissão para criar/alterar `uploads/`, `outputs/` e `temp/`.
- Erros de codec/formato: alguns vídeos podem falhar na extração se o FFmpeg não suportar o codec; converta o vídeo antes ou ajuste os parâmetros do FFmpeg.
- Docker build falhou: verifique logs do build e conectividade para baixar módulos Go e pacotes do Alpine; tente `docker build --no-cache`.

## Desenvolvimento

- Código principal: `main.go` (boot do servidor e rotas)
- Rotas:
  - `routes_upload.go` (upload e processamento)
  - `routes_download.go` (download do ZIP)
  - `routes_status.go` (listagem de resultados)
- Frontend estático: `public/index.html`

## Licença

Este projeto utiliza a licença disponível em `LICENSE`.
