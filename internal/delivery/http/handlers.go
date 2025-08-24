package httpapi

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	usecase "video-processor/internal/usecase/processing"
)

// RootPage serves the static HTML UI
func RootPage(c *gin.Context) {
	c.Header("Content-Type", "text/html")
	c.String(200, getHTMLForm())
}

// UploadHandler lida com o upload do vídeo, validação e aciona o processamento
func UploadHandler(c *gin.Context) {
	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(http.StatusBadRequest, usecase.ProcessingResult{
			Success: false,
			Message: "Erro ao receber arquivo: " + err.Error(),
		})
		return
	}
	defer file.Close()

	if !usecase.IsValidVideoFile(header.Filename) {
		c.JSON(http.StatusBadRequest, usecase.ProcessingResult{
			Success: false,
			Message: "Formato de arquivo não suportado. Use: mp4, avi, mov, mkv, wmv, flv, webm",
		})
		return
	}

	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s_%s", timestamp, header.Filename)
	videoPath := filepath.Join("uploads", filename)

	out, err := os.Create(videoPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, usecase.ProcessingResult{
			Success: false,
			Message: "Erro ao salvar arquivo: " + err.Error(),
		})
		return
	}
	defer out.Close()

	if _, err = io.Copy(out, file); err != nil {
		c.JSON(http.StatusInternalServerError, usecase.ProcessingResult{
			Success: false,
			Message: "Erro ao salvar arquivo: " + err.Error(),
		})
		return
	}

	result := usecase.ProcessVideo(videoPath, timestamp)
	if result.Success {
		_ = os.Remove(videoPath)
	}

	c.JSON(http.StatusOK, result)
}

// StatusHandler lista os arquivos de saída disponíveis
func StatusHandler(c *gin.Context) {
	files, err := filepath.Glob(filepath.Join("outputs", "*.zip"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao listar arquivos"})
		return
	}

	var results []map[string]interface{}
	for _, file := range files {
		info, err := os.Stat(file)
		if err != nil {
			continue
		}

		results = append(results, map[string]interface{}{
			"filename":     filepath.Base(file),
			"size":         info.Size(),
			"created_at":   info.ModTime().Format("2006-01-02 15:04:05"),
			"download_url": "/download/" + filepath.Base(file),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"files": results,
		"total": len(results),
	})
}

// DownloadHandler entrega o arquivo ZIP gerado
func DownloadHandler(c *gin.Context) {
	filename := c.Param("filename")
	filePath := filepath.Join("outputs", filename)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "Arquivo não encontrado"})
		return
	}

	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", "application/zip")

	c.File(filePath)
}
