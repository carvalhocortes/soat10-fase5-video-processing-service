package main

import (
    "fmt"
    "log"

    "github.com/gin-gonic/gin"
    httpapi "video-processor/internal/delivery/http"
)

func main() {
    createDirs()

    r := gin.Default()

    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    })

    r.Static("/uploads", "./uploads")
    r.Static("/outputs", "./outputs")

    r.GET("/", httpapi.RootPage)

    // Endpoints
    r.POST("/upload", httpapi.UploadHandler)
    r.GET("/download/:filename", httpapi.DownloadHandler)
    r.GET("/api/status", httpapi.StatusHandler)

    fmt.Println("🎬 Servidor iniciado na porta 8080")
    fmt.Println("📂 Acesse: http://localhost:8080")

    log.Fatal(r.Run(":8080"))
}
