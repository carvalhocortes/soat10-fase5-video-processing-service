package handlers

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type ProcessingResult struct {
	Success    bool     `json:"success"`
	Message    string   `json:"message"`
	ZipPath    string   `json:"zip_path,omitempty"`
	FrameCount int      `json:"frame_count,omitempty"`
	Images     []string `json:"images,omitempty"`
}

// HandleUpload recebe o upload, processa os frames e retorna o ZIP gerado
func HandleUpload(c *gin.Context) {
	file, header, err := c.Request.FormFile("video")
	if err != nil {
		c.JSON(400, ProcessingResult{Success: false, Message: "Erro ao receber arquivo: " + err.Error()})
		return
	}
	defer file.Close()

	if !isValidVideoFile(header.Filename) {
		c.JSON(400, ProcessingResult{Success: false, Message: "Formato de arquivo não suportado. Use: mp4, avi, mov, mkv"})
		return
	}

	timestamp := time.Now().Format("20060102_150405")
	filename := fmt.Sprintf("%s_%s", timestamp, header.Filename)
	videoPath := filepath.Join("uploads", filename)

	out, err := os.Create(videoPath)
	if err != nil {
		c.JSON(500, ProcessingResult{Success: false, Message: "Erro ao salvar arquivo: " + err.Error()})
		return
	}
	defer out.Close()

	if _, err = io.Copy(out, file); err != nil {
		c.JSON(500, ProcessingResult{Success: false, Message: "Erro ao salvar arquivo: " + err.Error()})
		return
	}

	result := processVideo(videoPath, timestamp)

	if result.Success {
		_ = os.Remove(videoPath)
	}

	c.JSON(200, result)
}

func processVideo(videoPath, timestamp string) ProcessingResult {
	tempDir := filepath.Join("temp", timestamp)
	_ = os.MkdirAll(tempDir, 0755)
	defer os.RemoveAll(tempDir)

	framePattern := filepath.Join(tempDir, "frame_%04d.png")

	cmd := exec.Command("ffmpeg", "-i", videoPath, "-vf", "fps=1", "-y", framePattern)

	if output, err := cmd.CombinedOutput(); err != nil {
		return ProcessingResult{Success: false, Message: fmt.Sprintf("Erro no ffmpeg: %s\nOutput: %s", err.Error(), string(output))}
	}

	frames, err := filepath.Glob(filepath.Join(tempDir, "*.png"))
	if err != nil || len(frames) == 0 {
		return ProcessingResult{Success: false, Message: "Nenhum frame foi extraído do vídeo"}
	}

	zipFilename := fmt.Sprintf("frames_%s.zip", timestamp)
	zipPath := filepath.Join("outputs", zipFilename)

	if err := createZipFile(frames, zipPath); err != nil {
		return ProcessingResult{Success: false, Message: "Erro ao criar arquivo ZIP: " + err.Error()}
	}

	imageNames := make([]string, len(frames))
	for i, frame := range frames {
		imageNames[i] = filepath.Base(frame)
	}

	return ProcessingResult{
		Success:    true,
		Message:    fmt.Sprintf("Processamento concluído! %d frames extraídos.", len(frames)),
		ZipPath:    zipFilename,
		FrameCount: len(frames),
		Images:     imageNames,
	}
}

func createZipFile(files []string, zipPath string) error {
	zipFile, err := os.Create(zipPath)
	if err != nil {
		return err
	}
	defer zipFile.Close()

	zipWriter := zip.NewWriter(zipFile)
	defer zipWriter.Close()

	for _, f := range files {
		if err := addFileToZip(zipWriter, f); err != nil {
			return err
		}
	}

	return nil
}

func addFileToZip(zipWriter *zip.Writer, filename string) error {
	file, err := os.Open(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	info, err := file.Stat()
	if err != nil {
		return err
	}

	header, err := zip.FileInfoHeader(info)
	if err != nil {
		return err
	}

	header.Name = filepath.Base(filename)
	header.Method = zip.Deflate

	writer, err := zipWriter.CreateHeader(header)
	if err != nil {
		return err
	}

	_, err = io.Copy(writer, file)
	return err
}

func isValidVideoFile(filename string) bool {
	ext := strings.ToLower(filepath.Ext(filename))
	validExts := []string{".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm"}
	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}
	return false
}
