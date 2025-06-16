package io.cheonkyu.app

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
open class FileStorage(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) open var id: Long? = null,
        @Column open var fileId: String,
        @Column open var name: String,
        @Column open var size: Long,
        @Column open var createdAt: LocalDateTime? = null,
) {
  // @PrePersist
  // fun onCreate(fileStorage: FileStorage) {
  //   if (fileStorage.createdAt == null) {
  //     fileStorage.createdAt = LocalDateTime.now()
  //   }
  // }
}
