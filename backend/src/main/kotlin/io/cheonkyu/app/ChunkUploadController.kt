package io.cheonkyu.app

import java.io.*
import java.nio.file.Files
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/upload")
class ChunkUploadController(val repository: FileStorageRepository) {

  private val chunkDir = "/tmp/chunks/"

  @PostMapping("/chunk")
  fun uploadChunk(
          @RequestParam("file") file: MultipartFile,
          @RequestParam("fileId") fileId: String,
          @RequestParam("chunkIndex") chunkIndex: Int
  ): ResponseEntity<String> {
    val dir = File("$chunkDir$fileId")
    if (!dir.exists()) {
      dir.mkdirs()
    }

    val chunkFile = File(dir, "$chunkIndex.part")
    file.transferTo(chunkFile)

    return ResponseEntity.ok("Chunk $chunkIndex received.")
  }

  @PostMapping("/merge")
  fun mergeChunks(
          @RequestParam("fileId") fileId: String,
          @RequestParam("fileName") fileName: String
  ): ResponseEntity<String> {
    val dir = File("$chunkDir$fileId")
    val partFiles =
            dir.listFiles { _, name -> name.endsWith(".part") }?.sortedBy {
              it.nameWithoutExtension.toInt()
            }
                    ?: return ResponseEntity.badRequest().body("No chunks found.")

    val mergedFile = File("/tmp/$fileName")
    BufferedOutputStream(FileOutputStream(mergedFile)).use { out ->
      for (part in partFiles) {
        Files.copy(part.toPath(), out)
      }
    }

    // Optionally delete parts
    partFiles.forEach { it.delete() }
    dir.delete()

    val data = FileStorage(fileId = fileId, name = fileName, size = 100L)
    repository.save(data)

    return ResponseEntity.ok("Merged to: ${mergedFile.absolutePath}")
  }
}
