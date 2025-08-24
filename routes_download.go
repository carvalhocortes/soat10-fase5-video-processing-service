package main

import (
    "os"
    "path/filepath"

    "github.com/gin-gonic/gin"
)

func handleDownload(c *gin.Context) {
    filename := c.Param("filename")
    filePath := filepath.Join("outputs", filename)

    if _, err := os.Stat(filePath); os.IsNotExist(err) {
        c.JSON(404, gin.H{"error": "Arquivo não encontrado"})
        return
    }

    c.Header("Content-Description", "File Transfer")
    c.Header("Content-Transfer-Encoding", "binary")
    c.Header("Content-Disposition", "attachment; filename="+filename)
    c.Header("Content-Type", "application/zip")

    c.File(filePath)
}
