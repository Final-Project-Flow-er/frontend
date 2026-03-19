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

멀티 모듈을 도입해 배포까지 진행했던 프로젝트는 이번이 처음이었습니다.  
5명이서 협업을 하며 하나의 결과물을 냈습니다. 실제 도메인을 구매해 접속해 보는 과정은 새로웠습니다.  
2개월간 밀도 높은 시간으로 하나의 프로젝트에 몰입한 것 자체가 즐거웠습니다. 아쉬움도 많이 남지만 이 경험을 발판으로 앞으로 더욱 뛰어난 개발자가 되도록 노력하겠습니다. 

</div>
</details>

<details>
<summary style="font-size:1.2em;">☠️ 김성은</summary>
<div markdown="1">

이번 프로젝트에서는 회원, 사업장 관리, 공지사항 및 알림 기능을 담당했으며, 동시에 인프라를 맡아 CI/CD 환경을 구축했습니다.  
AWS를 처음 다뤄보는 상황이라 초반에는 어려움이 있었지만, 시행착오를 거치며 점차 익숙해졌고 실제 서비스 흐름을 고려한 배포 과정을 경험할 수 있었습니다.
또한 GitHub PR과 Jira 연동을 활용해 협업 프로세스를 체계적으로 경험했고, 팀원들과의 커뮤니케이션을 통해 기능을 조율하며 협업의 중요성을 느낄 수 있었습니다.  
이번 프로젝트는 새로운 기술을 직접 적용해보고 문제를 해결해 나가는 과정에서 많은 것을 배우고, 한 단계 성장할 수 있었던 의미 있는 경험이었습니다.

</div>
</details>

<details>
<summary style="font-size:1.2em;">🐇 김윤경</summary>
<div markdown="1">

단순한 기능 개발을 넘어 기획부터 설계, 개발까지 전 과정을 경험하면서 서비스가 만들어지는 흐름을 깊게 이해할 수 있는 시간이었다.  
각 도메인 간 상품의 이동과 돈의 흐름을 연결하여 하나의 시스템으로 바라볼 수 있었던 점이 가장 의미 있었다. 우리가 만든 ERP 시스템을 통해 비즈니스의 전반적인 흐름을 한눈에 파악할 수 있었던 것은 매우 값진 경험이었다.  
멘토님의 리뷰를 통해 부족한 점을 객관적으로 돌아볼 수 있었고, 데일리 스크럼을 통해 팀원들의 진행 상황을 공유하며 협업의 중요성도 체감할 수 있었다.  
많은 공을 들인 만큼 아쉬운 부분도 있었다. 초기 기획 단계에서 요구사항을 더 구체적으로 정의하지 못했던 점과, 서로 맡은 도메인 개발에 집중하다보니 소통이 부족했던 순간들이 아쉬웠다.  
이 경험을 통해 꾸준한 커뮤니케이션이 얼마나 중요한지 깨달았고, 앞으로는 이를 적극적으로 반영하여 개발을 하고싶다.

</div>
</details>

<details>
<summary style="font-size:1.2em;">🦘 유찬연</summary>
<div markdown="1">

지난 시간들동안 배운 것들을 토대로 파이널 프로젝트를 진행했다. 많은 팀 프로젝트에서 매번 중요성을 느끼게 된 것도 있었고, 반복됨에 따라 중요성을 새롭게 느끼게 된 것도 있었다.  
매번 중요성을 느끼게 된 것은 역시 소통이었다. 소통을 통해 우리가 하고자 하는 것이 같은 것인지를 확인하는 것이 중요했고, 구현이 되는 것에서도 통일되어야 했다.  
지난 모든 프로젝트들에서 이 소통이라는 것이 매번 조금씩은 아쉬움이 느껴졌었다. 다음 프로젝트에서는 더 잘할 수 있겠다고 생각했지만, 또 다른 부분에서 소통이 미흡함을 느껴 아쉬움을 느꼈다. 
프로젝트가 반복됨에 따라 중요도를 알게 된 것은 구조를 얼마나 견고하게 만드는 것인가 였다. 구조가 견고하지 못하면 서비스 로직에도 구멍이 많이 생기게 되고 작업을 수행할 때도 로직이 더 길어지는 등의 불편함이 있었다. 
그래도 미흡한 점만 있지는 않았다. 개발을 시작한 뒤로 이정도까지 몰두해서 개발을 진행한 경험이 처음이었고, 프로젝트를 진행함에 따라 개발을 어떤 식으로 진행해야 하는지 지금 당장 처한 상황에서 내가 할 수 있는 일이 무엇인지 등을 깨닫게 되었다. 
이러한 성장을 토대로 이후 진행하게 될 많은 프로젝트들에서 이런 미흡한 점들을 고려해 더욱 완성도 있는 팀 프로젝트를 만들고 싶다는 생각이 들었다. 그리 길지 않은 시간이었지만 많은 것들을 배웠고 느끼며 성장하는 값진 시간이었다.

</div>
</details>

<details>
<summary style="font-size:1.2em;">🐜 조윤호</summary>
<div markdown="1">

어느 정도 익혔다고 생각하고 파이널 프로젝트에 적용했지만, 예상보다 훨씬 어려웠다. 엔티티, 기능, 테스트를 반복적으로 수정하며 “더 효율적인 방법이 있었을 텐데”라는 아쉬움이 들었다.  
특히 초기 설계의 중요성을 크게 느꼈다. 기반이 탄탄하지 않으면 이후에 큰 수정이 반복된다는 것을 직접 경험했다.  
비록 쉽지 않은 과정이었지만, 다양한 시행착오를 통해 한 단계 성장할 수 있었던 의미 있는 경험이었다.

</div>
</details>
