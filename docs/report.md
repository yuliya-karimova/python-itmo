# Отчет о развертывании статического сайта

## 1. Выбор технологического стека

Для проекта выбран следующий стек:

- **Python 3.12** — среда выполнения для MkDocs
- **MkDocs** — генератор статической документации (без Material, используется кастомная тема)
- **Node.js 20** — среда для инструментов сборки и обработки
- **GitHub Actions** — система CI/CD
- **GitHub Pages** — хостинг статического сайта
- **PostCSS** — обработка и оптимизация CSS
- **Jinja2** — шаблонизация (встроена в MkDocs)

## 2. Создание кастомной темы

### 2.1 Структура темы

Создана полностью кастомная тема в директории `theme/`:

```
theme/
├── main.html              # Главный шаблон страницы
└── partials/
    ├── header.html        # Кастомный header
    └── footer.html        # Кастомный footer
```

### 2.2 Основной шаблон (main.html)

Шаблон включает:
- Метаданные сайта (title, description, author)
- Open Graph теги для социальных сетей
- Подключение кастомных CSS и JavaScript файлов
- Структуру layout с сайдбаром и контентом
- Использование Jinja2 для динамического контента

### 2.3 Кастомные компоненты

**Header** (`theme/partials/header.html`):
- Отображает название сайта
- Показывает описание (tagline)
- Ссылка на GitHub репозиторий

**Footer** (`theme/partials/footer.html`):
- Информация об авторе
- Ссылка на GitHub репозиторий

### 2.4 Стилизация

CSS файл (`docs/assets/css/main.css`) включает:
- CSS переменные для цветовой схемы
- Адаптивную верстку с использованием Grid
- Стили для header, footer, навигации и контента
- Базовые улучшения типографики

## 3. Конфигурация проекта

### 3.1 MkDocs конфигурация (mkdocs.yml)

```yaml
site_name: "Юлия Каримова — DevOps & Python"
site_description: "Проектирование и развертывание веб-решений в эко-системе Python"
site_author: "Yuliya karimova"

theme:
  name: null
  custom_dir: theme
  language: ru

extra_css:
  - assets/css/main.css
extra_javascript:
  - assets/js/main.js
```

### 3.2 PostCSS конфигурация (postcss.config.js)

```javascript
module.exports = {
  plugins: [
    require('autoprefixer')(),
    require('cssnano')({ preset: 'default' })
  ]
};
```

Используются плагины:
- **autoprefixer** — автоматическое добавление vendor prefixes
- **cssnano** — минификация и оптимизация CSS

### 3.3 Валидация HTML (.htmlvalidate.json)

```json
{
  "extends": ["html-validate:document"],
  "rules": {
    "doctype-style": ["error", { "style": "lowercase" }],
    "void-style": "off",
    "no-trailing-whitespace": "off",
    "require-sri": "off",
    "heading-level": "off",
    "valid-id": "off"
  }
}
```

## 4. GitHub Actions пайплайн

Полный файл `.github/workflows/pages.yml`:

```yaml
name: Deploy MkDocs to GitHub Pages

on:
  push:
    branches: [ "main" ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Python deps
        run: |
          python -m pip install --upgrade pip
          pip install mkdocs

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Install Node deps
        run: |
          if [ -f package-lock.json ]; then npm ci; else npm i; fi

      - name: Build MkDocs (to site/)
        run: mkdocs build --strict --site-dir ./site

      - name: PostCSS build
        run: npm run postcss

      - name: Typography
        run: npm run html:typo

      - name: Validate HTML
        run: npm run html:validate

      - name: Minify HTML
        run: npm run html:minify

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./site"

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - name: Deploy
        uses: actions/deploy-pages@v4
```

## 5. Детальное описание этапов сборки

### Этап 1: Подготовка окружения

1. **Checkout кода** (`actions/checkout@v4`)
   - Получение кода репозитория

2. **Установка Python** (`actions/setup-python@v5`)
   - Версия: Python 3.12
   - Необходима для работы MkDocs

3. **Установка Node.js** (`actions/setup-node@v4`)
   - Версия: Node.js 20
   - Необходима для PostCSS и других инструментов обработки

### Этап 2: Установка зависимостей

1. **Установка Python зависимостей**
   ```bash
   pip install mkdocs
   ```
   - Устанавливается MkDocs для генерации статического сайта

2. **Установка Node.js зависимостей**
   ```bash
   npm ci
   ```
   - Устанавливаются все пакеты из `package.json`:
     - `postcss`, `postcss-cli` — обработка CSS
     - `autoprefixer` — добавление vendor prefixes
     - `cssnano` — минификация CSS
     - `html-validate` — валидация HTML
     - `html-minifier-terser` — минификация HTML
     - `typogr` — улучшение типографики
     - `shx` — кросс-платформенные shell команды

### Этап 3: Сборка MkDocs

```bash
mkdocs build --strict --site-dir ./site
```

**Выполняемые действия:**
- Чтение конфигурации из `mkdocs.yml`
- Парсинг Markdown файлов из директории `docs/`
- Применение кастомной темы из `theme/`
- Генерация статических HTML файлов в директорию `site/`
- Флаг `--strict` включает строгую проверку на ошибки

**Результат:** Директория `site/` со всеми HTML, CSS и JS файлами

### Этап 4: Обработка CSS через PostCSS

```bash
npm run postcss
```

Скрипт в `package.json`:
```json
"postcss": "postcss docs/assets/css/main.css -o site/assets/css/main.css"
```

**Выполняемые действия:**
1. Чтение исходного CSS из `docs/assets/css/main.css`
2. Применение плагина **autoprefixer**:
   - Автоматическое добавление vendor prefixes (`-webkit-`, `-moz-`, `-ms-`)
   - Обеспечение совместимости с различными браузерами
3. Применение плагина **cssnano**:
   - Минификация CSS (удаление пробелов, комментариев)
   - Оптимизация свойств
   - Сжатие размеров файла
4. Запись обработанного CSS в `site/assets/css/main.css`

**Результат:** Оптимизированный и минифицированный CSS файл

### Этап 5: Улучшение типографики

```bash
npm run html:typo
```

Скрипт использует библиотеку `typogr` для автоматического улучшения типографики:
- Замена прямых кавычек на типографские (« »)
- Добавление неразрывных пробелов в нужных местах
- Корректное оформление тире и дефисов
- Другие типографические улучшения

**Результат:** HTML файлы с улучшенной типографикой

### Этап 6: Валидация HTML

```bash
npm run html:validate
```

Скрипт в `package.json`:
```json
"html:validate": "html-validate --config .htmlvalidate.json \"site/**/*.html\""
```

**Выполняемые действия:**
1. Проверка всех HTML файлов в директории `site/`
2. Валидация согласно правилам из `.htmlvalidate.json`
3. Проверка корректности разметки, структуры и атрибутов

**Результат:** Отчет о валидации. При наличии ошибок пайплайн прерывается.

### Этап 7: Минификация HTML

```bash
npm run html:minify
```

Скрипт в `package.json`:
```json
"html:minify": "shx mkdir -p site && html-minifier-terser --input-dir site --output-dir site --file-ext html --collapse-whitespace --remove-comments --remove-optional-tags --minify-css true --minify-js true"
```

**Выполняемые действия:**
1. Обработка всех HTML файлов в директории `site/`
2. Удаление лишних пробелов и переносов строк
3. Удаление комментариев
4. Минификация встроенных CSS и JavaScript
5. Удаление опциональных тегов
6. Сжатие атрибутов

**Результат:** Минифицированные HTML файлы с уменьшенным размером

### Этап 8: Загрузка артефакта

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: "./site"
```

**Выполняемые действия:**
- Загрузка директории `site/` как артефакт GitHub Actions
- Артефакт доступен для следующего job'а

### Этап 9: Деплой на GitHub Pages

```yaml
- name: Deploy
  uses: actions/deploy-pages@v4
```

**Выполняемые действия:**
- Развертывание артефакта на GitHub Pages
- Автоматическая публикация сайта
- Настройка правильных permissions через `id-token: write`

## 6. Результаты развертывания

### Выполненные требования

✅ **Собственная тема** — создана полностью кастомная тема на основе HTML, CSS, JS  
✅ **Кастомные header и footer** — реализованы в `theme/partials/`  
✅ **Стилизованная страница** — главная страница имеет кастомные стили  
✅ **Метаданные сайта** — добавлены теги `<meta>` с названием, описанием и автором  
✅ **GitHub Actions пайплайн** — настроен полный CI/CD процесс  
✅ **PostCSS** — интегрирован для обработки CSS  
✅ **Валидация HTML** — проверка корректности на каждом деплое  
✅ **Минификация HTML** — автоматическое сжатие файлов  
✅ **Улучшение типографики** — автоматическая обработка типографики  
✅ **Деплой на GitHub Pages** — автоматическая публикация сайта

### Оптимизации

- Минификация HTML, CSS и JavaScript
- Оптимизация CSS через cssnano
- Автоматическое добавление vendor prefixes
- Валидация кода на каждом деплое
- Улучшение типографики контента

### Автоматизация

При каждом пуше в ветку `main` автоматически:
1. Собирается сайт
2. Обрабатывается CSS
3. Улучшается типографика
4. Валидируется HTML
5. Минифицируются файлы
6. Развертывается на GitHub Pages

## 7. Локальная разработка

Для локальной разработки можно использовать:

```bash
# Запуск локального сервера
mkdocs serve

# Полная сборка (включая все этапы обработки)
npm run build

# Отдельные этапы
npm run postcss          # Обработка CSS
npm run html:typo        # Улучшение типографики
npm run html:validate    # Валидация HTML
npm run html:minify      # Минификация HTML
```

## Заключение

Успешно создан статический сайт с полностью кастомной темой и настроен автоматизированный пайплайн сборки и развертывания. Все требования задания выполнены, включая опциональное улучшение типографики. Сайт автоматически обновляется при каждом изменении кода в репозитории.