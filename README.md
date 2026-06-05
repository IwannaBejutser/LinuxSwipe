# LinuxSwipe

LinuxSwipe - темный mobile-first тренажер Linux-команд. Приложение превращает практику командной строки в короткие учебные сессии: пользователь читает сценарий, вспоминает команду, проверяет ответ и свайпом решает, знает он ее или хочет повторить позже.

Production: [linuxswipe.expo.app](https://linuxswipe.expo.app)

## Идея продукта

Linux-команды легко узнавать в документации, но сложнее быстро вспомнить в реальной задаче или на собеседовании. LinuxSwipe построен вокруг active recall: сначала приложение скрывает команду и просит вспомнить ее самостоятельно, а уже потом показывает ответ, пример, подсказку и допустимые варианты.

Цель продукта не заменить документацию. Цель: помочь начинающим DevOps-инженерам, Linux-администраторам и support-специалистам набрать мышечную память в командах через короткие повторяемые подходы.

## Как работает обучение

Учебный сценарий намеренно короткий:

1. Пользователь получает карточку из текущей колоды.
2. Читает практический сценарий и пытается вспомнить команду.
3. Тапает по карточке, чтобы открыть ответ.
4. При необходимости открывает `Подробнее` с примером, подсказкой и пояснением.
5. Свайпает вверх, если команда уже уверенно знакома.
6. Свайпает вниз, если карточку нужно отправить на повтор.
7. Может ввести команду вручную, чтобы тренажер проверил ответ умнее, чем простое сравнение строк.

Интерфейс сделан как компактный темный mobile-продукт: крупная карточка, минимум chrome-элементов, быстрые фильтры, SVG-иконки, анимированный фон и отдельный экран статистики.

## Возможности

- 100 карточек по Linux-командам, сгруппированных по практическим темам.
- Переворот карточки по тапу для проверки ответа.
- Full-screen popup `Подробнее` с примером, подсказкой и допустимыми вариантами ответа.
- Свайпы вверх и вниз для оценки знания: `Знаю` и `На повтор`.
- Ручной ввод команды с умной проверкой пробелов, кавычек, `sudo` и альтернативных ответов.
- Фильтры по теме, сложности и режиму колоды.
- Очередь повторения с smart-repeat подмешиванием карточек обратно в поток.
- XP, level, streak, дневная цель и статистика ручных ответов.
- Локальное сохранение прогресса через `AsyncStorage`.
- Production web-deploy через EAS Hosting.

## Для кого

- Junior DevOps engineers
- Junior Linux administrators
- IT support engineers
- Студенты технических специальностей
- Пользователи, готовящиеся к собеседованиям

## Технологии

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- EAS Hosting
- react-native-svg

## Структура проекта

```text
LinuxSwipe/
  App.tsx
  app.json
  eas.json
  package.json
  public/
    favicon.ico
  assets/
    branding/
    icons/
  src/
    features/
      learning/
        components/
        context/
        data/
        hooks/
        lib/
        screens/
        storage/
        types/
        index.ts
    shared/
      components/
      theme/
```

Проект организован по feature-based подходу. Все, что относится к обучению, лежит в `src/features/learning`, а переиспользуемые UI- и theme-примитивы находятся в `src/shared`.

Внутри `src/features/learning`:

- `components/` содержит UI-блоки: карточки, sheets, модалки, toast и элементы учебной сессии.
- `hooks/` содержит поведение экрана: сборка колоды, свайпы, ручной ответ и toast feedback.
- `lib/` содержит чистую бизнес-логику: проверка команд, сборка колоды, XP, даты, статистика и нормализация состояния.
- `context/` отдает публичный API учебного состояния и координирует сохранение прогресса.
- `data/` хранит текущую локальную коллекцию карточек.
- `storage/` изолирует работу с `AsyncStorage`.
- `types/` хранит общие типы learning-домена.

## Модель карточки

```ts
{
  id: string;
  command: string;
  question: string;
  hint: string;
  answer: string;
  acceptedAnswers?: string[];
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}
```

## Темы карточек

В текущей колоде 100 карточек по темам:

- Archives
- Automation
- File Management
- Networking
- Navigation
- Package Management
- Permissions
- Processes
- Search
- Services
- Shell
- System Info
- System Monitoring
- Text Processing
- Users

## Локальный запуск

Установить зависимости:

```bash
npm install
```

Запустить Expo:

```bash
npm start
```

Запустить конкретную платформу:

```bash
npm run android
npm run ios
npm run web
```

Проверить TypeScript:

```bash
npm run typecheck
```

## Web-deploy

LinuxSwipe выкатывается через EAS Hosting.

Для ручного production-deploy сначала нужно собрать свежий статический web-export:

```bash
npx expo export --platform web --output-dir dist-prod
```

Затем этот export загружается в EAS Hosting и продвигается в production:

```bash
npx eas-cli@latest deploy --prod --export-dir dist-prod
```

`dist-prod/` - это локальный сборочный артефакт. Он создается перед deploy, загружается в EAS Hosting и не должен попадать в Git.

В проекте также есть EAS workflow-файлы в `.eas/workflows/`:

- `deploy-web.yml` выкатывает web-версию из `main`.
- `pr-preview.yml` создает preview-deployments для pull request.

## Что хранить в Git

Нужно хранить:

- `app.json`, потому что он описывает Expo-приложение.
- `eas.json`, потому что это конфигурация EAS для проекта.
- `.eas/workflows/*.yml`, потому что workflow-файлы являются частью deploy-инфраструктуры.
- Исходный код, ассеты, `public/`, package-файлы и документацию.

Не нужно хранить:

- `node_modules/`
- `.expo/`
- `dist/`
- `dist-prod/`
- локальные скриншоты и временные browser-профили
- секреты, токены и приватные service-account файлы

## Текущий статус

Stage: active product prototype.

Готово:

- Expo-каркас приложения
- нижняя навигация между `Карточки` и `Статистика`
- учебный сценарий на карточках
- переворот карточек по тапу
- свайпы вверх и вниз для оценки знания
- фильтрация по категориям и сложности
- локальное сохранение прогресса
- ручной ввод ответа
- подробное объяснение карточки в popup
- XP, streak, level и дневная цель
- расширенная колода Linux-команд
- production deploy через EAS Hosting

## Roadmap

1. Добавить прогресс по темам.
2. Разделить режимы на `Новые`, `На повторе` и `Освоенные`.
3. Улучшить проверку ручного ответа до объяснения конкретной ошибки.
4. Подготовить будущую схему БД для хранения карточек.
5. Добавить подборки: `DevOps`, `Interview`, `Networking`, `Permissions`.
