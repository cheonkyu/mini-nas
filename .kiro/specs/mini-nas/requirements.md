# Requirements Document

## Introduction

Mini-NAS는 로컬 스토리지와 클라우드 스토리지(S3, Google Drive, Dropbox 등)를 통합하여 단일 웹 인터페이스에서 관리할 수 있는 웹 기반 NAS(Network Attached Storage) 시스템입니다. 사용자는 브라우저를 통해 파일 업로드/다운로드, 폴더 관리, 클라우드 동기화, 파일 공유 등의 기능을 사용할 수 있습니다.

## Glossary

- **Mini-NAS**: 본 시스템의 명칭. 웹 기반 통합 스토리지 관리 시스템
- **Storage_Provider**: 연결 가능한 스토리지 백엔드 (로컬 디스크, S3, Google Drive, Dropbox 등)
- **File_Manager**: 파일 및 폴더의 CRUD 작업을 처리하는 컴포넌트
- **Auth_Service**: 사용자 인증 및 권한 관리를 담당하는 컴포넌트
- **Sync_Engine**: 로컬과 클라우드 스토리지 간 동기화를 처리하는 컴포넌트
- **Share_Service**: 파일 및 폴더 공유 링크를 생성하고 관리하는 컴포넌트
- **Web_UI**: 사용자가 접근하는 브라우저 기반 인터페이스
- **Virtual_Filesystem**: 여러 Storage_Provider를 단일 파일 트리로 추상화한 가상 파일 시스템
- **Chunk**: 대용량 파일 업로드 시 분할되는 파일 조각 단위

---

## Requirements

### Requirement 1: 사용자 인증 및 접근 제어

**User Story:** As a 시스템 관리자, I want 인증된 사용자만 Mini-NAS에 접근할 수 있도록, so that 무단 접근으로부터 파일을 보호할 수 있다.

#### Acceptance Criteria

1. THE Auth_Service SHALL 사용자 이름과 비밀번호 기반의 로그인 기능을 제공한다
2. WHEN 로그인 요청이 수신되면, THE Auth_Service SHALL JWT 토큰을 발급하고 만료 시간을 24시간으로 설정한다
3. WHEN JWT 토큰이 만료되면, THE Auth_Service SHALL 해당 요청을 거부하고 401 상태 코드를 반환한다
4. IF 비밀번호가 5회 연속 틀리면, THEN THE Auth_Service SHALL 해당 계정을 15분간 잠금 처리한다
5. THE Auth_Service SHALL 비밀번호를 bcrypt 알고리즘으로 해시하여 저장한다
6. WHEN 사용자가 로그아웃하면, THE Auth_Service SHALL 해당 JWT 토큰을 무효화한다

---

### Requirement 2: 가상 파일 시스템

**User Story:** As a 사용자, I want 여러 클라우드와 로컬 스토리지를 하나의 파일 트리로 보고 싶어서, so that 스토리지 위치에 관계없이 일관된 방식으로 파일을 관리할 수 있다.

#### Acceptance Criteria

1. THE Virtual_Filesystem SHALL 로컬 디스크, S3, Google Drive, Dropbox를 단일 파일 트리로 통합한다
2. WHEN Storage_Provider가 추가되면, THE Virtual_Filesystem SHALL 해당 프로바이더를 지정된 마운트 경로에 마운트한다
3. WHEN Storage_Provider가 제거되면, THE Virtual_Filesystem SHALL 해당 마운트 경로를 파일 트리에서 제거한다
4. THE Virtual_Filesystem SHALL 각 파일에 대해 이름, 크기, 수정일시, 스토리지 출처, MIME 타입 메타데이터를 제공한다
5. IF Storage_Provider 연결이 실패하면, THEN THE Virtual_Filesystem SHALL 해당 마운트 경로를 오프라인 상태로 표시하고 나머지 경로는 정상 제공한다

---

### Requirement 3: 파일 업로드

**User Story:** As a 사용자, I want 파일을 Mini-NAS에 업로드하고 싶어서, so that 어디서든 파일에 접근할 수 있다.

#### Acceptance Criteria

1. WHEN 파일 업로드 요청이 수신되면, THE File_Manager SHALL 지정된 경로에 파일을 저장한다
2. WHEN 업로드 파일 크기가 10MB를 초과하면, THE File_Manager SHALL 파일을 Chunk 단위로 분할하여 업로드를 처리한다
3. THE File_Manager SHALL 동시에 최대 5개의 파일 업로드를 병렬 처리한다
4. WHEN 업로드 중 네트워크 오류가 발생하면, THE File_Manager SHALL 마지막으로 성공한 Chunk부터 재개할 수 있는 재시작 토큰을 제공한다
5. IF 동일한 이름의 파일이 이미 존재하면, THEN THE File_Manager SHALL 파일명에 타임스탬프를 추가하여 충돌을 방지한다
6. WHEN 업로드가 완료되면, THE File_Manager SHALL 파일의 MD5 체크섬을 계산하여 메타데이터에 저장한다

---

### Requirement 4: 파일 다운로드

**User Story:** As a 사용자, I want 저장된 파일을 다운로드하고 싶어서, so that 로컬 환경에서 파일을 사용할 수 있다.

#### Acceptance Criteria

1. WHEN 파일 다운로드 요청이 수신되면, THE File_Manager SHALL 해당 파일을 스트리밍 방식으로 전송한다
2. WHEN 다운로드 파일 크기가 100MB를 초과하면, THE File_Manager SHALL HTTP Range 요청을 지원하여 부분 다운로드를 허용한다
3. THE File_Manager SHALL 다운로드 응답에 올바른 Content-Type 및 Content-Disposition 헤더를 포함한다
4. IF 요청한 파일이 존재하지 않으면, THEN THE File_Manager SHALL 404 상태 코드와 오류 메시지를 반환한다

---

### Requirement 5: 파일 및 폴더 관리

**User Story:** As a 사용자, I want 파일과 폴더를 생성, 이동, 복사, 삭제하고 싶어서, so that 파일 시스템을 체계적으로 정리할 수 있다.

#### Acceptance Criteria

1. THE File_Manager SHALL 폴더 생성, 이름 변경, 삭제 기능을 제공한다
2. THE File_Manager SHALL 파일 이동 및 복사 기능을 제공한다
3. WHEN 폴더 삭제 요청이 수신되면, THE File_Manager SHALL 하위 파일 및 폴더를 포함하여 재귀적으로 삭제한다
4. WHEN 파일 또는 폴더 이동 요청이 수신되면, THE File_Manager SHALL 동일 Storage_Provider 내에서는 메타데이터 업데이트만으로 이동을 처리한다
5. WHEN 파일 또는 폴더가 다른 Storage_Provider로 이동되면, THE File_Manager SHALL 원본을 복사한 후 원본을 삭제한다
6. IF 삭제 대상 경로가 존재하지 않으면, THEN THE File_Manager SHALL 404 상태 코드를 반환한다

---

### Requirement 6: 클라우드 스토리지 연동

**User Story:** As a 사용자, I want S3, Google Drive, Dropbox 등 클라우드 스토리지를 연결하고 싶어서, so that 기존 클라우드 파일을 Mini-NAS에서 통합 관리할 수 있다.

#### Acceptance Criteria

1. THE Mini-NAS SHALL S3 호환 스토리지, Google Drive, Dropbox를 Storage_Provider로 지원한다
2. WHEN Storage_Provider 연결 정보가 등록되면, THE Mini-NAS SHALL 연결 유효성을 검증하고 성공 여부를 반환한다
3. THE Mini-NAS SHALL Storage_Provider 인증 정보를 AES-256으로 암호화하여 저장한다
4. WHEN Storage_Provider의 액세스 토큰이 만료되면, THE Mini-NAS SHALL 리프레시 토큰을 사용하여 자동으로 갱신한다
5. IF Storage_Provider 인증이 실패하면, THEN THE Mini-NAS SHALL 사용자에게 재인증을 요청하는 알림을 전송한다

---

### Requirement 7: 파일 동기화

**User Story:** As a 사용자, I want 로컬과 클라우드 스토리지 간 파일을 동기화하고 싶어서, so that 항상 최신 파일 상태를 유지할 수 있다.

#### Acceptance Criteria

1. THE Sync_Engine SHALL 두 Storage_Provider 간 단방향 및 양방향 동기화를 지원한다
2. WHEN 동기화가 시작되면, THE Sync_Engine SHALL 파일의 수정일시와 크기를 비교하여 변경된 파일만 전송한다
3. WHEN 동기화 중 동일 파일이 양쪽에서 수정된 경우, THE Sync_Engine SHALL 충돌을 감지하고 사용자에게 해결 방법을 선택하도록 요청한다
4. THE Sync_Engine SHALL 동기화 작업을 백그라운드에서 실행하며 진행 상태를 실시간으로 제공한다
5. IF 동기화 중 오류가 발생하면, THEN THE Sync_Engine SHALL 오류 항목을 기록하고 나머지 파일의 동기화를 계속 진행한다

---

### Requirement 8: 파일 공유

**User Story:** As a 사용자, I want 파일 또는 폴더의 공유 링크를 생성하고 싶어서, so that Mini-NAS 계정이 없는 사람도 파일에 접근할 수 있다.

#### Acceptance Criteria

1. WHEN 공유 링크 생성 요청이 수신되면, THE Share_Service SHALL 고유한 토큰 기반의 공유 URL을 생성한다
2. THE Share_Service SHALL 공유 링크에 만료 일시 설정 기능을 제공한다
3. WHERE 비밀번호 보호 옵션이 활성화된 경우, THE Share_Service SHALL 공유 링크 접근 시 비밀번호 인증을 요구한다
4. THE Share_Service SHALL 공유 링크의 다운로드 횟수를 추적하고 최대 다운로드 횟수 제한 기능을 제공한다
5. WHEN 공유 링크가 만료되거나 최대 다운로드 횟수에 도달하면, THE Share_Service SHALL 해당 링크를 비활성화하고 403 상태 코드를 반환한다
6. IF 비밀번호가 틀리면, THEN THE Share_Service SHALL 401 상태 코드를 반환한다

---

### Requirement 9: 파일 검색

**User Story:** As a 사용자, I want 파일 이름 또는 메타데이터로 파일을 검색하고 싶어서, so that 많은 파일 중에서 원하는 파일을 빠르게 찾을 수 있다.

#### Acceptance Criteria

1. WHEN 검색 쿼리가 수신되면, THE File_Manager SHALL 모든 마운트된 Storage_Provider에서 파일 이름 기준으로 검색한다
2. THE File_Manager SHALL 파일 타입, 크기 범위, 수정일 범위 기준의 필터링을 지원한다
3. THE File_Manager SHALL 검색 결과를 관련도 순으로 정렬하여 반환한다
4. WHEN 검색 쿼리가 수신되면, THE File_Manager SHALL 3초 이내에 검색 결과를 반환한다

---

### Requirement 10: 웹 UI

**User Story:** As a 사용자, I want 직관적인 웹 인터페이스를 통해 파일을 관리하고 싶어서, so that 별도의 클라이언트 설치 없이 파일을 관리할 수 있다.

#### Acceptance Criteria

1. THE Web_UI SHALL 파일 및 폴더를 트리 구조와 그리드/리스트 뷰로 표시한다
2. THE Web_UI SHALL 드래그 앤 드롭 방식의 파일 업로드 및 이동을 지원한다
3. THE Web_UI SHALL 이미지, 동영상, 텍스트, PDF 파일의 인라인 미리보기를 제공한다
4. WHEN 파일 작업이 진행 중인 경우, THE Web_UI SHALL 진행률 표시줄을 통해 실시간 상태를 표시한다
5. THE Web_UI SHALL 데스크톱 및 모바일 브라우저에서 반응형 레이아웃으로 동작한다
6. WHEN 오류가 발생하면, THE Web_UI SHALL 사용자에게 명확한 오류 메시지와 권장 조치를 표시한다
