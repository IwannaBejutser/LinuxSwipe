# LinuxSwipe

LinuxSwipe — тренажер Linux-команд в формате коротких карточек. Пользователь видит практический сценарий, вспоминает команду, проверяет ответ и оценивает знание свайпом или ручным вводом.

Production: [https://linuxswipe.expo.app](https://linuxswipe.expo.app)

## Что реализовано

Текущая версия включает:

1. Учебную колоду на `100` карточек по Linux-командам.
2. Переворот карточки по тапу для проверки ответа.
3. Full-screen popup `Подробнее` с примером, подсказкой и допустимыми вариантами ответа.
4. Свайпы вверх/вниз для оценки карточки:
   - `Знаю`
   - `На повтор`
5. Ручной ввод команды с умной проверкой пробелов, кавычек, `sudo` и допустимых вариантов.
6. Фильтры по теме, сложности и режиму колоды.
7. Очередь повторения и smart-repeat подмешивание карточек в поток.
8. XP, level, streak, дневную цель и статистику ручных ответов.
9. Локальное сохранение прогресса через `AsyncStorage`.
10. Dark UI с анимированным фоном и кастомными SVG-иконками.

Авторизация и сервер пока не используются.

## Целевая аудитория

- Junior DevOps
- Junior Linux Administrator
- IT Support Engineer
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
  assets/
    branding/
    icons/
  public/
    favicon.ico
  package.json
  eas.json
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
        AnimatedBackdrop.tsx
        icons/
      theme/
```

Архитектура сейчас ближе к feature-based подходу: все, что относится к обучению, лежит в `src/features/learning`, а переиспользуемые элементы находятся в `src/shared`.

Внутри `src/features/learning` логика разделена по ответственности:

- `components/` — UI-блоки учебного экрана: карточка, фильтры, модалки, toast и action dock.
- `hooks/` — сценарии поведения: сборка учебной колоды, свайпы, ручной ответ и toast feedback.
- `lib/` — чистая бизнес-логика: проверка команд, сортировка колоды, XP, статистика, даты и нормализация состояния.
- `context/` — публичный learning state, reducer и сохранение прогресса.

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

## Коллекция карточек

В проект добавлены `100` карточек по темам:

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

## Как запустить

1. Установить зависимости:

```bash
npm install
```

2. Запустить проект:

```bash
npm start
```

Дополнительно:

```bash
npm run android
npm run ios
npm run web
```

Проверка TypeScript:

```bash
npm run typecheck
```

## Web deploy

Проект выкатывается на EAS Hosting.

Локальная web-сборка:

```bash
npx expo export --platform web --output-dir dist-prod
```

Production deploy:

```bash
npx eas-cli@latest deploy --prod --export-dir dist-prod
```

`dist-prod/` — сборочный артефакт. Он не должен храниться в Git.

## Текущий статус

Stage: active product prototype

Готово:

- каркас Expo-приложения
- нижняя навигация между `Карточки` и `Статистика`
- сценарий обучения по карточкам
- переворот карточек по тапу
- свайпы вверх/вниз для оценки знания
- фильтрация по категориям и сложности
- локальное сохранение прогресса
- ручной ввод ответа
- подробное объяснение карточки в popup
- XP, streak, level и дневная цель
- расширенная колода Linux-команд
- production deploy через EAS Hosting

## Следующие шаги

1. Добавить прогресс по темам.
2. Разделить режимы `Новые`, `На повторе`, `Освоенные`.
3. Улучшить проверку ручного ответа до объяснения конкретной ошибки.
4. Подготовить будущую схему БД для хранения карточек.
5. Добавить подборки: `DevOps`, `Interview`, `Networking`, `Permissions`.
