package main

import (
	"fmt"
	"log"
    "os"

	"github.com/gin-gonic/gin"
	"video-processor/handlers"
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
	r.Static("/static", "./public")
    r.StaticFile("/", "./public/index.html")

	// Endpoints
	r.POST("/upload", handlers.UploadHandler)
	r.GET("/download/:filename", handlers.DownloadHandler)
	r.GET("/api/status", handlers.StatusHandler)

	fmt.Println("🎬 Servidor iniciado na porta 8080")
	fmt.Println("📂 Acesse: http://localhost:8080")

	log.Fatal(r.Run(":8080"))
}

func createDirs() {
	dirs := []string{"uploads", "outputs", "temp"}
	for _, dir := range dirs {
		os.MkdirAll(dir, 0755)
	}
}
