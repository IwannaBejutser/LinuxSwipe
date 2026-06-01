import { Card } from "../types/card";

export const cards: Card[] = [
  {
    id: "grep-error-log",
    command: "grep",
    question: "Как найти строки с текстом error в файле app.log?",
    hint: "Нужны шаблон в кавычках и имя файла.",
    answer: "grep \"error\" app.log",
    category: "Search",
    difficulty: "easy"
  },
  {
    id: "pwd-current-dir",
    command: "pwd",
    question: "Как показать текущую директорию в терминале?",
    hint: "Это короткая команда из трех букв.",
    answer: "pwd",
    category: "Navigation",
    difficulty: "easy"
  },
  {
    id: "ls-hidden-files",
    command: "ls",
    question: "Как показать файлы, включая скрытые, в текущей папке?",
    hint: "Нужен флаг для hidden entries.",
    answer: "ls -la",
    category: "File Management",
    difficulty: "easy"
  },
  {
    id: "cd-parent",
    command: "cd",
    question: "Как перейти на один уровень выше?",
    hint: "Используется специальная ссылка на родительский каталог.",
    answer: "cd ..",
    category: "Navigation",
    difficulty: "easy"
  },
  {
    id: "chmod-script",
    command: "chmod",
    question: "Как дать владельцу право на выполнение файла deploy.sh?",
    hint: "Используется флаг +x.",
    answer: "chmod +x deploy.sh",
    category: "Permissions",
    difficulty: "medium"
  },
  {
    id: "find-nginx-conf",
    command: "find",
    question: "Как найти файл nginx.conf начиная с /etc?",
    hint: "Нужны стартовая директория, фильтр по имени и имя файла.",
    answer: "find /etc -name nginx.conf",
    category: "Search",
    difficulty: "medium"
  },
  {
    id: "tail-follow-log",
    command: "tail",
    question: "Как следить за обновлением файла server.log в реальном времени?",
    hint: "Используется флаг follow.",
    answer: "tail -f server.log",
    category: "System Monitoring",
    difficulty: "easy"
  },
  {
    id: "ps-node-processes",
    command: "ps",
    question: "Как найти процессы, связанные с node?",
    hint: "Команду ps часто объединяют с grep.",
    answer: "ps aux | grep node",
    category: "Processes",
    difficulty: "medium"
  },
  {
    id: "systemctl-nginx-status",
    command: "systemctl",
    question: "Как проверить статус сервиса nginx?",
    hint: "После команды нужен подкомандный status и имя сервиса.",
    answer: "systemctl status nginx",
    category: "Services",
    difficulty: "medium"
  },
  {
    id: "df-human",
    command: "df",
    question: "Как посмотреть использование диска в удобном для чтения формате?",
    hint: "Нужен human-readable режим.",
    answer: "df -h",
    category: "System Monitoring",
    difficulty: "easy"
  },
  {
    id: "ip-address",
    command: "ip",
    question: "Как показать IP-адреса сетевых интерфейсов?",
    hint: "Используется подкоманда address в короткой форме.",
    answer: "ip a",
    category: "Networking",
    difficulty: "medium"
  },
  {
    id: "apt-update",
    command: "apt",
    question: "Как обновить список пакетов в Debian или Ubuntu?",
    hint: "Нужна подкоманда update, обычно через sudo.",
    answer: "sudo apt update",
    category: "Package Management",
    difficulty: "easy"
  }
];
