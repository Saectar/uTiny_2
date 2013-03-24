var get_lang = function(lang) {
    var lang_arr_en = {
        0: 'Start',
        1: 'Pause',
        2: 'Stop',
        3: 'Force Start',
        4: 'Resume',
        5: 'Force Re-Check',
        6: 'Remove',
        7: 'Remove and',
        8: 'Delete torrent',
        9: 'Delete data',
        10: 'Delete data + torrent',
        11: 'Label',
        12: 'Remove label',
        13: ['Name', 'Name'],
        14: ['Size', 'Size'],
        15: ['Dune', 'Dune'],
        16: ['Status', 'Status'],
        17: ['ETA', 'ETA'],
        18: ['Down S', 'Down Speed'],
        19: ['Up S', 'Up Speed'],
        20: ['S/P', 'Seeds/Peers'],
        21: ['Controls', 'Controls'],
        22: 'Connected',
        23: 'Error',
        24: 'Refresh',
        25: 'Donate',
        26: 'uTorrent web-interface',
        27: 'Enter login',
        28: 'Enter password',
        29: 'Enter host',
        30: 'Enter port number',
        31: 'Enter path',
        32: 'Enter interval check notification',
        33: 'Enter notification display interval',
        34: 'Authorization error!',
        35: 'Page not found! uTorrent not found!',
        36: 'uTorrent not found. Address not valid!',
        37: 'Setup complete!',
        38: 'Failed to get token! Possible wrong path.',
        39: 'Setup',
        40: 'uTorrent Server',
        41: 'Host:',
        42: 'Port:',
        43: 'Path:',
        44: 'uTorrent WebUI URL:',
        45: 'uTorrent authorization',
        46: 'Username:',
        47: 'Password:',
        48: 'Notification setup',
        49: 'Show notification:',
        50: ['Check interval:', ' (sec.)'],
        51: ['Notification display interval:', ' (0 - unlimited, sec.)'],
        52: 'Manager setup',
        53: ['Update manager interval:', ' (sec.)'],
        54: 'Hide <b>finished</b> torrents from manager:',
        55: 'Hide <b>seeding</b> torrents from manager:',
        56: ['Manager height size:', ' (in pixel)'],
        57: 'Status: ',
        58: 'Error interval',
        59: ['b', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb', 'Eb', 'Zb', 'Yb'],
        60: ['b/s', 'Kb/s', 'Mb/s', 'Gb/s', 'Tb/s', 'Pb/s', 'Eb/s', 'Zb/s', 'Yb/s'],
        61: ['w', 'd', 'h', 'm', 's'],
        62: 'Save',
        63: 'Language',
        64: 'Select language',
        65: ['English', 'Russian'],
        66: 'Use SSL (https)',
        67: 'Pause all torrents',
        68: 'Resume all torrents',
        69: 'Unlimited',
        70: ['All', 'Downloading', 'Seeding', 'Completed', 'Active', 'Inactive', 'No label'],
        71: 'Unknown error, code: ',
        72: 'Show speed monitor: ',
        73: 'Are you sure you want to delete the selected torrent?',
        74: ['#', '#'],
        75: ['Remaining', 'Remaining'],
        76: ['Seeds', 'Seeds'],
        77: ['Peers', 'Peers'],
        78: ['Up', 'Uploaded'],
        79: ['Down', 'Downloaded'],
        80: ['Raito', 'Raito'],
        81: ['Avail.', 'Avail.'],
        82: ['Label', 'Label'],
        83: ['Added On', 'Added On'],
        84: ['Completed On', 'Completed On'],
        85: ['Default order'],
        86: ['Order of table columns: '],
        87: ['Don\'t download', 'Low', 'Normal', 'High'],
        88: ['File name', 'File name'],
        89: ['Priority', 'Priority'],
        90: 'Get file(s)',
        91: ['Select all', 'Update', 'Close'],
        92: 'Auto update file list',
        93: 'Play',
        96: 'Sort after updating the list',
        97: 'Context menu',
        98: 'Enable context menu',
        99: 'Enable notification',
        100: 'Sending to uTorrent...',
        101: 'Downloading...',
        102: 'Torrent file is added!',
        103: 'Unexpected error!',
        104: 'Add to uTorrent',
        105: 'Go to Downloads after adding the torrent',
        107: ['Save your settings first!', 'free', 'Add', 'Remove selected', 'Sub-path', 'Path', 'Folders in context menu', 'Sub-path must exist!'],
        108: ['Rollback error!', 'Restore error!', 'Rollback', 'Restore', 'Update', 'Restore', 'Backup', 'Export settings'],
        109: 'Show number of active downloads on the icon',
        110: ['Yes', 'No'],
        111: 'List of files',
        112: 'Probably torrent file already exists!',
        113: ['', 'Select all'],
        "settings": {
            1: "uTorrent",
            2: "Notifications",
            3: "Interface",
            4: "Context menu",
            5: "Restoring settings",
            6: "Web-UI",
            7: "Additional settings",
            8: "Notifications",
            9: "Other",
            10: "The interface pop-up window",
            11: "The update interval of the list of torrents",
            12: "The management of the columns of the list of torrents",
            13: "The management of the columns of the list of files",
            14: "Control context menu",
            15: "Directory management",
            16: "Backup and restore settings",
            17: "Save all!",
            18: "Restore",
            19: "Update",
            20: "Recovery",
            21: "Backup",
            22: "Delete the selected",
            23: "Subdirectory",
            24: "Directory",
            25: "Automatically switch to the section \"Downloading\" when successfully added the torrent file",
            26: "Enable context menu",
            27: "Reset",
            28: "Reset",
            29: "Update the list of torrents every",
            30: "Popup height",
            31: "Sort the list after the update",
            32: "Show chart speed",
            33: "Hide all the torrents, which are seeding",
            34: "Hide all the torrents that have been downloaded, but not seeding",
            35: "Automatically hide the notification through the",
            36: "Update the list of torrents in the background of every",
            37: "seconds",
            38: "seconds, 0 - not hide",
            39: "Show the number of downloading torrents on the extension icon",
            40: "Display a notification when the download is complete the torrent file",
            41: "SSL",
            42: "Path",
            43: "Port",
            44: "Address",
            45: "Password",
            46: "User name",
            47: "seconds",
            48: "Add",
            49: "show",
            50: "width",
            51: "I can not restore the settings!",
            52: "Saved!",
            53: "Connection error!",
            54: "Language",
            55: "Yandex.Money",
            56: "If possible please",
            57: " make a donation through",
            58: "or",
            59: "Save the settings to the cloud",
            60: "Get the settings from the cloud"
        }
    }
    var lang_arr_ru = {
        0: 'Запустить',
        1: 'Пауза',
        2: 'Остановить',
        3: 'Запустить принудительно',
        4: 'Возобновить',
        5: 'Перехешировать',
        6: 'Удалить',
        7: 'Удалить и',
        8: 'только .torrent',
        9: 'стереть файлы',
        10: '.torrent и файлы',
        11: 'Метка',
        12: 'Удалить метку',
        13: ['Имя торрента', 'Имя торрента'],
        14: ['Размер', 'Размер'],
        15: ['%', '%'],
        16: ['Статус', 'Статус'],
        17: ['Время', 'Время'],
        18: ['Загр. скор.', 'Скорость загрузки'],
        19: ['Отд. скор.', 'Скорость отдачи'],
        20: ['С/П', 'Сиды/Пиры'],
        21: ['Действия', 'Действия'],
        22: 'Соединение установлено',
        23: 'Ошибка',
        24: 'Обновить',
        25: 'Поддержать проект',
        26: 'Веб интерфейс uTorrent',
        27: 'Введите логин',
        28: 'Введите пароль',
        29: 'Введите адрес',
        30: 'Введите порт',
        31: 'Введите путь',
        32: 'Введите интервал проверки уведомлений',
        33: 'Введите интервал отображения уведомлений',
        34: 'Ошибка авторизации!',
        35: 'Страница не найдена! uTorrent не найден!',
        36: 'uTorrent не найден. Неверный адрес!',
        37: 'Настройка завершена!',
        38: 'Ошибка получения token! Возможно неправильный путь.',
        39: 'Настройки',
        40: 'uTorrent Server',
        41: 'Адрес:',
        42: 'Порт:',
        43: 'Путь:',
        44: 'Адрес веб интерфейса uTorrent:',
        45: 'uTorrent авторизация',
        46: 'Имя:',
        47: 'Пароль:',
        48: 'Настройка уведомлений',
        49: 'Отображать уведомления:',
        50: ['Проверять каждые:', ' (сек.)'],
        51: ['Отображать уведомление:', ' (0 - бесконечно, сек.)'],
        52: 'Настройка менеджера',
        53: ['Интервал обновления:', ' (сек.)'],
        54: 'Скрыть <b>завершенные</b> торренты из менеджера:',
        55: 'Скрыть <b>раздающиеся</b> торренты из менеджера:',
        56: ['Высота окна менеджера:', ' (в пикселях)'],
        57: 'Статус: ',
        58: 'Ошибка интервала',
        59: ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб', 'Eb', 'Zb', 'Yb'],
        60: ['б/с', 'Кб/с', 'Мб/с', 'Гб/с', 'Тб/с', 'Пб/с', 'Eb/s', 'Zb/s', 'Yb/s'],
        61: ['н', 'д', 'ч', 'м', 'с'],
        62: 'Сохранить',
        63: 'Язык',
        64: 'Выберите язык',
        65: ['English', 'Russian'],
        66: 'Использовать SSL (https)',
        67: 'Пауза для всех',
        68: 'Продолжить все загрузки',
        69: 'Неограниченно',
        70: ['Все', 'Загружаемые', 'Сидирование', 'Готовые', 'Активные', 'Неактивные', 'Без метки'],
        71: 'Неизвестная ошибка, код: ',
        72: 'Показывать монитор скорости: ',
        73: 'Вы действительно хотите удалить выбранный торрент?',
        74: ['#', 'Позиция'],
        75: ['Осталось', 'Осталось'],
        76: ['Сиды', 'Сиды'],
        77: ['Пиры', 'Пиры'],
        78: ['Отдано', 'Отдано'],
        79: ['Получено', 'Получено'],
        80: ['Коэф.', 'Коэффициент'],
        81: ['Доступно', 'Доступно'],
        82: ['Метка', 'Метка'],
        83: ['Добавлен', 'Добавлен'],
        84: ['Завершен', 'Завершен'],
        85: ['Выстроить по умолчанию'],
        86: ['Порядок столбцов в таблице: '],
        87: ['Не загружать', 'Низкий', 'Средний', 'Высокий'],
        88: ['Имя файла', 'Имя файла'],
        89: ['Приоритет', 'Приоритет'],
        90: 'Загрузить файл(ы)',
        91: ['Выбрать всё', 'Обновить', 'Закрыть'],
        92: 'Автоматически обновлять список файлов',
        93: 'Воспроизвести',
        96: 'Выполнять сортировку после обновления списка',
        97: 'Контекстное меню',
        98: 'Включить контекстное меню',
        99: 'Уведомления при добавлении торрентов',
        100: 'Отправка в uTorrent...',
        101: 'Загрузка...',
        102: 'Торрент файл добавлен!',
        103: 'Неожиданная ошибка!',
        104: 'Добавить в uTorrent',
        105: 'Перейти в Загрузки после добавления торрента',
        107: ['Сначала сохраните текущие настройки!', 'свободно', 'Добавить', 'Удалить выбранное', 'Подкаталог', 'Каталог', 'Каталоги', 'Подкаталог должен существовать!'],
        108: ['Ошибка отката настроек!', 'Ошибка восстановления настроек!', 'Откатить', 'Восстановить', 'Обновить код', 'Восстановление', 'Бэкап', 'Экспорт настроек'],
        109: 'Отображать кол-во активных загрузок на иконке',
        110: ['Да', 'Нет'],
        111: 'Список файлов',
        112: 'Возможно торрент файл уже существует!',
        113: ['', 'Выбрать все'],
        "settings": {
            1: "uTorrent",
            2: "Уведомления",
            3: "Интерфейс",
            4: "Контекстное меню",
            5: "Восст. наcтроек",
            6: "Веб-интерфейс",
            7: "Дополнительные настройки",
            8: "Уведомления",
            9: "Прочие",
            10: "Интерфейс всплывающего окна",
            11: "Интервал обновления списка торрентов",
            12: "Управление столбцами списка торрентов",
            13: "Управление столбцами списка файлов",
            14: "Управление контекстным меню",
            15: "Управление каталогами",
            16: "Резервное копирование и восстановление настроек",
            17: "Сохранить все!",
            18: "Восстановить",
            19: "Обновить",
            20: "Восстановление",
            21: "Бэкап",
            22: "Удалить выбранное",
            23: "Подкаталог",
            24: "Каталог",
            25: "Автоматически переходить в раздел \"Загрузки\" при успешном добавлении торрент-файла",
            26: "Включить контекстное меню",
            27: "Сбросить настройки",
            28: "Сбросить настройки",
            29: "Обновлять список торрентов каждые",
            30: "Высота окна",
            31: "Выполнять сортировку списка после обновления",
            32: "Показывать график скорости",
            33: "Скрывать все торренты, которые раздаются",
            34: "Скрывать все торренты, которые загружены, но не раздаются",
            35: "Автоматически скрывать уведомление через",
            36: "Обновлять список торрентов в фоне каждые",
            37: "секунд",
            38: "секунд, 0 - не скрывать",
            39: "Показывать количество загружаемых торрентов на иконке приложения",
            40: "Выводить уведомление при завершении загрузки торрент-файла",
            41: "SSL",
            42: "Путь",
            43: "Порт",
            44: "Адрес",
            45: "Пароль",
            46: "Имя пользователя",
            47: "секунд",
            48: "Добавить",
            49: "показывать",
            50: "ширина",
            51: "Не могу восстановить настройки!",
            52: "Сохранено!",
            53: "Ошибка соединения!",
            54: "Язык",
            55: "Яндекс.Деньги",
            56: "Если возможно, пожалуйста",
            57: ", сделайте пожертвование через",
            58: "или",
            59: "Сохранить настройки в облако",
            60: "Получить из облака"
        }
    }
    if (!lang) {
        lang = (localStorage.lang !== undefined) ? localStorage["lang"] : 'en';
    }
    if (lang == 'ru') {
        return lang_arr_ru;
    } else {
        return lang_arr_en;
    }
};
var lang_arr = get_lang();
$(function () {
    if ("options" in window == false) {
        get_lang = null;
    }        
});