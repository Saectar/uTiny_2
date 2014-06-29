/**
 * Created by Anton on 21.06.2014.
 *
 * Mono cross-browser engine. Firefox lib.
 *
 * @namespace require
 * @namespace exports
 */
(function() {
    var tabs = require("sdk/tabs");
    var serviceList = {};
    var route = {};
    var defaultId = 'monoScope';
    route[defaultId] = [];

    var monoStorage = function() {
        var ss = require("sdk/simple-storage");
        return {
            get: function (src, cb) {
                var key, obj = {};
                if (src === undefined || src === null) {
                    for (key in ss.storage) {
                        if (!ss.storage.hasOwnProperty(key)) {
                            continue;
                        }
                        obj[key] = ss.storage[key];
                    }
                    return cb(obj);
                }
                if (typeof src === 'string') {
                    src = [src];
                }
                if (Array.isArray(src) === true) {
                    for (var i = 0, len = src.length; i < len; i++) {
                        key = src[i];
                        obj[key] = ss.storage[key];
                    }
                } else {
                    for (key in src) {
                        obj[key] = ss.storage[key];
                    }
                }
                cb(obj);
            },
            set: function (obj, cb) {
                var key;
                for (key in obj) {
                    ss.storage[key] = obj[key];
                }
                cb && cb();
            },
            clear: function (cb) {
                var key;
                for (key in ss.storage) {
                    delete ss.storage[key];
                }
                cb && cb();
            }
        }
    }();

    var sendTo = function(to, message) {
        if (typeof to !== "string") {
            var page = to;
            var type = page.isVirtual?'lib':'port';
            page[type].emit(defaultId, message);
            return;
        }
        for (var i = 0, page; page = route[to][i]; i++) {
            var type = page.isVirtual?'lib':'port';
            page[type].emit(to, message);
        }
    };

    serviceList['monoStorage'] = function(message) {
        var to = message.monoFrom;
        var msg = message.data;
        var response;
        if (message.monoCallbackId !== undefined) {
            response = function(responseMessage) {
                responseMessage = {
                    data: responseMessage,
                    monoTo: to,
                    monoFrom: 'monoStorage',
                    monoResponseId: message.monoCallbackId
                };
                sendTo(to, responseMessage);
            }
        }
        if (msg.action === 'get') {
            return monoStorage.get(msg.data, response);
        }
        if (msg.action === 'set') {
            return monoStorage.set(msg.data, response);
        }
        if (msg.action === 'clear') {
            return monoStorage.clear(response);
        }
    };

    serviceList['service'] = function(message) {
        var to = message.monoFrom;
        var msg = message.data;
        if (msg.action === 'resize') {
            return route[to].forEach(function(page) {
                if (msg.width) {
                    page.width = msg.width;
                }
                if (msg.height) {
                    page.height = msg.height;
                }
            });
        }
        if (msg.action === 'openTab') {
            return tabs.open(msg.url);
        }
    };

    var virtualPageList = {};
    var monoVirtualPage = function(pageId) {
        var subscribClientList = {};
        var subscribServerList = {};
        var obj = {
            port: {
                on: function(to, cb) {
                    if (subscribClientList[to] === undefined) {
                        subscribClientList[to] = [];
                    }
                    subscribClientList[to].push(cb);
                },
                emit: function(to, message) {
                    if (route[to] !== undefined) {
                        sendTo(to, message);
                        return;
                    }
                    subscribServerList[to].forEach(function(item) {
                        item(message);
                    });
                }
            },
            lib: {
                emit: function(to, message) {
                    subscribClientList[to].forEach(function(item) {
                        item(message);
                    });
                },
                on: function(to, cb) {
                    if (subscribServerList[to] === undefined) {
                        subscribServerList[to] = [];
                    }
                    subscribServerList[to].push(cb);
                }
            },
            isVirtual: true
        };
        virtualPageList[pageId] = obj;
        return obj;
    };
    exports.virtualAddon = monoVirtualPage;

    var sendAll = function(message, exPage) {
        for (var i = 0, page; page = route[defaultId][i]; i++) {
            if (page === exPage) {
                continue;
            }
            sendTo(page, message);
        }
    };
    exports.sendAll = sendAll;

    exports.addPage = function(pageId, page) {
        if (route[pageId] === undefined) {
            route[pageId] = [];
        }

        route[pageId].push(page);
        if (route[defaultId].indexOf(page) !== -1) {
            return;
        }
        route[defaultId].push(page);

        var type = page.isVirtual?'lib':'port';

        page[type].on(defaultId, function(message) {
            sendAll(message, page);
        });

        for (var serviceName in serviceList) {
            page[type].on(serviceName, serviceList[serviceName]);
        }

        for (var virtualPageName in virtualPageList) {
            if (virtualPageName === pageId) {
                continue;
            }
            page.port.on(virtualPageName, function(message) {
                virtualPageList[virtualPageName].lib.emit(virtualPageName, message);
            });
        }
    }
})();