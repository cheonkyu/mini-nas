package io.cheonkyu.mini.domain.file.strategy.processing

import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile

@Component
class ImageFileStrategy : FileProcessingStrategy {
  override fun supports(file: MultipartFile, extension: String): Boolean = isJpeg(file)

  override fun process(file: MultipartFile) {
    // 썸네일 생성, 카프카 이벤트 발행 등
  }

  private fun isJpeg(file: MultipartFile): Boolean {
    val inputStream = file.inputStream
    val header = ByteArray(3)
    inputStream.read(header)
    return header[0] == 0xFF.toByte() && header[1] == 0xD8.toByte() && header[2] == 0xFF.toByte()
  }
}
