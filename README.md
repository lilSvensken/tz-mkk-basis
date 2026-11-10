# Заметки

SPA для заметок с todo-списками. Nuxt 4, TypeScript, Pinia, SCSS, без UI-библиотек.

Демо: https://lilsvensken.github.io/tz-mkk-basis/

## Запуск

```bash
docker-compose up
```

http://localhost:3000

## Разработка

Node 22+

```bash
npm install
npm run dev
```

```bash
npm test
npm run lint
npm run typecheck
```

## Что есть

- список заметок и редактор, удаление и отмена с подтверждением
- undo/redo: Ctrl+Z, Ctrl+Shift+Z (или Ctrl+Y), Ctrl+S сохраняет
- в истории патчи, а не копии заметки, максимум 50 шагов
- ввод в одно поле склеивается в один шаг (по паузе или blur)
- данные в localStorage с версией схемы, синхронизация между вкладками
- черновик несохранённых правок переживает перезагрузку

## Структура

Обычная слоистая структура Nuxt, без FSD — для двух страниц хватает.

- `app/pages` — страницы, собирают всё вместе
- `app/components/ui` — базовые компоненты без логики заметок
- `app/components/icon` — svg-иконки
- `app/components` — компоненты заметок (карточка, пункт, пустое состояние)
- `app/composables` — vue-обвязка: подтверждения, хоткеи, черновик
- `app/stores/notes.ts` — стор и сохранение в localStorage
- `app/utils` — логика без vue-компонентов: история, патчи, редактор, хранилище
- `tests/unit` — тесты

## Стили

- токены (цвета, отступы, шрифты, радиусы) — css-переменные в `assets/styles/tokens.scss`
- scss-переменные только для брейкпоинтов, в `@media` css-переменные не работают
- rem для шрифтов, отступов и размеров, px для бордеров, теней и брейкпоинтов, em только в letter-spacing

SSR выключен: данные лежат в localStorage, сервер их не видит.
