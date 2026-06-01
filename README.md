# LinuxSwipe

LinuxSwipe — мобильное приложение для изучения Linux-команд в формате коротких карточек. Идея проекта: совместить быстрый ритм коротких свайп-карточек с учебной дисциплиной, знакомой по языковым тренажерам.

## Что уже реализовано

Текущий MVP включает:

1. Экран карточек с вопросом по Linux-команде.
2. Показ подсказки.
3. Показ правильного ответа.
4. Переход к следующей карточке через отметку:
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
  category: string;
  difficulty: "easy" | "medium" | "hard";
}
```

## Стартовая коллекция карточек

В проект уже добавлены карточки по темам:

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
- локальное сохранение прогресса
- стартовый набор Linux-команд

## Следующие шаги

1. Добавить фильтрацию карточек по категориям и сложности.
2. Реализовать режим повторения только для карточек `Повторить позже`.
3. Добавить анимации и свайпы вверх/вниз.
4. Расширить банк карточек.
5. Добавить streak, XP и интервальные повторения.
