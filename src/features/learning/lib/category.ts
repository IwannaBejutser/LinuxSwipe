const categoryLabels: Record<string, string> = {
  Archives: 'Архивы',
  Automation: 'Автоматизация',
  'File Management': 'Файлы',
  Networking: 'Сеть',
  Navigation: 'Навигация',
  'Package Management': 'Пакеты',
  Permissions: 'Права доступа',
  Processes: 'Процессы',
  Search: 'Поиск',
  Services: 'Сервисы',
  Shell: 'Оболочка',
  'System Info': 'Информация о системе',
  'System Monitoring': 'Мониторинг',
  'Text Processing': 'Обработка текста',
  Users: 'Пользователи',
};

export function getCategoryLabel(category: string) {
  return categoryLabels[category] ?? category;
}
