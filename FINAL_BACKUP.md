# HOLY BREATH OS - FINAL BACKUP (Phase 17)

## 1. Firebase Cloud Structure
- **Project ID**: `holy-breath`
- **Database**: Firestore
- **Collections**:
  - `users` (User Profiles)
    - **ID**: `{userId}` (e.g., '1', '2' ... '7')
    - **Fields**:
      - `lastActive` (number, timestamp)
      - `state` (object) - *состояние TrainingEngine*
        - `currentDay` (number)
        - `targetCycle` (array, e.g., [4,4,4,4])
        - `bioTracking` (object)
  - `global` (System Settings & Sync)
    - **Document ID**: `settings`
      - **Fields**:
        - `prayerFocus` (string) - *Глобальный молитвенный фокус недели для Дашборда*
    - **Document ID**: `rehearsal`
      - **Fields**:
        - `active` (boolean) - *Статус режима "ОБЩИЙ ВДОХ"*
        - `startedBy` (string) - *ID инициатора сессии*
        - `startTime` (number, timestamp) - *Время начала для синхронизации метрономов*

## 2. Dependencies (package.json)
- `react`, `react-dom`
- `react-router-dom` (SPA Navigation)
- `firebase` (Backend / Real-time Sync)
- `vite-plugin-pwa` (Service Worker / Offline Caching)
- `sharp` (High-res PWA Icon Generator)
- *(Примечание: socket.io и express использовались в архитектуре Phase 1-13, но в Phase 14-17 были заменены на серверлес-архитектуру Firebase).*

## 3. Quick Deploy Guide (Vercel/Netlify)
1. **Репозиторий**: Загрузи папку `holly-breath` на GitHub (сделай репозиторий приватным).
2. **Хостинг**: Подключи GitHub-аккаунт к Vercel или Netlify и выбери этот репозиторий.
3. **Environment**: Во вкладке *Environment Variables* на сервере добавь в точности эти переменные из твоего `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
4. **Сборка (Build)**: Фреймворк определится как Vite. Команда сборки `npm run build` запустится автоматически.
5. **Запуск**: После зеленого индикатора хостинга — приложение в сети! Отправь ссылку команде из 7 человек, чтобы они установили PWA с новой синей иконкой `Deep Blue Flow`.
