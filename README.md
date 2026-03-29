# CooperVision DIFF 워크샵

## 로컬 실행
```bash
npm install
npm run dev
```

## Vercel 배포 순서

1. GitHub에 이 폴더를 새 repository로 업로드
2. vercel.com → "Add New Project" → GitHub 저장소 선택
3. Framework: **Vite** 선택
4. Deploy 클릭

## 강사 PIN
기본값: `1234`
변경하려면 `src/App.jsx` 파일에서 `INSTRUCTOR_PIN` 값을 수정하세요.

## Firebase 보안 규칙 (배포 후 설정 권장)
Firebase 콘솔 → Realtime Database → 규칙:
```json
{
  "rules": {
    "workshop_cv_v1": {
      ".read": true,
      ".write": true
    }
  }
}
```
