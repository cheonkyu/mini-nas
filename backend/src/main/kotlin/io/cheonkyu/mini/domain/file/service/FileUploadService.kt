package io.cheonkyu.mini.service

import io.cheonkyu.mini.domain.file.infrastructure.FileMetaRepository
import io.cheonkyu.mini.domain.file.model.FileMeta
import java.io.*
import java.nio.file.Files
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@Service
class FileUploadService(val repository: FileMetaRepository) {

  private val chunkDir = "/tmp/chunks/"

  fun uploadChunk(file: MultipartFile, fileId: String, chunkIndex: Int): String {
    val dir = File("$chunkDir$fileId")
    if (!dir.exists()) {
      dir.mkdirs()
    }

    val chunkFile = File(dir, "$chunkIndex.part")
    file.transferTo(chunkFile)

    return "$chunkIndex"
  }

  fun mergeChunks(fileId: String, fileName: String): String {
    val dir = File("$chunkDir$fileId")
    val partFiles =
            dir.listFiles { _, name -> name.endsWith(".part") }?.sortedBy {
              it.nameWithoutExtension.toInt()
            }
                    ?: throw FileNotFoundException()

    val mergedFile = File("/tmp/$fileName")
    BufferedOutputStream(FileOutputStream(mergedFile)).use { out ->
      for (part in partFiles) {
        Files.copy(part.toPath(), out)
      }
    }

    // Optionally delete parts
    partFiles.forEach { it.delete() }
    dir.delete()

    val data = FileMeta(fileId = fileId, name = fileName, size = mergedFile.length())
    repository.save(data)

    return "Merged to: ${mergedFile.absolutePath}"
  }
}
