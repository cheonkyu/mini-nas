package io.cheonkyu.mini.service

import io.cheonkyu.mini.domain.file.infrastructure.FileMetaRepository
import io.cheonkyu.mini.domain.file.model.FileMeta
import java.io.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@Service
class FileService(val repository: FileMetaRepository) {
  @Transactional(readOnly = true)
  fun getFiles(pageable: Pageable): Page<FileMeta> {
    return repository.findAll(pageable)
  }
}
