package io.cheonkyu.app

import org.springframework.data.repository.CrudRepository

interface FileStorageRepository : CrudRepository<FileStorage, Long> {}
