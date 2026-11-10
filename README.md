# Заметки

SPA для заметок с todo-списками. Nuxt 4, TypeScript, Pinia, SCSS, без UI-библиотек.

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

- `app/utils/history.ts`, `noteEditor.ts`, `notePatches.ts` — история
- `app/stores/notes.ts` — стор и сохранение
- `app/components/ui` — кнопки, поля, чекбокс, модалка
- `tests/unit` — тесты
