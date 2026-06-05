import { Card } from "../types/card";

export const cards: Card[] = [
  {
    id: "grep-error-log",
    command: "grep",
    question: "Как найти строки с текстом error в файле app.log?",
    hint: "Нужны шаблон в кавычках и имя файла.",
    answer: "grep \"error\" app.log",
    acceptedAnswers: ["grep 'error' app.log", "grep error app.log"],
    example: "Например, так быстро ищут ошибки в `app.log` после падения сервиса.",
    category: "Search",
    difficulty: "easy"
  },
  {
    id: "pwd-current-dir",
    command: "pwd",
    question: "Как показать текущую директорию в терминале?",
    hint: "Это короткая команда из трех букв.",
    answer: "pwd",
    example: "Полезно перед копированием файлов, чтобы убедиться, где вы сейчас находитесь.",
    category: "Navigation",
    difficulty: "easy"
  },
  {
    id: "ls-hidden-files",
    command: "ls",
    question: "Как показать файлы, включая скрытые, в текущей папке?",
    hint: "Нужен флаг для hidden entries.",
    answer: "ls -la",
    acceptedAnswers: ["ls -al"],
    example: "Так можно увидеть `.env`, `.gitignore` и другие скрытые файлы проекта.",
    category: "File Management",
    difficulty: "easy"
  },
  {
    id: "cd-parent",
    command: "cd",
    question: "Как перейти на один уровень выше?",
    hint: "Используется специальная ссылка на родительский каталог.",
    answer: "cd ..",
    example: "Если вы в `/var/log/nginx`, команда вернет вас в `/var/log`.",
    category: "Navigation",
    difficulty: "easy"
  },
  {
    id: "chmod-script",
    command: "chmod",
    question: "Как дать владельцу право на выполнение файла deploy.sh?",
    hint: "Используется флаг +x.",
    answer: "chmod +x deploy.sh",
    example: "После этого скрипт можно запускать как `./deploy.sh`.",
    category: "Permissions",
    difficulty: "medium"
  },
  {
    id: "find-nginx-conf",
    command: "find",
    question: "Как найти файл nginx.conf начиная с /etc?",
    hint: "Нужны стартовая директория, фильтр по имени и имя файла.",
    answer: "find /etc -name nginx.conf",
    acceptedAnswers: ["find /etc -name \"nginx.conf\"", "find /etc -name 'nginx.conf'"],
    example: "Удобно, если конфиг лежит не там, где вы ожидали.",
    category: "Search",
    difficulty: "medium"
  },
  {
    id: "tail-follow-log",
    command: "tail",
    question: "Как следить за обновлением файла server.log в реальном времени?",
    hint: "Используется флаг follow.",
    answer: "tail -f server.log",
    example: "Часто так смотрят live-логи приложения во время деплоя.",
    category: "System Monitoring",
    difficulty: "easy"
  },
  {
    id: "ps-node-processes",
    command: "ps",
    question: "Как найти процессы, связанные с node?",
    hint: "Команду ps часто объединяют с grep.",
    answer: "ps aux | grep node",
    acceptedAnswers: ["ps aux|grep node"],
    example: "Помогает быстро найти зависший `node`-процесс на сервере.",
    category: "Processes",
    difficulty: "medium"
  },
  {
    id: "systemctl-nginx-status",
    command: "systemctl",
    question: "Как проверить статус сервиса nginx?",
    hint: "После команды нужен подкомандный status и имя сервиса.",
    answer: "systemctl status nginx",
    example: "Так можно понять, запущен ли сервис и почему он не стартует.",
    category: "Services",
    difficulty: "medium"
  },
  {
    id: "df-human",
    command: "df",
    question: "Как посмотреть использование диска в удобном для чтения формате?",
    hint: "Нужен human-readable режим.",
    answer: "df -h",
    example: "Когда раздел почти заполнен, эта команда сразу показывает размеры в GB и MB.",
    category: "System Monitoring",
    difficulty: "easy"
  },
  {
    id: "ip-address",
    command: "ip",
    question: "Как показать IP-адреса сетевых интерфейсов?",
    hint: "Используется подкоманда address в короткой форме.",
    answer: "ip a",
    acceptedAnswers: ["ip address"],
    example: "Полезно, когда нужно быстро узнать IP сервера или контейнера.",
    category: "Networking",
    difficulty: "medium"
  },
  {
    id: "apt-update",
    command: "apt",
    question: "Как обновить список пакетов в Debian или Ubuntu?",
    hint: "Нужна подкоманда update, обычно через sudo.",
    answer: "sudo apt update",
    example: "Перед установкой пакетов обычно сначала обновляют индекс репозиториев.",
    category: "Package Management",
    difficulty: "easy"
  },
  {
    id: "mkdir-parents",
    command: "mkdir",
    question: "Как создать папку logs и сразу вложенную archive, даже если logs еще нет?",
    hint: "Нужен флаг для создания промежуточных директорий.",
    answer: "mkdir -p logs/archive",
    example: "Удобно в setup-скриптах, где структура папок должна создаваться с нуля.",
    category: "File Management",
    difficulty: "easy"
  },
  {
    id: "cp-recursive",
    command: "cp",
    question: "Как скопировать директорию config целиком в backup/config?",
    hint: "Для папок нужен рекурсивный режим.",
    answer: "cp -r config backup/config",
    example: "Так часто делают резервную копию конфигов перед изменениями.",
    category: "File Management",
    difficulty: "medium"
  },
  {
    id: "mv-rename-file",
    command: "mv",
    question: "Как переименовать файл notes.txt в notes-old.txt?",
    hint: "Одна и та же команда и перемещает, и переименовывает.",
    answer: "mv notes.txt notes-old.txt",
    example: "Быстрый способ сохранить старую версию файла перед редактированием.",
    category: "File Management",
    difficulty: "easy"
  },
  {
    id: "cat-file-content",
    command: "cat",
    question: "Как вывести содержимое файла .env на экран?",
    hint: "Команда просто печатает содержимое файла в терминал.",
    answer: "cat .env",
    example: "Подходит для коротких файлов, которые нужно быстро проверить.",
    category: "File Management",
    difficulty: "easy"
  },
  {
    id: "grep-recursive-todo",
    command: "grep",
    question: "Как найти все вхождения TODO внутри папки src?",
    hint: "Нужен рекурсивный поиск по каталогу.",
    answer: "grep -R \"TODO\" src",
    acceptedAnswers: ["grep -R 'TODO' src", "grep -R TODO src", "grep -r TODO src"],
    example: "Полезно перед релизом, чтобы найти оставшиеся заметки в коде.",
    category: "Search",
    difficulty: "medium"
  },
  {
    id: "find-log-files",
    command: "find",
    question: "Как найти все файлы с расширением .log в текущей папке и ниже?",
    hint: "Нужен поиск по типу файла и шаблону имени.",
    answer: "find . -type f -name \"*.log\"",
    acceptedAnswers: ["find . -type f -name '*.log'"],
    example: "Так можно быстро собрать все логи проекта для анализа или очистки.",
    category: "Search",
    difficulty: "medium"
  },
  {
    id: "chown-user-group",
    command: "chown",
    question: "Как назначить владельцем и группой для файла app.conf пользователя deploy?",
    hint: "Нужно указать `пользователь:группа` перед именем файла.",
    answer: "chown deploy:deploy app.conf",
    example: "Часто применяют после копирования конфигов от root к сервисному пользователю.",
    category: "Permissions",
    difficulty: "medium"
  },
  {
    id: "chmod-readonly-file",
    command: "chmod",
    question: "Как выдать файлу config.yml права 644?",
    hint: "Используется числовая запись прав доступа.",
    answer: "chmod 644 config.yml",
    example: "Это типичный режим для конфигов, которые не должны быть исполняемыми.",
    category: "Permissions",
    difficulty: "medium"
  },
  {
    id: "top-cpu-usage",
    command: "top",
    question: "Как открыть интерактивный монитор процессов и нагрузки?",
    hint: "Это короткая встроенная утилита без дополнительных флагов.",
    answer: "top",
    example: "Полезно, когда сервер начинает тормозить и нужно увидеть лидеров по CPU.",
    category: "Processes",
    difficulty: "easy"
  },
  {
    id: "kill-process",
    command: "kill",
    question: "Как завершить процесс с PID 4242 обычным сигналом TERM?",
    hint: "Достаточно указать команду и сам PID.",
    answer: "kill 4242",
    example: "Так мягко останавливают зависший процесс перед более жесткими мерами.",
    category: "Processes",
    difficulty: "medium"
  },
  {
    id: "free-memory",
    command: "free",
    question: "Как посмотреть использование оперативной памяти в человекочитаемом виде?",
    hint: "Нужен тот же флаг, что и у `df` для удобного формата.",
    answer: "free -h",
    example: "Команда помогает понять, заканчивается ли RAM на машине.",
    category: "System Monitoring",
    difficulty: "easy"
  },
  {
    id: "du-directory-size",
    command: "du",
    question: "Как узнать суммарный размер папки uploads в удобном формате?",
    hint: "Нужны краткий итог и human-readable вывод.",
    answer: "du -sh uploads",
    example: "Так можно быстро найти тяжелую директорию без длинного списка по файлам.",
    category: "System Monitoring",
    difficulty: "medium"
  },
  {
    id: "ss-listening-ports",
    command: "ss",
    question: "Как показать все слушающие TCP и UDP порты с процессами?",
    hint: "Нужны флаги для listening sockets, обоих протоколов и имен процессов.",
    answer: "ss -tulpn",
    acceptedAnswers: ["ss -lntup", "ss -lupnt", "ss -ltnup"],
    example: "Удобно, когда нужно понять, какой процесс занял нужный порт.",
    category: "Networking",
    difficulty: "hard"
  },
  {
    id: "ping-check-host",
    command: "ping",
    question: "Как отправить 4 ICMP-запроса на 8.8.8.8?",
    hint: "Нужен флаг для ограничения количества пакетов.",
    answer: "ping -c 4 8.8.8.8",
    example: "Это быстрый способ проверить базовую сетевую доступность.",
    category: "Networking",
    difficulty: "easy"
  },
  {
    id: "curl-head-request",
    command: "curl",
    question: "Как получить только HTTP-заголовки от https://example.com?",
    hint: "Нужен HEAD-запрос коротким флагом.",
    answer: "curl -I https://example.com",
    acceptedAnswers: ["curl --head https://example.com"],
    example: "Полезно для проверки статуса сайта и заголовков без скачивания тела ответа.",
    category: "Networking",
    difficulty: "medium"
  },
  {
    id: "systemctl-restart-nginx",
    command: "systemctl",
    question: "Как перезапустить сервис nginx?",
    hint: "Используется подкоманда restart, обычно через sudo.",
    answer: "sudo systemctl restart nginx",
    example: "Обычно это делают после правок в конфиге и проверки `nginx -t`.",
    category: "Services",
    difficulty: "easy"
  },
  {
    id: "journalctl-follow-service",
    command: "journalctl",
    question: "Как смотреть логи сервиса nginx в реальном времени через systemd?",
    hint: "Нужны флаги для фильтра по юниту и follow-режима.",
    answer: "journalctl -u nginx -f",
    acceptedAnswers: ["journalctl --unit nginx -f"],
    example: "Очень удобно на системах, где сервис пишет логи не в файл, а в journal.",
    category: "Services",
    difficulty: "hard"
  },
  {
    id: "apt-install-package",
    command: "apt",
    question: "Как установить пакет htop в Debian или Ubuntu?",
    hint: "После update обычно используют подкоманду install.",
    answer: "sudo apt install htop",
    example: "Это типичный сценарий, когда на сервер нужно быстро поставить утилиту мониторинга.",
    category: "Package Management",
    difficulty: "easy"
  },
  {
    id: "apt-upgrade-packages",
    command: "apt",
    question: "Как обновить уже установленные пакеты до новых версий?",
    hint: "Используется подкоманда upgrade, как правило через sudo.",
    answer: "sudo apt upgrade",
    example: "Так накатывают обновления безопасности после обновления индекса пакетов.",
    category: "Package Management",
    difficulty: "medium"
  }
];
