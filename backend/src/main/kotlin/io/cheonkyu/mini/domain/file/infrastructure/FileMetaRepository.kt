package io.cheonkyu.mini.domain.file.infrastructure

import io.cheonkyu.mini.domain.file.model.FileMeta
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.CrudRepository

interface FileMetaRepository : CrudRepository<FileMeta, Long> {
  fun findAll(pageable: Pageable): Page<FileMeta>
}
