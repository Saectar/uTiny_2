var manager = function() {
    var _engine = (chrome.extension.getBackgroundPage()).engine;
    var settings = null;
    var tables = null;
    var chk_settings = function() {
        if (settings == null ||
                settings['login'] == null ||
                settings['password'] == null) {
            return 0;
        }
        return 1;
    }
    tmp_vars = {
        'sel_label': {'k': 'all', 'v': null},
        'new_tr_count': 0,
        'label': [],
        'torrent_context_menu' : null,
        'torrent_context_menu_labels' : null,
        'speed_limit' : {},
        'auto_order' : true,
    }
    var write_language = function() {
        function ui_url()
        {
            return ((localStorage.ssl !== undefined && localStorage.ssl) ? 'https' : 'http') + "://" +
                    localStorage.login + ":" + localStorage.password + "@" +
                    localStorage.ut_ip + ":" + localStorage.ut_port + "/" + localStorage.ut_path;
        }
        tables['menu'].find('a.refresh').attr('title', lang_arr[24]);
        tables['menu'].find('a.donate').attr('title', lang_arr[25]);
        tables['menu'].find('a.wui').attr('title', lang_arr[26]);
        tables['menu'].find('a.start_all').attr('title', lang_arr[68]);
        tables['menu'].find('a.pause_all').attr('title', lang_arr[67]);
        tables['menu'].find('a.wui').attr('href', ui_url());
        $('th.select').attr('title', lang_arr[91][0]);
        $('#file-list').find('th.name').attr('title', lang_arr[88][1]).html(lang_arr[88][0]);
        $('#file-list').find('th.size').attr('title', lang_arr[14][1]).html(lang_arr[14][0]);
        $('#file-list').find('th.download').attr('title', lang_arr[79][1]).html(lang_arr[79][0]);
        $('#file-list').find('th.progress').attr('title', lang_arr[15][1]).html(lang_arr[15][0]);
        $('#file-list').find('th.priority').attr('title', lang_arr[89][1]).html(lang_arr[89][0]);
        tables['fl-bottom'].children('a.update').attr('title', lang_arr[91][1]);
        tables['fl-bottom'].children('a.close').attr('title', lang_arr[91][2]);
        tables['fl-head'].clone().appendTo(tables['fl-fixed']);
    }
    var torrent_list_head = function() {
        var colums = _engine.getColums();
        $('.torrent-style').remove();
        var style = '<style class="torrent-style">';
        var thead = '<tr>';
        var sum_width = 0;
        $.each(colums, function(key, value) {
            if (value.a) {
                thead += '<th class="' + key + '" title="' + lang_arr[value.lang][1] + '"><div>' + lang_arr[value.lang][0] + '</div></th>';
                style += 'th.' + key + ', td.' + key + ' {max-width:' + value.size + 'px; min-width:' + value.size + 'px}';
                sum_width += value.size;
            }
        });
        thead += '</tr>';
        style += '</style>';
        tables['tr-head'].html(thead);
        tables['tr-fixed_head'].html(thead);
        tables['body'].children('style.torrent-style').remove();
        tables['body'].append(style);
        if (sum_width < 800) {
            tables.body.css('width', (sum_width + 59) + 'px');
        } else {
            tables.body.css('width', '800px');
        }
        torrent_list_order();
    }
    var torrent_list_order = function() {
        tables['table-main'].tablesorter({
            textExtraction: function(node) {
                if ($(node).attr('data-value') !== undefined)
                    return $(node).attr('data-value');
                return $(node).html();
            },
            sortList: (localStorage.tr_order !== undefined) ? JSON.parse(localStorage.tr_order) : [[1, 1]],
            onsort: function(s) {
                localStorage.tr_order = JSON.stringify(s);
                console.log(localStorage.tr_order);
            },
            selectorHeaders: '.torrent-table-head thead th'
        });
    }
    var timer = function() {
        var status = 0;
        var tmr = null;
        var interval = settings.mgr_update_interval;
        var start = function() {
            if (status)
                return 0;
            status = 1;
            tmr = setInterval(function() {
                get_torrent_list();
            }, interval);
            return 1;
        }
        var stop = function() {
            if (status) {
                clearInterval(tmr);
                status = 0;
            }
            return 1;
        }
        return {
            start: function() {
                return start();
            },
            stop: function() {
                return stop();
            },
            status: function() {
                return status;
            },
        }
    };
    var get_torrent_list = function() {
        timer.stop();
        _engine.getTorrentList();
    }
    /*
     ,arr[i][0] /* ХЭШ
     ,arr[i][1] /* STATUS CODE
     ,arr[i][2] /* ИМЯ
     ,arr[i][3] /* РАЗМЕР
     ,arr[i][4] /* ПРОЦЕНТ ВЫПОЛНЕНИЯ
     ,arr[i][5]/*  загружено
     ,arr[i][6]/*  РОЗДАНО
     ,arr[i][7]/*  КОЭФФИЦИЕНТ
     ,arr[i][8] /* СКОРОСТЬ РАЗДАЧИ
     ,arr[i][9] /* СКОРОСТЬ ЗАГРУЗКИ
     ,arr[i][10] /*ETA
     ,arr[i][11] /*МЕТКА 
     ,arr[i][12] /*ПОДКЛЮЧЕНО ПИРОВ
     ,arr[i][13] /*ПИРЫ В РОЕ
     ,arr[i][14] /*ПОДКЛЮЧЕНО СИДОВ
     ,arr[i][15] /*СИДЫ В РОЕ 
     ,arr[i][16]/* ДОСТУПНОСТЬ
     ,arr[i][17] /*ПОРЯДОК ОЧЕРЕДИ ТОРРЕНТОВ 
     ,arr[i][18]/* отдано
     ,arr[i][19]/* ?
     ,arr[i][20]/* ? 
     ,arr[i][21] /*статус тескстом
     ,arr[i][23]/* время старта
     ,arr[i][24]/* время завершения
     ,arr[i][22]/* sid
     ,arr[i][26]/* path_to_file
     */
    var write_torrent_list = function(arr, update) {
        var c = arr.length;
        var sum_dl = 0;
        var sum_up = 0;
        tmp_vars.new_tr_count = 0;
        if (!update) {
            tr_table_controller.clear();
        }
        for (var n = 0; n < c; n++) {
            var v = arr[n];
            sum_dl += v[9];
            sum_up += v[8];
            tr_table_controller.add(v);
        }
        if (tmp_vars.new_tr_count) {
            tables['table-main'].trigger('update');
            tmp_vars.new_tr_count = 0;
        }
        tr_table_controller.filter();
        tables['dl-speed'].text(bytesToSizeInSec(sum_dl, '-'));
        tables['up-speed'].text(bytesToSizeInSec(sum_up, '-'));
        if (settings.graph)
            graph.move(sum_dl, sum_up, 0);
        timer.start();
    }
    var update_item = function(modifed_arr, v) {
        var c = modifed_arr.length;
        for (var n = 0; n < c; n++)
            switching(modifed_arr[n]);
        function switching(key)
        {
            var item = null;
            var upd_list = {};
            switch (key) {
                case 11:
                    if (!item)
                        item = $('#' + v[0]);
                    item.attr('data-label', v[11]);
                    break;
                case 22:
                    if (!item)
                        item = $('#' + v[0]);
                    item.attr('data-sid', v[22]);
                    break;
                case 26:
                    if (!item)
                        item = $('#' + v[0]);
                    item.attr('data-path', v[26]);
                    break;
                case 2:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.name');
                    cell.childen('td.name').children('div').attr('title', v[2]).children('span').text(v[2]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 3:
                    if (!item)
                        item = $('#' + v[0]);
                    var t_s = bytesToSize(v[3]);
                    var cell = item.children('td.size');
                    cell.attr('data-value', v[3]).children('div').attr('title', t_s).html(t_s);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 4:
                case 1:
                    if ('4.1' in upd_list == false)
                        upd_list['2.1'] = 1;
                    else
                        break;
                    if (!item)
                        item = $('#' + v[0]);
                    var progress = v[4] / 10;
                    var cell = item.children('td.progress');
                    var with_c = cell.attr('data-value', v[4]).children('div.progress_b').children('div.progress_b_i');
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    with_c.css('width', writePersent(progress) + 'px').children('div').html(progress + '%');
                    if (v[1] == 201 && v[4] == 1000)
                    {
                        with_c.css('background-color', '#41B541');
                    } else {
                        with_c.css('background-color', '#3687ED');
                    }
                    break;
                case 21:
                case 1:
                    if ('21.1' in upd_list == false)
                        upd_list['21.1'] = 1;
                    else
                        break;
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.status');
                    cell.attr('data-value', v[1]).children('div').attr('title', v[21]).html(v[21]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 9:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.down_speed');
                    cell.attr('data-value', v[9]).children('div').html(bytesToSizeInSec(v[9], ''));
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 8:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.uplo_speed');
                    cell.attr('data-value', v[8]).children('div').html(bytesToSizeInSec(v[8], ''));
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 14:
                case 12:
                    if ('14.12' in upd_list == false)
                        upd_list['14.12'] = 1;
                    else
                        break;
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.seeds_peers');
                    cell.children('div').html(v[14] + '/' + v[12]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 9:
                    if (!item)
                        item = $('#' + v[0]);
                    var val = v[9];
                    if (val < 0)
                        val = '*';
                    var cell = item.children('td.position');
                    cell.children('div').html(val);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 9:
                case 3:
                    if ('9.3' in upd_list == false)
                        upd_list['9.3'] = 1;
                    else
                        break;
                    if (!item)
                        item = $('#' + v[0]);
                    var val = v[3] - v[9];
                    if (val < 0)
                        val = 0;
                    var cell = item.children('td.ostalos');
                    cell.attr('data-value', val).children('div').html(bytesToSize(val, 0));
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 15:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.seeds');
                    cell.children('div').html(v[15]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 13:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.peers');
                    cell.children('div').html(v[13]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 10:
                    if (!item)
                        item = $('#' + v[0]);
                    var s_time = unixintime(v[10]);
                    var cell = item.children('td.time');
                    cell.attr('data-value', v[10]).children('div').attr('title', s_time).html(s_time);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 6:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.otdano');
                    cell.attr('data-value', v[6]).children('div').html(bytesToSize(v[6], 0));
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 5:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.poluchino');
                    cell.attr('data-value', v[5]).children('div').html(bytesToSize(v[5], 0));
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 7:
                    if (!item)
                        item = $('#' + v[0]);
                    var val = v[7] / 1000;
                    var cell = item.children('td.koeficient');
                    cell.attr('data-value', v[7]).children('div').html(val);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 16:
                    if (!item)
                        item = $('#' + v[0]);
                    var val = Math.round((v[16] / 65535) * 1000) / 1000;
                    var cell = item.children('td.dostupno');
                    cell.attr('data-value', v[16]).children('div').html(val);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 11:
                    if (!item)
                        item = $('#' + v[0]);
                    var cell = item.children('td.metka');
                    cell.children('div').attr('title', v[11]).html(v[11]);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 23:
                    if (!item)
                        item = $('#' + v[0]);
                    var str_time = writeTimeFromShtamp(v[23]);
                    var cell = item.children('td.time_dobavleno');
                    cell.children('div').attr('title', str_time).html(str_time);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
                case 24:
                    if (!item)
                        item = $('#' + v[0]);
                    var str_time = writeTimeFromShtamp(v[24]);
                    var cell = item.children('td.time_zavircheno');
                    cell.children('div').attr('title', str_time).html(str_time);
                    tables['table-main'].trigger('updateCell',[cell[0],tmp_vars.auto_order]);
                    break;
            }
        }
    }
    var create_item = function(v) {
        var colums = _engine.getColums();
        var item = '<tr id="' + v[0] + '" data-label="' + v[11] + '" data-sid="' + v[22] + '" data-path="' + v[26] + '">';
        $.each(colums, function(key, value) {
            if (value.a) {
                item += switching(key);
            }
        });
        item += '</tr>';
        tables['tr-body'].append(item);
        function switching(key)
        {
            switch (key) {
                case 'name':
                    return '<td class="' + key + '"><div title="' + v[2] + '"><span>' + v[2] + '</span></div></td>';
                    break;
                case 'size':
                    return '<td class="' + key + '" data-value="' + v[3] + '"><div title="' + bytesToSize(v[3]) + '">' + bytesToSize(v[3]) + '</div></td>';
                    break;
                case 'progress':
                    var progress = v[4] / 10;
                    var color = (v[1] == 201 && v[4] == 1000) ? '#41B541' : '#3687ED';
                    return '<td class="' + key + '" data-value="' + v[4] + '"><div class="progress_b"><div class="progress_b_i" style="width: ' + writePersent(progress) + 'px; background-color: ' + color + ';"><div>' + progress + '%</div></div></div></td>';
                    break;
                case 'status':
                    return '<td class="' + key + '" data-value="' + v[1] + '"><div title="' + v[21] + '">' + v[21] + '</div></td>';
                    break;
                case 'down_speed':
                    return '<td class="' + key + '" data-value="' + v[9] + '"><div>' + bytesToSizeInSec(v[9], '') + '</div></td>';
                    break;
                case 'uplo_speed':
                    return '<td class="' + key + '" data-value="' + v[8] + '"><div>' + bytesToSizeInSec(v[8], '') + '</div></td>';
                    break;
                case 'seeds_peers':
                    return '<td class="' + key + '"><div>' + v[14] + '/' + v[12] + '</div></td>';
                    break;
                case 'position':
                    var val = v[9];
                    if (val < 0)
                        val = '*';
                    return '<td class="' + key + '"><div>' + val + '</div></td>';
                    break;
                case 'ostalos':
                    var val = v[3] - v[9];
                    if (val < 0)
                        val = 0;
                    return '<td class="' + key + '" data-value="' + val + '"><div>' + (bytesToSize(val, 0)) + '</div></td>';
                    break;
                case 'seeds':
                    return '<td class="' + key + '"><div>' + (v[15]) + '</div></td>';
                    break;
                case 'peers':
                    return '<td class="' + key + '"><div>' + (v[13]) + '</div></td>';
                    break;
                case 'time':
                    var s_time = unixintime(v[10]);
                    return '<td class="' + key + '" data-value="' + v[10] + '"><div title="' + s_time + '">' + s_time + '</div></td>'
                    break;
                case 'otdano':
                    return '<td class="' + key + '" data-value="' + v[6] + '"><div>' + (bytesToSize(v[6], 0)) + '</div></td>';
                    break;
                case 'poluchino':
                    return '<td class="' + key + '" data-value="' + v[5] + '"><div>' + (bytesToSize(v[5], 0)) + '</div></td>';
                    break;
                case 'koeficient':
                    var val = v[7] / 1000;
                    return '<td class="' + key + '" data-value="' + v[7] + '"><div>' + val + '</div></td>';
                    break;
                case 'dostupno':
                    var val = Math.round((v[16] / 65535) * 1000) / 1000;
                    return '<td class="' + key + '" data-value="' + v[16] + '"><div>' + val + '</div></td>';
                    break;
                case 'metka':
                    return '<td class="' + key + '"><div title="' + v[11] + '">' + v[11] + '</div></td>';
                    break;
                case 'time_dobavleno':
                    var str_time = writeTimeFromShtamp(v[23]);
                    return '<td class="' + key + '" data-value="' + v[23] + '"><div title="' + str_time + '">' + str_time + '</div></td>';
                    break;
                case 'time_zavircheno':
                    var str_time = writeTimeFromShtamp(v[24]);
                    return '<td class="' + key + '" data-value="' + v[24] + '"><div title="' + str_time + '">' + str_time + '</div></td>';
                    break;
                case 'controls':
                    return '<td class="' + key + '"><div class="btns"><a href="#start" title="' + lang_arr[0] + '" class="start"></a><a href="#pause" class="pause" title="' + lang_arr[1] + '"></a><a href="#stop" class="stop" title="' + lang_arr[2] + '"></a></div></td>';
                    break;
            }
            return '';
        }
    }
    var tr_table_controller = function() {
        var cached = {}
        var clear = function() {
            tables['tr-body'].empty();
            cached = {};
        }
        var add = function(v) {
            var id = v[0];
            if (id in cached) {
                var tr = cached[id]['api'];
                var c = v.length;
                var modifed_arr = [];
                for (var n = 0; n < c; n++) {
                    if (tr[n] != v[n]) {
                        modifed_arr[modifed_arr.length] = n;
                        cached[id]['api'][n] = v[n];
                    }
                }
                update_item(modifed_arr, v);
            } else {
                cached[id] = {
                    'api': null,
                    'gui': {
                        'display': 1
                    }
                }
                cached[id]['api'] = v
                create_item(v);
                tmp_vars.new_tr_count++;
            }
        }
        var filter = function(a, b) {
            if (a) {
                tmp_vars.sel_label = {'k': a, 'v': b};
            }
            $.each(cached, function(id, val) {
                sorting_torrent_list(id, val.gui.display, val.api);
                settings_filtering(id, val.gui.display, val.api);
            });
        }
        var hide = function(id) {
            if (cached[id]['gui']['display']) {
                cached[id]['gui']['display'] = 0;
                $('#' + id).css('display', 'none');
            }
        }
        var show = function(id) {
            if (!cached[id]['gui']['display']) {
                cached[id]['gui']['display'] = 1;
                $('#' + id).css('display', 'table-row');
            }
        }
        var get = function(id) {
            if (id in cached)
                return cached[id]['api'];
            else
                return null;
        }
        var del = function(id) {
            if (id in cached)
                delete cached[id]
            $('#' + id).remove();
            tables['table-main'].trigger('update');
        }
        return {
            add: function(t) {
                add(t);
            },
            get: function(t) {
                return get(t);
            },
            del: function(t) {
                del(t);
            },
            show: function(t) {
                show(t);
            },
            hide: function(t) {
                hide(t);
            },
            clear: function() {
                clear();
            },
            filter: function(a, b) {
                filter(a, b);
            },
            get_table: function() {
                return cached
            }
        }
    }()
    var settings_filtering = function(id, display, v) {
        if ((settings.hide_seeding && v[4] == 1000 && v[1] == 201) ||
                (settings.hide_finished && v[4] == 1000 && v[1] == 136)) {
            if (display)
                tr_table_controller.hide(id);
        }
    }
    var sorting_torrent_list = function(id, display, param) {
        if (isNumber(tmp_vars.sel_label.k) == false) {
            switch (tmp_vars.sel_label.k) {
                case ('all'):
                    if (!display) {
                        tr_table_controller.show(id);
                    }
                    break;
                case ('download'):
                    if (param[4] != 1000) {
                        tr_table_controller.show(id);
                    } else
                    if (display) {
                        tr_table_controller.hide(id);
                    }
                    break;
                case ('active'):
                    if (param[9] != 0 || param[8] != 0) {
                        tr_table_controller.show(id);
                    } else
                    if (display) {
                        tr_table_controller.hide(id);
                    }
                    break;
                case ('inacive'):
                    if (param[9] == 0 || param[8] == 0) {
                        tr_table_controller.show(id);
                    } else
                    if (display) {
                        tr_table_controller.hide(id);
                    }
                    break;
                case ('complite'):
                    if (param[4] == 1000) {
                        tr_table_controller.show(id);
                    } else
                    if (display) {
                        tr_table_controller.hide(id);
                    }
                    break;
                case ('seeding'):
                    if (param[1] == 201 && param[4] == 1000) {
                        tr_table_controller.show(id);
                    } else
                    if (display) {
                        tr_table_controller.hide(id);
                    }
                    break;
                case ('no label'):
                    if (param[11].length == 0) {
                        if (!display) {
                            tr_table_controller.show(id);
                        }
                    } else {
                        if (display) {
                            tr_table_controller.hide(id);
                        }
                    }
                    break;
                default:
                    if (display) {
                        tr_table_controller.hide(id);
                    }
            }
        } else {
            if (tmp_vars.sel_label.v == param[11]) {
                if (!display) {
                    tr_table_controller.show(id);
                }
            } else {
                if (display) {
                    tr_table_controller.hide(id);
                }
            }
        }
    }
    var delete_from_table = function(arr) {
        var c = arr.length;
        for (var n = 0; n < c; n++) {
            tr_table_controller.del(arr[n]);
        }
    }
    var set_status = function(a, b) {
        tables.status.text(b);
    }
    var update_labels_context_menu = function (id) {
        var current_label = null;
        if (id) {
            current_label = tr_table_controller.get(id);
            if (!current_label) return;
            current_label = current_label[11];
        }
        var arr = tmp_vars['label'];
        var c = arr.length;
        var code = '<li class="context-menu-item select_label" data-key="del_label"><span>Remove label</span></li>';
        for (var n = 0; n < c; n++) {
            if (current_label && current_label == arr[n][0]) {
                code += '<li class="context-menu-item select_label" data-key="'+arr[n][1]+'"><span><label>&#9679; </label>'+arr[n][0]+'</span></li>'
            } else {
                code += '<li class="context-menu-item select_label" data-key="'+arr[n][1]+'"><span>'+arr[n][0]+'</span></li>'
            }
        }
        tmp_vars['torrent_context_menu_labels'].html(code);
    }
    var set_labels = function(arr) {
        tmp_vars['label'] = arr;
        tmp_vars['label_obj'] = {};
        var c = arr.length;
        var costum = ['all', 'download', 'seeding', 'complite', 'active', 'inacive', 'no label'];
        var cc = costum.length;
        var options = '';
        for (var n = 0; n < cc; n++) {
            options += '<option value="' + costum[n] + '"' + ((isNumber(tmp_vars.sel_label.k) == false && tmp_vars.sel_label.k == costum[n]) ? ' selected' : '') + '>' + lang_arr[70][n] + '</option>'
        }
        for (var n = 0; n < c; n++) {
            tmp_vars['label_obj'][arr[n][1]] = arr[n][0]
            options += '<option value="' + arr[n][1] + '"' + ((isNumber(tmp_vars.sel_label.k) && tmp_vars.sel_label.k == arr[n][1]) ? ' selected' : '') + '>' + arr[n][0] + '</option>'
        }
        tables['label-select'].selectBox('options', options);
        update_labels_context_menu();
    }
    var contextActions = function(k, v, opt) {
        if ( (k != 'speed' && !v) || (k == 'speed' && v < 0) )
            return;
        switch (k) {
            case ('start'):
                _engine.sendAction('&list=1&action=start&hash=' + v);
                break;
            case ('force_start'):
                _engine.sendAction('&list=1&action=forcestart&hash=' + v);
                break;
            case ('stop'):
                _engine.sendAction('&list=1&action=stop&hash=' + v);
                break;
            case ('pause'):
                _engine.sendAction('&list=1&action=pause&hash=' + v);
                break;
            case ('unpause'):
                _engine.sendAction('&list=1&action=unpause&hash=' + v);
                break;
            case ('recheck'):
                _engine.sendAction('&list=1&action=recheck&hash=' + v);
                break;
            case ('set_label'):
                _engine.sendAction('&list=1&action=setprops&s=label&v='+opt+'&hash=' + v);
                break;
            case ('del_label'):
                _engine.sendAction('&list=1&action=setprops&s=label&v=&hash=' + v);
                break;
            case ('remove'):
                _engine.sendAction('&list=1&action=remove&hash=' + v);
                break;
            case ('remove_files'):
                _engine.sendAction('&list=1&action=removedata&hash=' + v);
                break;
            case ('remove_torrent'):
                _engine.sendAction('&list=1&action=removetorrent&hash=' + v);
                break;
            case ('remove_torrent_files'):
                _engine.sendAction('&list=1&action=removedatatorrent&hash=' + v);
                break;
            case ('speed'):
                if (opt) {
                    _engine.sendAction('&action=setsetting&s=max_dl_rate&v=' + v);
                    tmp_vars.speed_limit['download_limit'] = v;
                } else {
                    _engine.sendAction('&action=setsetting&s=max_ul_rate&v=' + v);
                    tmp_vars.speed_limit['upload_limit'] = v;
                }
                update_speed_menu(opt);
                break;
            case ('add_colum'):
                break;
            case ('del_colum'):
                break;
        }
    }
    var get_label_context_menu = function() {
        var labels = tmp_vars.label;
        var c = labels.length;
        var menu = {}
        menu['del_label'] = {
            name: lang_arr[12],
            callback: function(key, opt) {
                var id = this[0].id;
                contextActions(key, id)
            }
        }
        for (var n = 0; n < c; n++) {
            menu[ labels[n][1] ] = {
                name: labels[n][0],
                callback: function(key, opt) {
                    var id = this[0].id;
                    contextActions('set_label', id, key)
                }
            }
        }
        return menu
    }
    var update_torrent_context_menu = function (id) {
            //обновляет контекстное меню торрента
            tmp_vars.auto_order = false;
            var readStatus = function (i)
            {
                //показывает что можно, а что нельзя в контекстном меню торрента - скрывает
                var minus_par = {};
                var sel_en = []
                var minusSt = function (i)
                {
                    //читает код статуса тооррента
                    if (i>=128)
                    {
                        //Loaded
                        minus_par[128] = true;
                        sel_en[2] = 0;
                        sel_en[3] = 0;
                        return i-128;
                    } else
                    if (i>=64)
                    {
                        //Queued
                        minus_par[64] = true;
                        sel_en[1] = 0;
                        sel_en[3] = 1;
                        return i-64;
                    } else
                    if (i>=32)
                    {
                        //Paused
                        minus_par[32] = true;
                        sel_en[1] = 1;
                        sel_en[5] = 1;
                        sel_en[6] = 1;
                        return i-32;
                    } else
                    if (i>=16)
                    {
                        //Error
                        minus_par[16] = true;
                        sel_en[6] = 1;
                        sel_en[1] = 1;
                        return i-16;
                    } else
                    if (i>=8)
                    {
                        //Checked
                        minus_par[8] = true;
                        sel_en[6] = 1;
                        return i-8;
                    } else
                    if (i>=4)
                    {
                        //Start after check
                        minus_par[4] = true;
                        sel_en[4] = 1;
                        sel_en[1] = 0;
                        sel_en[2] = 1;
                        sel_en[3] = 1;
                        return i-4;
                    } else
                    if (i>=2)
                    {
                        //Checking
                        minus_par[2] = true;
                        sel_en[6] = 0;
                        sel_en[3] = 1;
                        if (!minus_par[32])
                            sel_en[2] = 1;
                        return i-2;
                    } else
                    if (i>=1)
                    {
                        //Started
                        minus_par[1] = true;
                        if (minus_par[32]==null)
                        {
                            sel_en[1] = 0;
                            sel_en[2] = 1;
                            sel_en[3] = 1;
                            sel_en[4] = 1;
                            sel_en[5] = 0;
                        }
                        if (minus_par[8]&&minus_par[1]&&minus_par[64]==null)
                        {
                            sel_en[1] = 1;
                        }
                        sel_en[6] = 0;
                        return i-1;
                    } else
                        return i;
                }
                sel_en[1] = 1; //start
                sel_en[2] = 1; //pause
                sel_en[3] = 1; //stop
                sel_en[4] = 0; //force start
                sel_en[5] = 0; //unpause
                sel_en[6] = 1; //forcer re-check
                var t = i;
                while (t>0)
                {
                    t = minusSt(t);
                }
                /*
                 start,force_start,stop,pause,unpause,recheck
                 */
                return {'start':sel_en[1],'force_start':sel_en[2],'stop':sel_en[3],'pause':sel_en[4],'unpause':sel_en[5],'recheck':sel_en[6]}
            }
            var status = tr_table_controller.get(id)
            if (!status) return;
            var menu_items = readStatus(status[1]);
            var f = 0
            $.each(menu_items, function(k,v) {
                if (v && !menu_items['start'] && !f) {
                    f++
                    tmp_vars["torrent_context_menu"].find('li[data-key='+k+']').addClass('first').css('display',(v)?'block':'none');
                } else
                    tmp_vars["torrent_context_menu"].find('li[data-key='+k+']').css('display',(v)?'block':'none');
            });
            var current_label = tr_table_controller.get(id);
            if (!current_label) return;
            current_label = current_label[11];
            tmp_vars["torrent_context_menu"].attr('data-id',id).attr('data-lable',(current_label.length)?1:0);
            if (current_label.length) {
                $('.context-menu-item.labels').children('span').html(lang_arr[11]+' ('+current_label+')');
            }
            $('#'+id).addClass('selected');
            update_labels_context_menu(id);
    }
    var on_hide_torrent_context_menu = function (id) {
        tmp_vars.auto_order = true;
        tmp_vars["torrent_context_menu"].find('li.first').removeClass('first');
        $('#'+id+'.selected').removeClass('selected');
        tmp_vars["torrent_context_menu"].attr('data-id','');
        if (tmp_vars["torrent_context_menu"].attr('data-lable') == 1) {
            $('.context-menu-item.labels').children('span').html(lang_arr[11]);
        }
        tmp_vars["torrent_context_menu"].attr('data-lable','');
    }
    var make_speed_menu = function () {
            //выстраивает внутренности контекстного меню для ограничения скорости
            var items = {};
            items["unlimited"]={
                name:lang_arr[69],	
                callback:function (opt){
                    var type = $(this).hasClass('download');
                    contextActions('speed',0,type);
                }
            };            
            var count = Math.round(settings.window_height / 27);
            if (count>10) count = 10;
           tmp_vars.speed_limit['count'] = count;
            for (var i=0;i<count;i++)
            {
                items[i]={
                    name: '-', 
                    callback: function (opt){
                        var type = $(this).hasClass('download');
                        var v = tmp_vars['speed_context_menu'].children('li[data-key='+opt+']').attr('data-speed');
                        contextActions('speed',v,type);
                    }
                };
            }
            return items;
    }
    var set_speed_limit = function (arr) {
        var c = arr.length;
        var a = 0;
        var b = 0;
        for (var n = 0; n < c; n++) {
            if ( arr[n][0] == 'max_dl_rate' ) {
                tmp_vars.speed_limit['download_limit'] = arr[n][2];
                a++;
                if (b) {
                    break;
                }
            }
            if ( arr[n][0] == 'max_ul_rate' ) {
                tmp_vars.speed_limit['upload_limit'] = arr[n][2];
                b++;
                if (a) {
                    break;
                }
            }
        }
        if ('last-type' in tmp_vars.speed_limit)
            update_speed_menu(tmp_vars.speed_limit['last-type']);
    }
    var update_speed_menu = function (type) {
        //обновляет контекстное меню ограничения скорости, в зависимости от скорости
        tmp_vars.speed_limit['last-type'] = type;
        download_limit = 0;
        upload_limit = 0;
        if ('download_limit' in tmp_vars.speed_limit)
        {
            var download_limit = tmp_vars.speed_limit.download_limit;
            var upload_limit = tmp_vars.speed_limit.upload_limit;
        } else {
            _engine.getLimit();
        }
        
        var count = tmp_vars.speed_limit.count;
        var sp = (type) ? download_limit : upload_limit;
        var count_p = sp;
        if (count_p == 0) count_p = 200;
        if (count_p<Math.round(count/2)) count_p = Math.round(count/2);
        if (sp == 0)
            tmp_vars['speed_context_menu'].children('li[data-key=unlimited]').children('span').html('<label>&#9679; </label>'+lang_arr[69]);
        else
            tmp_vars['speed_context_menu'].children('li[data-key=unlimited]').children('span').html(lang_arr[69]);
        var with_a = tmp_vars['speed_context_menu'].children('li[data-key!=unlimited]');
        for (var i=0;i<=count;i++)
        {
            var speed = Math.round((i+1)/Math.round(count/2)*count_p);
            if (speed == sp)
                with_a.eq(i).attr('data-speed',speed).children('span').html('<label>&#9679; </label>'+bytesToSizeInSec(speed*1024));	
            else  
                with_a.eq(i).attr('data-speed',speed).children('span').html(bytesToSizeInSec(speed*1024));
        }
    }
    //==================
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    var bytesToSize = function(bytes, nan) {
        //переводит байты в строчки
        var sizes = lang_arr[59];
        if (nan == null)
            nan = 'n/a';
        if (bytes == 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
    var writePersent = function(i)
    {
        //выписывает проценты для прогресс баров
        var full = 68;
        return Math.round(full / 100 * i);
    }
    var bytesToSizeInSec = function(bytes, nan) {
        //переводит байты в строчки\сек
        var sizes = lang_arr[60];
        if (bytes == 0)
            return nan;
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        if (i == 0) {
            return (bytes / Math.pow(1024, i)) + ' ' + sizes[i];
        }
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }
    var unixintime = function(i)
    {
        //выписывает отсчет времени из unixtime
        if (i < 0)
            return '&#8734;';
        var day = Math.floor(i / 60 / 60 / 24);
        var week = Math.floor(day / 7);
        var hour = Math.floor((i - day * 60 * 60 * 24) / 60 / 60);
        var minutes = Math.floor((i - day * 60 * 60 * 24 - hour * 60 * 60) / 60);
        var seconds = Math.floor((i - day * 60 * 60 * 24 - hour * 60 * 60 - minutes * 60));
        day = Math.floor(i / 60 / 60 / 24 - 7 * week);
        if (week > 10)
            return '&#8734;';
        if (week > 0)
            return week + lang_arr[61][0] + ' ' + day + lang_arr[61][1];
        if (day > 0)
            return day + lang_arr[61][1] + ' ' + hour + lang_arr[61][2];
        if (hour > 0)
            return hour + lang_arr[61][2] + ' ' + minutes + lang_arr[61][3];
        if (minutes > 0)
            return minutes + lang_arr[61][3] + ' ' + seconds + lang_arr[61][4];
        if (seconds > 0)
            return seconds + lang_arr[61][4];
        return '&#8734;';
    }
    var writeTimeFromShtamp = function(shtamp)
    {
        //преврящает TimeShtamp в строчку
        var dt = new Date(shtamp * 1000);
        var m = dt.getMonth() + 1;
        if (m.toString().length == 1)
            m = '0' + m.toString();
        var d = dt.getDate();
        if (d.toString().length == 1)
            d = '0' + d.toString();
        var h = dt.getHours();
        if (h.toString().length == 1)
            h = '0' + h.toString();
        var mi = dt.getMinutes();
        if (mi.toString().length == 1)
            mi = '0' + mi.toString();
        var sec = dt.getSeconds();
        if (sec.toString().length == 1)
            sec = '0' + sec.toString();
        var t = dt.getFullYear() + '-' + m + '-' + d + ' ' + h + ':' + mi + ':' + sec;
        return t;
    }
    //=================
    return {
        begin: function() {
            settings = _engine.getSettings();
            if (!chk_settings()) {
                window.location = "options.html";
                return 0;
            }
            _engine.setWindow();
            timer = timer();
            tables = {
                'body': $('body'),
                'menu': $('ul.menu'),
                'dl-speed': $('.status-panel td.speed.download'),
                'up-speed': $('.status-panel td.speed.upload'),
                'status': $('.status-panel td.status'),
                'label-select': $('ul.menu li.select select'),
                'table-body': $('.torrent-list-layer'),
                'table-main': $('.torrent-table-body'),
                'table-fixed': $('.torrent-table-head'),
                'tr-body': $('.torrent-table-body').children('tbody'),
                'tr-head': $('.torrent-table-body').children('thead'),
                'tr-fixed_head': $('.torrent-table-head').children('thead'),
                'fl-body': $('#file-list').children('table').eq(1).children('tbody'),
                'fl-head': $('#file-list').children('table').eq(1).children('thead'),
                'fl-fixed': $('#file-list').children('table').eq(0),
                'fl-bottom': $('div.file-list-layer > div.bottom-menu'),
            }
            tables['table-body'].css('max-height', settings.window_height+'px');
            torrent_list_head();
            tables['label-select'].selectBox().change(function() {
                var val = $(this).val();
                var item = null;
                if (isNumber(val)) {
                    var item = tmp_vars['label_obj'][$(this).val()];
                }
                tr_table_controller.filter(val, item);
            });
            tables['table-body'].on('scroll', function() {
                tables['table-fixed'].css('left', -($(this).scrollLeft()));
            });

            tables['menu'].on('click', 'a.start_all', function(e) {
                e.preventDefault();
                var table = tr_table_controller.get_table();
                var param = '&list=1&action=unpause';
                $.each(table, function(key, value) {
                    if (value.api[1] == 233 && value.gui.display)
                        param += '&hash=' + key;
                });
                if (param.length)
                    _engine.sendAction(param);
            });
            tables['menu'].on('click', 'a.pause_all', function(e) {
                e.preventDefault();
                var table = tr_table_controller.get_table();
                var param = '&list=1&action=pause';
                $.each(table, function(key, value) {
                    if (value.api[1] == 201 && value.gui.display)
                        param += '&hash=' + key;
                });
                if (param.length)
                    _engine.sendAction(param);
            });
            tables['table-body'].on('click', 'a.start', function(e) {
                e.preventDefault();
                var hash = $(this).parents().eq(2).attr('id');
                var param = '&list=1&action=start' + '&hash=' + hash;
                _engine.sendAction(param);
            });
            tables['table-body'].on('click', 'a.pause', function(e) {
                e.preventDefault();
                var hash = $(this).parents().eq(2).attr('id');
                var param = '&list=1&action=pause' + '&hash=' + hash;
                _engine.sendAction(param);
            });
            tables['table-body'].on('click', 'a.stop', function(e) {
                e.preventDefault();
                var hash = $(this).parents().eq(2).attr('id');
                var param = '&list=1&action=stop' + '&hash=' + hash;
                _engine.sendAction(param);
            });

            $.contextMenu({
                selector: ".torrent-table-body tr",
                className : "torrent",
                events: {
                    show: function() {
                        var id = this[0].id;
                        update_torrent_context_menu(id);
                    },
                    hide: function() {
                        var id = this[0].id;
                        on_hide_torrent_context_menu(id);
                    },
                },
                items: {
                    start: {
                        name: lang_arr[0],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    force_start: {
                        name: lang_arr[3],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    pause: {
                        name: lang_arr[1],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    unpause: {
                        name: lang_arr[4],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    stop: {
                        name: lang_arr[2],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    s1: '--------',
                    recheck: {
                        name: lang_arr[5],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        }
                    },
                    remove: {
                        name: lang_arr[6],
                        callback: function(key, opt) {
                            var id = this[0].id;
                            contextActions(key, id)
                        },
                    },
                    remove_with: {
                        name: lang_arr[7],
                        items: {
                            remove_files: {
                                name: lang_arr[8],
                                callback: function(key, opt) {
                                    var id = this[0].id;
                                    contextActions(key, id)
                                }
                            },
                            remove_torrent: {
                                name: lang_arr[9],
                                callback: function(key, opt) {
                                    var id = this[0].id;
                                    contextActions(key, id)
                                }
                            },
                            remove_torrent_files: {
                                name: lang_arr[10],
                                callback: function(key, opt) {
                                    var id = this[0].id;
                                    contextActions(key, id)
                                }
                            },
                        },
                    },
                    's2': '--------',
                    labels: {
                        name: lang_arr[11],
                        className : "labels",
                        items: get_label_context_menu()
                    },
                }
            });
            tmp_vars['torrent_context_menu'] = $(".context-menu-list.context-menu-root.torrent");
            tmp_vars['torrent_context_menu_labels'] = $(".context-menu-list.labels");
            tmp_vars['torrent_context_menu_labels'].on('click','.select_label',function () {
                var label_id = $(this).attr('data-key');
                var label = tmp_vars['label_obj'][label_id];
                var id = tmp_vars["torrent_context_menu"].attr('data-id');
                if (label_id == 'del_label') {
                    contextActions('del_label', id)
                } else {
                    contextActions('set_label', id, label)
                }
                $('#context-menu-layer').trigger('mousedown');
            })
            $.contextMenu({
                className: 'speed',
                selector: 'table.status-panel td.speed',
                events: {
                    show: function (opt){
                        var type = $(this).hasClass('download');
                        update_speed_menu(type);
                    }
                },
                items: make_speed_menu()
            });
            tmp_vars['speed_context_menu'] = $(".context-menu-list.context-menu-root.speed");
            if (settings.graph) {
                $('li.graph').append('<canvas id="graph"></canvas>');
                graph.init(settings.mgr_update_interval / 1000);
            }
            write_language();
            _engine.getLabels();
            _engine.getStatus();
            _engine.get_cache_torrent_list();
            get_torrent_list();
            return 1;
        },
        updateList: function(a, b) {
            write_torrent_list(a, b);
        },
        deleteItem: function(a) {
            delete_from_table(a);
        },
        setStatus: function(a, b) {
            set_status(a, b);
        },
        setLabels: function(a) {
            set_labels(a);
        },
         setSpeedLimit : function (a) {
            set_speed_limit(a);
         }
    }
}();
$(function() {
    if (!manager.begin())
        return 0;
});
create_time = (new Date()).getTime();