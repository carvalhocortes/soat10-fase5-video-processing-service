import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

export class VideoProcessingService {
  async extractFrames(videoPath: string, outputDir: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Criar diretório de saída se não existir
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      ffmpeg(videoPath)
        .outputOptions([
          '-vf fps=1', // Extrair 1 frame por segundo
          '-f image2',
          '-qscale:v 2', // Qualidade da imagem
        ])
        .output(path.join(outputDir, 'frame_%04d.jpg'))
        .on('start', (commandLine: string) => {
          console.log('FFmpeg started with command:', commandLine);
        })
        .on('progress', (progress: any) => {
          console.log(`Processing: ${progress.percent}% done`);
        })
        .on('end', () => {
          // Listar todos os frames gerados
          const files = fs.readdirSync(outputDir);
          const frameFiles = files
            .filter((file) => file.startsWith('frame_') && file.endsWith('.jpg'))
            .map((file) => path.join(outputDir, file));

          console.log(`Frame extraction completed. Generated ${frameFiles.length} frames.`);
          resolve(frameFiles);
        })
        .on('error', (error: any) => {
          console.error('Error during frame extraction:', error);
          reject(new Error(`FFmpeg error: ${error.message}`));
        })
        .run();
    });
  }

  async createZipFromFrames(frameFiles: string[], zipPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }, // Nível máximo de compressão
      });

      output.on('close', () => {
        console.log(`ZIP file created: ${archive.pointer()} total bytes`);
        resolve();
      });

      archive.on('error', (error) => {
        console.error('Error creating ZIP file:', error);
        reject(error);
      });

      archive.pipe(output);

      // Adicionar cada frame ao ZIP
      frameFiles.forEach((framePath, index) => {
        const frameName = `frame_${String(index + 1).padStart(4, '0')}.jpg`;
        archive.file(framePath, { name: frameName });
      });

      archive.finalize();
    });
  }

  cleanupTempFiles(paths: string[]): void {
    paths.forEach((filePath) => {
      try {
        if (fs.existsSync(filePath)) {
          if (fs.lstatSync(filePath).isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error);
      }
    });
  }
}
