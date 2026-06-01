## Project Overview

LinuxSwipe — мобильное приложение для изучения Linux-команд в формате коротких карточек, вдохновлённое TikTok и Duolingo.

Основная цель приложения — помочь начинающим Linux, DevOps и System Administrator специалистам быстро запоминать команды через постоянную практику.

Целевая аудитория:

* Junior DevOps
* Junior Linux Administrator
* IT Support Engineer
* Студенты технических специальностей
* Пользователи, готовящиеся к собеседованиям

---

## MVP Goals

Первая версия должна позволять пользователю:

1. Просматривать карточки с Linux-командами.
2. Получать подсказку по команде.
3. Просматривать правильный ответ.
4. Переходить к следующей карточке.
5. Отмечать карточку как:

   * Знаю
   * Повторить позже

Без авторизации.

Без сервера.

Все данные хранятся локально.

---

## Technology Stack

Frontend:

* React Native
* Expo
* TypeScript

State Management:

* React Context (на старте)

Storage:

* AsyncStorage

Navigation:

* React Navigation

Backend:

* Не требуется для MVP

Database:

* Не требуется для MVP

---

## Application Structure

Screens:

### HomeScreen

Главный экран приложения.

Отображает:

* карточку команды
* кнопки взаимодействия
* прогресс обучения

### StatsScreen

Статистика пользователя.

Показывает:

* изучено карточек
* известно команд
* требуется повторить

---

## Card Structure

Каждая карточка содержит:

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

Пример:

```ts
{
  id: "1",
  command: "grep",
  question: "Как найти строку error в файле app.log?",
  hint: "Нужен шаблон и имя файла",
  answer: 'grep "error" app.log',
  category: "search",
  difficulty: "easy"
}
```

---

## Initial Categories

* File Management
* Navigation
* Search
* Permissions
* Processes
* Networking
* System Monitoring
* Services
* Package Management
* DevOps Basics

---

## Learning Flow

Пользователь открывает приложение.

Показывается карточка.

Сценарий:

1. Читает вопрос.
2. Думает над ответом.
3. Нажимает "Подсказка" при необходимости.
4. Нажимает "Показать ответ".
5. Выбирает:

   * Знаю
   * Повторить позже
6. Загружается следующая карточка.

---

## Future Features

### Swipe Gestures

Свайпы как в TikTok:

* вверх → знаю
* вниз → повторить позже

### Daily Streak

Отслеживание дней подряд.

### XP System

Получение опыта за изучение команд.

### Levels

* Linux Beginner
* Linux User
* Linux Administrator
* Linux Engineer
* DevOps Engineer

### Interview Mode

Режим подготовки к собеседованию.

Пример:

Вопрос:
Что делает команда:

```bash
chmod 755 file.txt
```

Пользователь отвечает самостоятельно.

После показывает объяснение.

### Command Simulator

Мини-терминал внутри приложения.

Пользователь вводит команды.

Приложение проверяет корректность ответа.

### Cloud Sync

Синхронизация прогресса через аккаунт.

---

## Design Principles

Приложение должно быть:

* максимально простым
* быстрым
* без перегруженного интерфейса
* ориентированным на ежедневное использование
* похожим на смесь TikTok + Duolingo для Linux

---

## Current Project Status

Stage: Planning

Next Steps:

1. Создать Expo проект.
2. Настроить TypeScript.
3. Создать структуру директорий.
4. Реализовать HomeScreen.
5. Создать первую коллекцию карточек.
6. Реализовать показ подсказки.
7. Реализовать показ ответа.
8. Реализовать переход между карточками.

Project Name:

LinuxSwipe
