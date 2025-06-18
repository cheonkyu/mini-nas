package io.cheonkyu.mini.controller

import io.cheonkyu.app.nas.service.FileUploadService
import io.cheonkyu.mini.domain.file.model.FileMeta
import io.cheonkyu.mini.service.FileService
import java.io.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/files")
class FileController(val fileService: FileService, val fileUploadService: FileUploadService) {

  @GetMapping("/")
  fun getFiles(
          @RequestParam("page") page: Int = 0,
          @RequestParam("size") size: Int = 10
  ): ResponseEntity<Page<FileMeta>> {
    return ResponseEntity.ok(fileService.getFiles(PageRequest.of(page, size)))
  }

  @DeleteMapping("/{fileId}")
  fun deleteFile(
          @PathVariable("fileId") fileId: String,
  ): ResponseEntity<String> {
    return ResponseEntity.ok(fileId)
  }

  @PostMapping("/chunk")
  fun uploadChunk(
          @RequestParam("file") file: MultipartFile,
          @RequestParam("fileId") fileId: String,
          @RequestParam("chunkIndex") chunkIndex: Int
  ): ResponseEntity<String> {
    return ResponseEntity.ok(fileUploadService.uploadChunk(file, fileId, chunkIndex))
  }

  @PostMapping("/merge")
  fun mergeChunks(
          @RequestParam("fileId") fileId: String,
          @RequestParam("fileName") fileName: String
  ): ResponseEntity<String> {
    return ResponseEntity.ok(fileUploadService.mergeChunks(fileId, fileName))
  }
}
