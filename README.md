# Конструктор-Триптих

Мини-конструктор триптихов: инструмент для формирования композиций из трёх взаимосвязанных частей. Пользователь задаёт название и общую тему, наполняет левую, центральную и правую части (заголовок, короткий текст, изображение), настраивает общее оформление (палитра, фон, шрифт), видит живое превью и выгружает результат одним горизонтальным PNG-файлом.

Проект работает полностью в браузере как статический сайт: без сервера, без базы данных, без регистрации.

## Стек

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- vite-plugin-singlefile (сборка в единый `dist/index.html`)
- html-to-image (экспорт PNG из DOM-узла)
- Google Fonts (Playfair Display, Cormorant Garamond, Manrope, Unbounded, Marck Script, JetBrains Mono)
- Lucide (иконки)

## Требования

- Node.js 20+ (рекомендуется LTS)
- npm 10+

Проверить версии:

```bash
node -v
npm -v
```

## Установка и запуск

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `npm install` — установка зависимостей.
- `npm run dev` — локальный запуск в режиме разработки (по умолчанию `http://localhost:5173`).
- `npm run build` — production-сборка. Готовые файлы находятся в папке `dist` (единый `index.html` + скопированные ресурсы из `public/`, например `dist/images/`).
- `npm run preview` — локальный предпросмотр результата сборки из папки `dist`.

## Архитектура (кратко)

- Данные проекта: `src/constants.ts` (палитры, фоны, шрифты, демо-проект), состояние в `src/App.tsx`.
- Экранное представление: `TriptychView` в режиме `live` — адаптивное превью в конструкторе и модальном окне.
- Экспортное представление: `TriptychView` в режиме `poster` — фиксированный горизонтальный холст 1600 px, три панели строго слева направо.
- Цепочка экспорта: данные → редактор → live-превью → poster-представление → PNG → «Сохранить как».
- Сохранение fallback-сценариев экспорта: File System Access API → автоматическое скачивание через object URL → ручное сохранение из модального окна.
- Автосохранение проекта: `localStorage`, восстановление при повторном открытии.

Маршрутизации в приложении нет (одна страница), поэтому дополнительная настройка 404 для GitHub Pages не требуется.

## Публикация на GitHub Pages

Ниже — пошаговая инструкция для размещения вида `https://<USERNAME>.github.io/<REPOSITORY_NAME>/`.

### Шаг 0. Укажите имя репозитория в `vite.config.ts` (ОБЯЗАТЕЛЬНО ВРУЧНУЮ)

> ⚠️ **Место замены `<REPOSITORY_NAME>` № 1 (единственное место в коде).**
> Откройте `vite.config.ts` и приведите его к виду ниже, заменив `<REPOSITORY_NAME>` на фактическое имя репозитория GitHub (например, `triptych-constructor`).

```ts
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Локальная разработка — корень '/', production-сборка для GitHub Pages — подкаталог репозитория.
  base: process.env.NODE_ENV === "production" ? "/<REPOSITORY_NAME>/" : "/",
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

Проверьте локально после правки:

```bash
npm run dev     # должен работать как раньше, на http://localhost:5173
npm run build   # должен собираться без ошибок
npm run preview # предпросмотр сборки
```

Примечание: запись `<script type="module" src="/src/main.tsx">` в `index.html` — стандартная точка входа Vite, при сборке путь пересчитывается автоматически с учётом `base`. JS и CSS инлайнятся в единый HTML плагином `vite-plugin-singlefile`, изображения демо-проекта используют относительные пути (`images/part-*.jpg`) и корректно загружаются из подкаталога репозитория.

### Шаг 1. Создайте репозиторий на GitHub

1. На github.com создайте новый публичный репозиторий, например `triptych-constructor`.
2. Не добавляйте README/LICENSE через веб-интерфейс, если будете отправлять существующий проект (чтобы не было конфликта историй).

### Шаг 2. Отправьте проект в ветку `main`

Выполните в корне проекта (замените `<USERNAME>` и `<REPOSITORY_NAME>` на свои значения):

```bash
git init
git add .
git commit -m "Prepare triptych constructor for GitHub Pages"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPOSITORY_NAME>.git
git push -u origin main
```

Если репозиторий уже существует локально и remote настроен:

```bash
git add .
git commit -m "Prepare triptych constructor for GitHub Pages"
git push origin main
```

### Шаг 3. Включите GitHub Pages

1. Откройте репозиторий → **Settings** → **Pages**.
2. В разделе **Build and deployment**, параметр **Source** выберите **GitHub Actions**.
3. Сохраните. Отдельных токенов и секретов не требуется — workflow использует встроенный `GITHUB_TOKEN`.

### Шаг 4. Дождитесь автоматической публикации

1. После push в `main` откройте вкладку **Actions** — должен запуститься workflow **Deploy to GitHub Pages**.
2. Дождитесь статуса ✅ (обычно 1–3 минуты).
3. Откройте опубликованный сайт: `https://<USERNAME>.github.io/<REPOSITORY_NAME>/`.

Повторные публикации происходят автоматически при каждом push в ветку `main`. В GitHub Pages публикуется только папка `dist` (результат `npm run build`), исходный код отдельно не публикуется.

### Шаг 5. Проверьте опубликованную версию

Чек-лист проверки — см. раздел «Чек-лист проверки» ниже.

## Места ручной замены плейсхолдеров

1. `vite.config.ts` — параметр `base`: заменить `<REPOSITORY_NAME>` на имя репозитория (см. Шаг 0 выше).
2. Команда `git remote add origin https://github.com/<USERNAME>/<REPOSITORY_NAME>.git` — заменить оба плейсхолдера.
3. Итоговая ссылка `https://<USERNAME>.github.io/<REPOSITORY_NAME>/` — подставить свои значения для проверки.

Больше нигде в коде заменять ничего не нужно. Токены, пароли, API-ключи и секреты в репозиторий не добавляются.

## Чек-лист проверки опубликованной версии

- [ ] Открывается `https://<USERNAME>.github.io/<REPOSITORY_NAME>/` без 404.
- [ ] Применяются стили (тёмная тема конструктора, шрифты интерфейса).
- [ ] Загружаются три демо-изображения (`images/part-left.jpg`, `images/part-center.jpg`, `images/part-right.jpg`).
- [ ] Редактор работает: шаги «Основа → Части → Оформление», поля, загрузка своих изображений.
- [ ] Живое превью обновляется мгновенно при изменении полей и оформления.
- [ ] Модальные окна открываются: «Открыть превью», «Создать новый триптих» (с «Отмена» без потери данных).
- [ ] «Скачать PNG» формирует горизонтальный файл: три панели слева направо, в окне результата пометка «альбомная».
- [ ] Автосохранение работает: обновите страницу — данные восстанавливаются.
- [ ] Адаптив: на смартфоне панели превью выстраиваются вертикально, вкладки редактора остаются компактными.
- [ ] Вкладка Actions показывает успешный workflow, в Settings → Pages указан адрес публикации.

## Известные ограничения

- `localStorage` хранит данные только в конкретном браузере и на конкретном устройстве; между браузерами и устройствами проект не переносится.
- Загруженные пользователем изображения сохраняются только локально (в `localStorage` этого браузера) и не синхронизируются между устройствами.
- File System Access API (нативный диалог «Сохранить как») поддерживается не всеми браузерами, поэтому используется fallback на обычное скачивание через object URL, а затем — ручное сохранение готового изображения из модального окна.
- При переполнении квоты `localStorage` (очень много/большие изображения) браузер может отклонить запись — в шапке появится индикатор «Не сохранено».

## Структура проекта (релевантная для деплоя)

```text
.
├── .github/workflows/deploy.yml  # автопубликация dist на GitHub Pages при push в main
├── .gitignore                    # исключения: node_modules, dist, env, логи, служебные файлы
├── public/
│   ├── .nojekyll                 # отключение Jekyll на GitHub Pages
│   └── images/                   # демо-изображения триптиха (копируются в dist/images/)
├── dist/                         # результат npm run build (не коммитится, публикуется workflow)
├── index.html                    # точка входа (Vite пересчитывает пути с учётом base)
├── vite.config.ts                # ОБЯЗАТЕЛЬНО указать base с именем репозитория (см. выше)
└── src/                          # исходный код приложения (без изменений для деплоя)
```
