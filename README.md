# 📦 CHAIN-G (Front-end)

<img width="300" alt="Gemini_Generated_Image_8j8ddp8j8ddp8j8d-Photoroom" src="https://github.com/user-attachments/assets/6f623ede-7a0d-4fcd-a74f-3bec56de2c63" />

> CONNECT GOOD, VALUE CHAIN
>
**CHAIN-G**는 떡볶이 밀키트의 생산부터 유통, 가맹점 판매 및 정산까지의 전 과정을 효율적으로 관리하는 공급망 관리(SCM) 시스템입니다.
본사, 가맹점, 공장 등 각 사용자의 권한에 따른 최적화된 대시보드와 관리 도구를 제공하여 물류 및 정산 프로세스를 직관적으로 수행할 수 있도록 돕습니다.

<br>

## 👥 팀원 소개 (Team Flow-er)

| <img src="https://github.com/chaewoo-kim.png" width="120"> | <img src="https://github.com/rlatjddms.png" width="120"> | <img src="https://github.com/kyk5095.png" width="120"> | <img src="https://github.com/Yoocy0.png" width="120"> | <img src="https://github.com/cho-yunho01.png" width="120"> |
| :---: | :---: | :---: | :---: | :---: |
| **김채우** | **김성은** | **김윤경** | **유찬연** | **조윤호** |
| Order / Sales / <br>Return | User / BusinessUnit / <br>Notice / Notification | Settlement | In&Outbound / <br>Transport | Inventory / Product |
| [@chaewoo-kim](https://github.com/chaewoo-kim) | [@rlatjddms](https://github.com/rlatjddms) | [@kyk5095](https://github.com/kyk5095) | [@Yoocy0](https://github.com/Yoocy0) | [@cho-yunho01](https://github.com/cho-yunho01) |

<br>

## 🛠 기술 스택

| Category | Stack |
| :--- | :--- |
| **Framework** | Vue.js 3 (Composition API) |
| **Build Tool** | Vite |
| **State Management** | Pinia |
| **Router** | Vue Router |
| **HTTP Client** | Axios |
| **Excel/PDF Export** | xlsx, html2pdf.js |
| **Maps API** | Google Maps API (Embed) / Daum Postcode API |

<br>

## 📂 프로젝트 구조

```bash
frontend/
├── src/
│   ├── api/          # Axios 인스턴스 및 API 모듈
│   ├── assets/       # 이미지, 폰트 등 정적 자산
│   ├── components/   # 대시보드 및 공통 UI 컴포넌트
│   ├── router/       # Vue Router 설정 및 네비게이션 가드
│   ├── stores/       # Pinia 기반 상태 관리 (Auth 등)
│   └── views/        # 페이지 단위 뷰 컴포넌트
│       ├── factory/         # 공장 권한 관련 뷰
│       ├── franchise/       # 가맹점 권한 관련 뷰
│       ├── head-office/     # 본사 권한 관련 뷰
│       ├── hq-settlement/   # 본사 정산 관련 뷰
│       └── store-settlement/# 가맹점 정산 관련 뷰
├── public/           # 정적 리소스
├── index.html        # 메인 진입 HTML
└── vite.config.js    # Vite 설정
```

<br>

## 🚀 주요 기능

- **사용자별 대시보드**: 로그인한 사용자의 권한(본사/가맹점/공장)에 따라 맞춤형 대시보드 제공
- **스마트 발주 시스템**: 복잡한 밀키트 품목을 직관적으로 발주하고 상태(대기/수락/배송중) 실시간 확인
- **물류 및 배차 관리**: 적재 중량을 고려한 구체적인 차량 배차 관리 및 지도 연동
- **엑셀 및 PDF 지원**: 정산 명세서 및 재고 리스트의 엑셀 추출 및 PDF 다운로드 기능
- **실시간 알림**: 발주 접수, 상태 변경 시 사용자에게 상단 알림 바를 통한 실시간 피드백

<br>

## ⭐ UI/UX 테스트케이스

<img width="700" height="651" alt="image" src="https://github.com/user-attachments/assets/324eee5f-5b64-4484-a821-00f5b22365aa" />
<img width="703" height="509" alt="image" src="https://github.com/user-attachments/assets/6fc1a607-2992-4080-b6bb-eb7f92875a78" />

<br>

## 🖥️ 주요 화면

- **로그인 및 계정 분실**
<img width="400" alt="화면 캡처 2026-03-18 122122" src="https://github.com/user-attachments/assets/e0052e9e-5aa0-424d-b574-b5fedb8a6db2" />
<img width="400" height="905" alt="image" src="https://github.com/user-attachments/assets/88fbaed9-8a6d-4bbb-a0cd-327b475e4461" />

- **권한별 대시보드 (본사/가맹점/공장)**
<img width="400" alt="image" src="https://github.com/user-attachments/assets/256e3962-2ba5-48a1-a4c0-e5275fe26aa4" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/2f4aec61-f33e-40c7-aa06-6a48c2682ac8" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/ba3e7370-1fd3-4288-92c1-11e033ca4650" />

- **주요 기능 페이지 (재고관리/발주 관리/정산)**
<img width="400" alt="image" src="https://github.com/user-attachments/assets/6a9dbef8-876f-4779-9210-e4eb76749ffd" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/a48912ac-56ca-4fdf-8a76-35da04cb9251" />
<img width="400" alt="image" src="https://github.com/user-attachments/assets/757d84e3-e417-496d-9b83-c9f5b7d63f8a" />

<br>

## 👥 팀 협업 규칙

### ⭐ 개발 규칙 및 컨벤션

- **컴포넌트 설계**: 재사용 가능한 UI 요소는 `components/` 하위로, 페이지 라우팅 요소는 `views/` 하위로 관리합니다.
- **상태 관리**: 전역 사용자 정보 및 권한 체크는 Pinia(`stores/auth.js`)를 통해 수행합니다.
- **네이밍 컨벤션**: 
  - 파일 및 폴더: 파스칼 케이스(PascalCase) 또는 케밥 케이스(kebab-case) 권장
  - 컴포넌트: `StoreInventoryManagementView.vue`와 같이 명확한 명칭 사용

<br>

## 📝 프로젝트 회고

프로젝트를 마치며 팀원 각자가 느낀 기술적 도전과 성장을 기록합니다.

<details>
<summary style="font-size:1.2em;">🦫 김채우</summary>
<div markdown="1">

(작성 예정)

</div>
</details>

<details>
<summary style="font-size:1.2em;">☠️ 김성은</summary>
<div markdown="1">

(작성 예정)

</div>
</details>

<details>
<summary style="font-size:1.2em;">🐇 김윤경</summary>
<div markdown="1">

(작성 예정)

</div>
</details>

<details>
<summary style="font-size:1.2em;">🦘 유찬연</summary>
<div markdown="1">

(작성 예정)

</div>
</details>

<details>
<summary style="font-size:1.2em;">🐜 조윤호</summary>
<div markdown="1">

(작성 예정)

</div>
</details>
