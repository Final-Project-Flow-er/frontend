# 가벼운 Nginx 이미지를 베이스로 사용
FROM nginx:stable-alpine

# 젠킨스가 빌드한 결과물(dist)을 Nginx의 기본 웹 서비스 경로로 복사
COPY dist /usr/share/nginx/html

# SPA 라우팅을 위한 Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx의 기본 포트인 80을 외부에 알림
EXPOSE 80

# Nginx를 백그라운드가 아닌 포그라운드에서 실행
CMD ["nginx", "-g", "daemon off;"]