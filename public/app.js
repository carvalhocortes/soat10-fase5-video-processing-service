document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById("videoFile");
    const file = fileInput.files[0];

    if (!file) {
      showResult("Selecione um arquivo de vídeo!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);

    showLoading(true);
    hideResult();

    try {
      const response = await fetch("/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        showResult(
          result.message +
            '<br><br><a href="/download/' +
            result.zip_path +
            '" class="download-btn">⬇️ Download ZIP</a>',
          "success"
        );
        loadFilesList();
      } else {
        showResult("Erro: " + result.message, "error");
      }
    } catch (error) {
      showResult("Erro de conexão: " + error.message, "error");
    } finally {
      showLoading(false);
    }
  });

function showResult(message, type) {
  const result = document.getElementById("result");
  result.innerHTML = message;
  result.className = "result " + type;
  result.style.display = "block";
}

function hideResult() {
  document.getElementById("result").style.display = "none";
}

function showLoading(show) {
  document.getElementById("loading").style.display = show ? "block" : "none";
}

async function loadFilesList() {
  try {
    const response = await fetch("/api/status");
    const data = await response.json();

    const filesList = document.getElementById("filesList");
    if (data.files && data.files.length > 0) {
      filesList.innerHTML = data.files
        .map(
          (file) =>
            '<div class="file-item">' +
            "<span>" +
            file.filename +
            " (" +
            formatFileSize(file.size) +
            ") - " +
            file.created_at +
            "</span>" +
            '<a href="' +
            file.download_url +
            '" class="download-btn">⬇️ Download</a>' +
            "</div>"
        )
        .join("");
    } else {
      filesList.innerHTML = "<p>Nenhum arquivo processado ainda.</p>";
    }
  } catch (error) {
    document.getElementById("filesList").innerHTML =
      "<p>Erro ao carregar arquivos.</p>";
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Carregar lista de arquivos ao inicializar
loadFilesList();
