package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	createDirs()

	r := gin.Default()

	// CORS simples
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

	// Static folders for generated content
	r.Static("/uploads", "./uploads")
	r.Static("/outputs", "./outputs")

	// Serve HTML landing page
	r.GET("/", func(c *gin.Context) {
		c.File("public/index.html")
	})

	// API routes
	r.POST("/upload", handleVideoUpload)
	r.GET("/download/:filename", handleDownload)
	r.GET("/api/status", handleStatus)

	fmt.Println("🎬 Servidor iniciado na porta 8080")
	fmt.Println("📂 Acesse: http://localhost:8080")

	log.Fatal(r.Run(":8080"))
}

func createDirs() {
	dirs := []string{"uploads", "outputs", "temp", "public"}
	for _, dir := range dirs {
		os.MkdirAll(dir, 0755)
	}
}
