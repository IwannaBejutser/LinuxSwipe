# LinuxSwipe

LinuxSwipe — мобильное приложение для изучения Linux-команд в формате коротких карточек. Идея проекта: совместить быстрый ритм коротких свайп-карточек с учебной дисциплиной, знакомой по языковым тренажерам.

## Что уже реализовано

Текущий MVP включает:

1. Экран карточек с вопросом по Linux-команде.
2. Переворот карточки по тапу для показа ответа.
3. Показ ответа, подсказки и примера использования на обратной стороне.
4. Переход к следующей карточке через свайп с любой стороны карточки:
   - `Знаю`
   - `Повторить позже`
5. Индикатор прогресса по колоде.
6. Экран статистики.
7. Сохранение локального прогресса через `AsyncStorage`.

Авторизация и сервер для MVP не используются.

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

## Структура проекта

```text
LinuxSwipe/
  App.tsx
  app.json
  package.json
  src/
    constants/
      cards.ts
    context/
      LearningContext.tsx
    screens/
      HomeScreen.tsx
      StatsScreen.tsx
    storage/
      learningStorage.ts
    theme/
      palette.ts
    types/
      card.ts
      progress.ts
```

## Модель карточки

```ts
{
  id: string;
  command: string;
  question: string;
  hint: string;
  answer: string;
  example: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
}
```

## Стартовая коллекция карточек

В проект уже добавлены 31 карточка по темам:

- File Management
- Navigation
- Search
- Permissions
- Processes
- Networking
- System Monitoring
- Services
- Package Management

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

## Текущий статус

Stage: MVP in progress

Готово:

- каркас Expo-приложения
- нижняя навигация между `Карточки` и `Статистика`
- сценарий обучения по карточкам
- переворот карточек по тапу
- свайпы вверх/вниз для оценки знания
- фильтрация по категориям и сложности
- локальное сохранение прогресса
- расширенный набор Linux-команд

## Следующие шаги

1. Реализовать режим повторения только для карточек `Повторить позже`.
2. Добавить streak, XP и интервальные повторения.
3. Разделить карточки на учебные наборы и подборки для собеседований.
4. Добавить поиск по командам и тегам.
5. Подумать над озвучкой, mini-quiz и режимом "введи команду руками".
