package main

import (
    "os"
    "path/filepath"

    "github.com/gin-gonic/gin"
)

func handleStatus(c *gin.Context) {
    files, err := filepath.Glob(filepath.Join("outputs", "*.zip"))
    if err != nil {
        c.JSON(500, gin.H{"error": "Erro ao listar arquivos"})
        return
    }

    var results []map[string]interface{}
    for _, file := range files {
        if info, err := os.Stat(file); err == nil {
            results = append(results, map[string]interface{}{
                "filename":     filepath.Base(file),
                "size":         info.Size(),
                "created_at":   info.ModTime().Format("2006-01-02 15:04:05"),
                "download_url": "/download/" + filepath.Base(file),
            })
        }
    }

    c.JSON(200, gin.H{"files": results, "total": len(results)})
}
