package main

import (
	"fmt"
	"log"
	"os"

	handlers "video-processor/internal/infrastructure"

	"github.com/gin-gonic/gin"
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

	r.GET("/", func(c *gin.Context) {
		c.File("internal/infrastructure/web/templates/index.html")
	})

	r.POST("/upload", handlers.HandleUpload)
	r.GET("/download/:filename", handlers.HandleDownload)
	r.GET("/api/status", handlers.HandleStatus)

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
