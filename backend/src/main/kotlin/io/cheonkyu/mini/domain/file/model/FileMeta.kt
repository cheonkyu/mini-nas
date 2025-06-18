package io.cheonkyu.mini.domain.file.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
open class FileMeta(
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) open var id: Long? = null,
        @Column open var fileId: String,
        @Column open var name: String,
        @Column open var size: Long,
        @Column open var createdAt: LocalDateTime? = null,
) {}
