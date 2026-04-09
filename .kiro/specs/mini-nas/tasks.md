# Implementation Plan: Mini-NAS

## Overview

Turborepo 모노레포 구조에서 NestJS + Fastify 백엔드와 Svelte 프론트엔드를 단계적으로 구현한다.
각 태스크는 이전 태스크 위에 점진적으로 쌓이며, 마지막에 모든 컴포넌트를 연결한다.

## Tasks

- [ ] 1. 모노레포 프로젝트 구조 및 공통 타입 설정
  - Turborepo 워크스페이스 초기화 (`apps/backend`, `apps/frontend`, `packages/shared-types`)
  - 공통 TypeScript 인터페이스 정의: `AuthService`, `VirtualFilesystem`, `FileManager`, `ShareService`, `SyncEngine`, `StorageProvider`
  - 공통 데이터 모델 타입 정의: `FileEntry`, `FileMetadata`, `TokenPayload`, `SyncConfig`, `ShareOptions`
  - Jest + fast-check 테스트 환경 설정 (백엔드), Vitest 설정 (프론트엔드)
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [ ] 2. 데이터베이스 스키마 및 마이그레이션 설정
  - [ ] 2.1 TypeORM 또는 Drizzle ORM 설정 및 SQLite/PostgreSQL 이중 지원 구성
    - `users`, `token_blacklist`, `storage_providers`, `file_metadata`, `share_links`, `sync_jobs`, `sync_conflicts`, `upload_sessions` 테이블 마이그레이션 작성
    - _Requirements: 1.5, 2.4, 3.4, 3.6, 7.3, 8.1_
  - [ ]* 2.2 데이터 모델 유효성 검증 속성 테스트 작성
    - **Property 4: bcrypt 해시 저장** - 임의 비밀번호로 사용자 생성 시 DB 저장값이 bcrypt 해시인지 검증
    - **Property 17: 인증 정보 암호화** - 임의 인증 정보 저장 시 AES-256-GCM 암호화 여부 검증
    - **Validates: Requirements 1.5, 6.3**

- [ ] 3. 인증 서비스 구현
  - [ ] 3.1 `AuthModule` 구현: 로그인, 로그아웃, 토큰 검증, 토큰 갱신 엔드포인트
    - bcrypt 비밀번호 해시/검증 로직
    - JWT 발급 (만료 24시간), 토큰 블랙리스트 DB 저장
    - 비밀번호 5회 실패 시 15분 계정 잠금 로직
    - NestJS Guard (`JwtAuthGuard`) 구현
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [ ]* 3.2 Property 1 속성 테스트: 유효한 자격증명으로 JWT 토큰 발급
    - **Property 1: 유효한 자격증명으로 로그인 시 JWT 토큰 발급**
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 3.3 Property 2 속성 테스트: 유효하지 않은 토큰 거부
    - **Property 2: 유효하지 않은 토큰 거부**
    - **Validates: Requirements 1.3, 1.6**
  - [ ]* 3.4 Property 3 속성 테스트: 비밀번호 5회 실패 시 계정 잠금
    - **Property 3: 비밀번호 5회 실패 시 계정 잠금**
    - **Validates: Requirements 1.4**
  - [ ]* 3.5 인증 서비스 단위 테스트
    - 로그인/로그아웃 플로우, 토큰 갱신, 잠금 해제 타이밍 엣지 케이스
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 4. Checkpoint - 인증 모듈 테스트 통과 확인
  - 모든 인증 관련 테스트가 통과하는지 확인하고, 문제가 있으면 사용자에게 질문한다.

- [ ] 5. 스토리지 프로바이더 추상화 및 로컬 디스크 구현
  - [ ] 5.1 `StorageProvider` 인터페이스 및 `LocalStorageProvider` 구현
    - `connect`, `disconnect`, `list`, `read`, `write`, `delete`, `move`, `getMetadata` 메서드 구현
    - AES-256-GCM 인증 정보 암호화/복호화 유틸리티 구현
    - _Requirements: 2.1, 6.3_
  - [ ]* 5.2 Property 17 속성 테스트: 인증 정보 암호화
    - **Property 17: 스토리지 프로바이더 인증 정보 암호화**
    - **Validates: Requirements 6.3**

- [ ] 6. 가상 파일 시스템(VFS) 구현
  - [ ] 6.1 `VirtualFilesystem` 모듈 구현
    - 마운트/언마운트 로직, 마운트 경로 레지스트리 관리
    - `listDirectory`, `getMetadata`, `getMountStatus` 구현
    - 프로바이더 오프라인 격리 처리 (연결 실패 시 해당 경로만 `offline` 표시)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [ ]* 6.2 Property 5 속성 테스트: 마운트/언마운트 라운드트립
    - **Property 5: 스토리지 프로바이더 마운트/언마운트 라운드트립**
    - **Validates: Requirements 2.2, 2.3**
  - [ ]* 6.3 Property 6 속성 테스트: 파일 메타데이터 완전성
    - **Property 6: 파일 메타데이터 완전성**
    - **Validates: Requirements 2.4**
  - [ ]* 6.4 Property 7 속성 테스트: 프로바이더 오프라인 격리
    - **Property 7: 프로바이더 오프라인 격리**
    - **Validates: Requirements 2.5**

- [ ] 7. 파일 업로드 구현
  - [ ] 7.1 `FileManager` 업로드 엔드포인트 구현
    - Fastify multipart 플러그인으로 스트리밍 업로드 처리
    - 파일명 충돌 시 타임스탬프 추가 로직 (`overwritePolicy: 'rename'`)
    - 업로드 완료 후 MD5 체크섬 계산 및 메타데이터 저장
    - _Requirements: 3.1, 3.5, 3.6_
  - [ ] 7.2 청크 업로드 및 재개 로직 구현
    - `upload_sessions` 테이블 기반 청크 상태 추적
    - `resumeToken` 발급 및 재개 엔드포인트 구현
    - 동시 업로드 5개 제한 (세마포어 또는 큐 기반)
    - _Requirements: 3.2, 3.3, 3.4_
  - [ ]* 7.3 Property 8 속성 테스트: 파일 업로드/다운로드 라운드트립
    - **Property 8: 파일 업로드/다운로드 라운드트립**
    - **Validates: Requirements 3.1, 4.1**
  - [ ]* 7.4 Property 9 속성 테스트: 청크 업로드 재개
    - **Property 9: 청크 업로드 재개**
    - **Validates: Requirements 3.4**
  - [ ]* 7.5 Property 10 속성 테스트: 파일명 충돌 시 타임스탬프 추가
    - **Property 10: 파일명 충돌 시 타임스탬프 추가**
    - **Validates: Requirements 3.5**
  - [ ]* 7.6 Property 11 속성 테스트: 업로드 완료 후 MD5 체크섬 저장
    - **Property 11: 업로드 완료 후 MD5 체크섬 저장**
    - **Validates: Requirements 3.6**

- [ ] 8. 파일 다운로드 구현
  - [ ] 8.1 `FileManager` 다운로드 엔드포인트 구현
    - 스트리밍 다운로드, `Content-Type` / `Content-Disposition` 헤더 설정
    - HTTP Range 요청 지원 (206 Partial Content)
    - 존재하지 않는 경로 404 처리
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  - [ ]* 8.2 Property 12 속성 테스트: HTTP Range 요청 지원
    - **Property 12: HTTP Range 요청 지원**
    - **Validates: Requirements 4.2**
  - [ ]* 8.3 Property 13 속성 테스트: 다운로드 응답 헤더 정확성
    - **Property 13: 다운로드 응답 헤더 정확성**
    - **Validates: Requirements 4.3**
  - [ ]* 8.4 Property 14 속성 테스트: 존재하지 않는 경로 404
    - **Property 14: 존재하지 않는 경로 요청 시 404**
    - **Validates: Requirements 4.4, 5.6**

- [ ] 9. Checkpoint - 파일 업로드/다운로드 테스트 통과 확인
  - 모든 파일 I/O 관련 테스트가 통과하는지 확인하고, 문제가 있으면 사용자에게 질문한다.

- [ ] 10. 파일 및 폴더 관리 구현
  - [ ] 10.1 폴더 생성, 이름 변경, 이동, 복사, 삭제 엔드포인트 구현
    - 동일 프로바이더 내 이동: 메타데이터 업데이트만 수행
    - 크로스 프로바이더 이동: 복사 후 원본 삭제
    - 재귀 폴더 삭제 로직
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  - [ ]* 10.2 Property 15 속성 테스트: 재귀 폴더 삭제
    - **Property 15: 재귀 폴더 삭제**
    - **Validates: Requirements 5.3**
  - [ ]* 10.3 Property 16 속성 테스트: 크로스 프로바이더 이동
    - **Property 16: 크로스 프로바이더 이동**
    - **Validates: Requirements 5.5**

- [ ] 11. 클라우드 스토리지 프로바이더 구현
  - [ ] 11.1 `S3StorageProvider` 구현 (AWS SDK v3)
    - S3 호환 스토리지 연결, 파일 CRUD, 멀티파트 업로드
    - _Requirements: 6.1, 6.2_
  - [ ] 11.2 `GoogleDriveStorageProvider` 구현 (googleapis)
    - OAuth2 인증 플로우, 파일 CRUD, 토큰 자동 갱신
    - _Requirements: 6.1, 6.2, 6.4_
  - [ ] 11.3 `DropboxStorageProvider` 구현 (Dropbox SDK)
    - OAuth2 인증 플로우, 파일 CRUD, 토큰 자동 갱신
    - _Requirements: 6.1, 6.2, 6.4_
  - [ ]* 11.4 Property 18 속성 테스트: 액세스 토큰 자동 갱신
    - **Property 18: 액세스 토큰 자동 갱신**
    - **Validates: Requirements 6.4**

- [ ] 12. 파일 검색 구현
  - [ ] 12.1 `FileManager` 검색 엔드포인트 구현
    - 모든 마운트된 프로바이더에서 파일명 기준 검색
    - 파일 타입, 크기 범위, 수정일 범위 필터 지원
    - 관련도 순 정렬 (파일명 일치도 기준)
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 12.2 Property 25 속성 테스트: 검색 필터 정확성
    - **Property 25: 검색 필터 정확성**
    - **Validates: Requirements 9.2**

- [ ] 13. 동기화 엔진 구현
  - [ ] 13.1 `SyncEngine` 모듈 구현
    - 단방향/양방향 동기화 로직 (수정일시 + 크기 비교)
    - 충돌 감지 및 `sync_conflicts` 테이블 기록
    - 충돌 해결 엔드포인트 (`use-source` / `use-target` / `keep-both`)
    - 동기화 오류 격리 (오류 파일 기록 후 나머지 계속 진행)
    - _Requirements: 7.1, 7.2, 7.3, 7.5_
  - [ ] 13.2 WebSocket 기반 동기화 진행 상태 실시간 전송
    - `SyncGateway` (NestJS WebSocket Gateway) 구현
    - 진행 상태 이벤트: `{ jobId, total, completed, failed, state }`
    - _Requirements: 7.4_
  - [ ]* 13.3 Property 19 속성 테스트: 동기화 멱등성
    - **Property 19: 동기화 변경 파일만 전송 (멱등성)**
    - **Validates: Requirements 7.2**
  - [ ]* 13.4 Property 20 속성 테스트: 동기화 충돌 감지
    - **Property 20: 동기화 충돌 감지**
    - **Validates: Requirements 7.3**
  - [ ]* 13.5 Property 21 속성 테스트: 동기화 오류 격리
    - **Property 21: 동기화 오류 격리**
    - **Validates: Requirements 7.5**
  - [ ]* 13.6 Property 26 속성 테스트: 진행 상태 단조 증가
    - **Property 26: 진행 상태 실시간 업데이트**
    - **Validates: Requirements 7.4, 10.4**

- [ ] 14. Checkpoint - 동기화 엔진 테스트 통과 확인
  - 모든 동기화 관련 테스트가 통과하는지 확인하고, 문제가 있으면 사용자에게 질문한다.

- [ ] 15. 파일 공유 서비스 구현
  - [ ] 15.1 `ShareService` 모듈 구현
    - 고유 토큰 기반 공유 URL 생성 (`crypto.randomBytes`)
    - 만료 일시, 최대 다운로드 횟수 설정 및 검증
    - 비밀번호 보호 (bcrypt 해시 저장, 접근 시 검증)
    - 다운로드 횟수 추적 및 링크 비활성화
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  - [ ]* 15.2 Property 22 속성 테스트: 공유 링크 고유성
    - **Property 22: 공유 링크 고유성**
    - **Validates: Requirements 8.1**
  - [ ]* 15.3 Property 23 속성 테스트: 만료/횟수 초과 시 403
    - **Property 23: 공유 링크 만료 및 횟수 제한 시 403**
    - **Validates: Requirements 8.2, 8.4, 8.5**
  - [ ]* 15.4 Property 24 속성 테스트: 비밀번호 보호 링크
    - **Property 24: 공유 링크 비밀번호 보호**
    - **Validates: Requirements 8.3, 8.6**

- [ ] 16. Svelte 프론트엔드 - 기본 레이아웃 및 인증 UI
  - [ ] 16.1 Svelte 앱 초기화 및 라우팅 설정 (SvelteKit)
    - 로그인 페이지 컴포넌트 구현
    - JWT 토큰 저장 및 API 클라이언트 (`fetch` 래퍼, Authorization 헤더 자동 첨부)
    - 인증 상태 스토어 (`writable`) 구현
    - _Requirements: 1.1, 10.5_
  - [ ] 16.2 반응형 레이아웃 및 사이드바 컴포넌트
    - 데스크톱/모바일 반응형 레이아웃
    - 마운트된 스토리지 프로바이더 목록 사이드바
    - _Requirements: 10.1, 10.5_

- [ ] 17. Svelte 프론트엔드 - 파일 탐색기 UI
  - [ ] 17.1 파일/폴더 트리 및 그리드/리스트 뷰 컴포넌트
    - `FileTree`, `FileGrid`, `FileList` 컴포넌트 구현
    - 파일 메타데이터 표시 (이름, 크기, 수정일, 스토리지 출처)
    - 오프라인 프로바이더 시각적 표시
    - _Requirements: 10.1, 2.4, 2.5_
  - [ ] 17.2 드래그 앤 드롭 파일 업로드 및 이동
    - HTML5 Drag and Drop API 기반 업로드 존 구현
    - 파일 이동 드래그 앤 드롭 구현
    - _Requirements: 10.2_
  - [ ] 17.3 파일 작업 진행률 표시줄 컴포넌트
    - WebSocket 연결 및 진행 상태 이벤트 수신
    - 업로드/동기화 진행률 표시줄 (`ProgressBar` 컴포넌트)
    - _Requirements: 10.4_

- [ ] 18. Svelte 프론트엔드 - 미리보기 및 검색 UI
  - [ ] 18.1 파일 인라인 미리보기 컴포넌트
    - 이미지(`<img>`), 동영상(`<video>`), 텍스트(`<pre>`), PDF(`<iframe>`) 미리보기
    - _Requirements: 10.3_
  - [ ] 18.2 파일 검색 UI 컴포넌트
    - 검색 입력창, 필터 패널 (파일 타입, 크기, 날짜)
    - 검색 결과 목록 표시
    - _Requirements: 9.1, 9.2, 9.3_
  - [ ] 18.3 오류 메시지 및 알림 컴포넌트
    - 전역 토스트/알림 컴포넌트 구현
    - API 오류 응답을 사용자 친화적 메시지로 변환
    - _Requirements: 10.6_

- [ ] 19. 전체 통합 및 최종 연결
  - [ ] 19.1 백엔드 모듈 최종 연결
    - `AppModule`에 모든 모듈 등록: `AuthModule`, `VfsModule`, `FileManagerModule`, `ShareModule`, `SyncModule`
    - 글로벌 예외 필터 및 오류 응답 형식 통일
    - _Requirements: 1.1~10.6_
  - [ ] 19.2 프론트엔드-백엔드 통합 검증
    - 로그인 → 파일 탐색 → 업로드 → 다운로드 → 공유 → 동기화 전체 플로우 통합 테스트 작성
    - _Requirements: 1.1, 3.1, 4.1, 8.1, 7.1_

- [ ] 20. Final Checkpoint - 모든 테스트 통과 확인
  - 모든 단위 테스트 및 속성 기반 테스트가 통과하는지 확인하고, 문제가 있으면 사용자에게 질문한다.

## Notes

- `*` 표시된 태스크는 선택 사항으로 MVP 구현 시 건너뛸 수 있다
- 각 속성 테스트는 `// Feature: mini-nas, Property {번호}: {속성 설명}` 주석을 포함해야 한다
- 속성 테스트는 `fast-check`의 `fc.assert` + `fc.asyncProperty`로 최소 100회 실행한다
- 체크포인트는 점진적 검증을 위한 것으로, 이전 태스크의 테스트가 모두 통과한 후 진행한다
