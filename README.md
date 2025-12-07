# MkDocs сайт с кастомной темой и CI/CD

Статический сайт документации, созданный с использованием MkDocs, собственной HTML/CSS/JS темы и автоматизированного развертывания через GitHub Actions на GitHub Pages.

## Описание проекта

Проект представляет собой статический сайт документации, построенный на базе MkDocs с полностью кастомной темой. Сайт автоматически собирается, валидируется, обрабатывается и развертывается на GitHub Pages при каждом пуше в ветку `main`.

## Структура проекта

```
python-itmo/
├── .github/
│   └── workflows/
│       └── pages.yml          # GitHub Actions пайплайн
├── docs/                      # Исходные Markdown файлы
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css       # Исходные CSS стили
│   │   └── js/
│   │       └── main.js        # JavaScript функциональность
│   ├── index.md               # Главная страница
│   ├── report.md              # Отчет о развертывании
│   └── research.md            # Исследование
├── theme/                     # Кастомная тема MkDocs
│   ├── main.html              # Главный шаблон (Jinja2)
│   └── partials/
│       ├── header.html        # Кастомный header
│       └── footer.html        # Кастомный footer
├── site/                      # Сгенерированный статический сайт (не в git)
├── mkdocs.yml                 # Конфигурация MkDocs
├── package.json               # Node.js зависимости и скрипты
├── postcss.config.js          # Конфигурация PostCSS
├── .htmlvalidate.json         # Конфигурация валидации HTML
└── README.md                  # Этот файл
```

## Собственная тема

Проект использует полностью кастомную тему на основе Jinja2 шаблонов:

- **`theme/main.html`** — основной шаблон страницы с метаданными, подключением CSS/JS и структурой layout
- **`theme/partials/header.html`** — кастомный header с названием сайта и описанием
- **`theme/partials/footer.html`** — кастомный footer с информацией об авторе и ссылкой на GitHub

Тема включает:
- Адаптивную верстку с grid layout
- Кастомные стили с CSS переменными
- JavaScript для прогрессивных улучшений (открытие внешних ссылок в новой вкладке)

## Этапы сборки и развертывания

Сборка и развертывание выполняются автоматически через GitHub Actions. Пайплайн находится в файле `.github/workflows/pages.yml` и состоит из следующих этапов:

### 1. Подготовка окружения

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-python@v5
- uses: actions/setup-node@v4
```

Устанавливаются:
- Python 3.12 для MkDocs
- Node.js 20 для PostCSS и других инструментов обработки

### 2. Установка зависимостей

```yaml
- name: Install Python deps
  run: pip install mkdocs

- name: Install Node deps
  run: npm ci
```

Устанавливаются все необходимые пакеты из `package.json`.

### 3. Сборка MkDocs

```yaml
- name: Build MkDocs (to site/)
  run: mkdocs build --strict --site-dir ./site
```

MkDocs генерирует статический HTML сайт из Markdown файлов, применяя кастомную тему.

### 4. Обработка CSS через PostCSS

```yaml
- name: PostCSS build
  run: npm run postcss
```

Выполняется:
- **Autoprefixer** — автоматическое добавление vendor prefixes для совместимости с браузерами
- **cssnano** — минификация и оптимизация CSS

PostCSS обрабатывает `docs/assets/css/main.css` и выводит результат в `site/assets/css/main.css`.

### 5. Улучшение типографики

```yaml
- name: Typography
  run: npm run html:typo
```

Применяется библиотека `typogr` для улучшения типографики:
- Правильные кавычки (« »)
- Неразрывные пробелы
- Другие типографические улучшения

### 6. Валидация HTML

```yaml
- name: Validate HTML
  run: npm run html:validate
```

Проверяется корректность всех HTML файлов с использованием `html-validate` согласно правилам из `.htmlvalidate.json`.

### 7. Минификация HTML

```yaml
- name: Minify HTML
  run: npm run html:minify
```

Выполняется минификация всех HTML файлов через `html-minifier-terser`:
- Удаление лишних пробелов и переносов строк
- Удаление комментариев
- Минификация встроенных CSS и JavaScript

### 8. Деплой на GitHub Pages

```yaml
- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  
- name: Deploy
  uses: actions/deploy-pages@v4
```

Собранный сайт загружается как артефакт и автоматически развертывается на GitHub Pages.

## Инструменты и технологии

### Основные

- **MkDocs** — генератор статической документации
- **Python 3.12** — среда выполнения MkDocs
- **Node.js 20** — среда для инструментов сборки

### Инструменты обработки

- **PostCSS** — обработка CSS с плагинами:
  - `autoprefixer` — автоматические vendor prefixes
  - `cssnano` — минификация CSS
- **html-validate** — валидация HTML
- **html-minifier-terser** — минификация HTML
- **typogr** — улучшение типографики

## Локальная разработка

### Предварительные требования

- Python 3.12+
- Node.js 20+
- npm или yarn

### Установка

```bash
# Установка Python зависимостей
pip install mkdocs

# Установка Node.js зависимостей
npm install
```

### Запуск локального сервера

```bash
mkdocs serve
```

Сайт будет доступен по адресу http://127.0.0.1:8000

### Сборка локально

```bash
# Полная сборка с обработкой
npm run build

# Отдельные этапы
npm run postcss          # Обработка CSS
npm run html:validate    # Валидация HTML
npm run html:minify      # Минификация HTML
npm run html:typo        # Улучшение типографики
```

## Метаданные сайта

Сайт включает следующие метаданные (определены в `mkdocs.yml` и шаблоне):

- **Название**: Юлия Каримова — DevOps & Python
- **Описание**: Проектирование и развертывание веб-решений в эко-системе Python
- **Автор**: Yuliya karimova

Метаданные добавляются в HTML через теги `<meta>` и Open Graph теги для корректного отображения при расшаривании в социальных сетях.

## Особенности реализации

1. **Кастомная тема** — полностью собственная реализация без использования стандартных тем MkDocs
2. **Автоматизация сборки** — все этапы обработки интегрированы в CI/CD пайплайн
3. **Качество кода** — валидация HTML на каждом деплое
4. **Оптимизация** — минификация HTML, CSS и JavaScript для уменьшения размера
5. **Типографика** — автоматическое улучшение типографики контента
6. **Современный стек** — использование актуальных версий инструментов

## Ссылки

- Сайт: https://yuliya-karimova.github.io/python-itmo/
- Репозиторий: https://github.com/yuliya-karimova/python-itmo

