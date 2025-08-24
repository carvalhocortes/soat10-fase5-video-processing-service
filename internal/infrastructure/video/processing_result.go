package dto

// ProcessingResult representa a resposta do processamento (camada de domínio/app)
// Nota: manter tags JSON aqui é aceitável se for usado diretamente na resposta HTTP.
type ProcessingResult struct {
	Success    bool     `json:"success"`
	Message    string   `json:"message"`
	ZipPath    string   `json:"zip_path,omitempty"`
	FrameCount int      `json:"frame_count,omitempty"`
	Images     []string `json:"images,omitempty"`
}
