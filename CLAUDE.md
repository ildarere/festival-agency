# EWA Assistant Guidelines

## О проекте
- **Название:** EWA — десктопное приложение для учета клиентов и фестивального продвижения фильмов.
- **Файл базы данных:** `ewa.db` в каталоге `app.getPath('userData')` (см. `src/main/database/connection.ts`).

## Архитектура проекта
- **Стек:** Electron + Vue 3 (Composition API, `<script setup>`) + TypeScript + Pinia + better-sqlite3 + Tailwind CSS.
- **Архитектура:** Строгое разделение:
  - `src/main`: Node.js, база SQLite, доступ к файловой системе, системные окна. Никакого UI-кода.
  - `src/preload`: Безопасный мост `contextBridge.exposeInMainWorld('api', {...})`. Строгая типизация через `types.ts`.
  - `src/renderer`: Vue 3 интерфейс. Прямой доступ к Node.js/электронным модулям запрещен. Все запросы только через `window.api.*`.
- **FSD Структура (Renderer):**
  - `pages/`: Экраны (Клиенты, Карточка клиента, Фестивали, Календарь).
  - `entities/`: Модели сущностей и Pinia-сторы (`client`, `film`, `festival`, `submission`).
  - `shared/`: Переиспользуемые UI-компоненты, утилиты, общие типы.

## База данных (SQLite)
- Использовать только библиотеку `better-sqlite3`.
- Все запросы выполнять с параметризацией (защита от SQL-инъекций).
- Внешние ключи включены: `PRAGMA foreign_keys = ON;`.
- Схема базы и миграции хранятся в `src/main/database/migrations/`.

## Правила написания кода
- Строгий TypeScript везде. Запрещен `any` (использовать `unknown` с валидацией или строгие интерфейсы).
- При добавлении нового IPC-метода обязательно обновлять три места:
  1. Обработчик `ipcMain.handle` в `src/main/ipc/`.
  2. Экспорт метода в `src/preload/index.ts`.
  3. Интерфейс `Window['api']` в `src/preload/types.ts`.
