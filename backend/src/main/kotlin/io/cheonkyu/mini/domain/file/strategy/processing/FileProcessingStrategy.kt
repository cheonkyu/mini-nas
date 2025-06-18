package io.cheonkyu.mini.domain.file.strategy.processing

import org.springframework.web.multipart.MultipartFile

interface FileProcessingStrategy {
  fun supports(file: MultipartFile, extension: String): Boolean
  fun process(file: MultipartFile)
}
