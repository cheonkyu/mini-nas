package io.cheonkyu.mini.domain.file.strategy.processing

import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

@Component
class TextFileStrategy : FileProcessingStrategy {
  override fun supports(file: MultipartFile, extension: String): Boolean = true

  override fun process(file: MultipartFile) {
    // 썸네일 생성, 카프카 이벤트 발행 등
  }
}
