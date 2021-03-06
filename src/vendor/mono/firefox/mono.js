var mono = (typeof mono !== 'undefined') ? mono : undefined;

(function(base, factory) {
  "use strict";
  if (mono && mono.isLoaded) {
    return;
  }

  var _mono = mono;
  var fn = function(addon) {
    return factory(_mono, addon);
  };

  if (typeof window !== "undefined") {
    mono = base(fn);
    return;
  }
  exports.isFF = true;
  exports.isModule = true;

  exports.init = fn;

}(function base(factory) {
  if (['interactive', 'complete'].indexOf(document.readyState) !== -1) {
    return factory();
  }

  var base = Object.create({
    isLoaded: true,
    onReadyStack: [],
    onReady: function() {
      base.onReadyStack.push([this, arguments]);
    }
  });

  var onLoad = function() {
    document.removeEventListener('DOMContentLoaded', onLoad, false);
    window.removeEventListener('load', onLoad, false);

    mono = factory();

    for (var key in base) {
      if (base.hasOwnProperty(key)) {
        mono[key] = base[key];
      }
    }

    var item;
    while (item = base.onReadyStack.shift()) {
      mono.onReady.apply(item[0], item[1]);
    }
  };

  document.addEventListener('DOMContentLoaded', onLoad, false);
  window.addEventListener('load', onLoad, false);

  return base;
}, function initMono(_mono, _addon) {
  "use strict";
  var browserApi = function(_addon) {
    "use strict";
    var browserAddon = null;
    if (_addon) {
      browserAddon = _addon;
    } else
    if (typeof addon !== 'undefined' && addon.hasOwnProperty('port')) {
      browserAddon = addon;
    } else
    if (typeof self !== 'undefined' && self.hasOwnProperty('port')) {
      browserAddon = self;
    }

    if (!browserAddon) {
      browserAddon = {
        isVirtual: true,
        port: {
          listenerList: [],
          listener: function(event) {
            var _this = browserAddon.port;
            if (event.detail[0] !== '<') {
              return;
            }
            var data = event.detail.substr(1);
            for (var i = 0, cb; cb = _this.listenerList[i]; i++) {
              cb(JSON.parse(data));
            }
          },
          emit: function(pageId, message) {
            var msg = '>' + JSON.stringify(message);
            window.postMessage(msg, "*");
          },
          on: function(pageId, callback) {
            if (this.listenerList.indexOf(callback) === -1) {
              this.listenerList.push(callback);
            }

            window.addEventListener('monoMessage', this.listener);
          },
          removeListener: function(pageId, callback) {
            var pos = this.listenerList.indexOf(callback);
            if (pos !== -1) {
              this.listenerList.splice(pos, 1);
            }

            if (!this.listenerList.length) {
              window.removeEventListener('monoMessage', this.listener);
            }
          }
        }
      }
    }

    var emptyFn = function() {};

    /**
     * @param {Function} fn
     * @returns {Function}
     */
    var onceFn = function(fn) {
      return function(msg) {
        if (fn) {
          fn(msg);
          fn = null;
        }
      };
    };

    /**
     * @returns {Number}
     */
    var getTime = function() {
      return parseInt(Date.now() / 1000);
    };

    var msgTools = {
      id: 0,
      idPrefix: Math.floor(Math.random() * 1000),
      /**
       * @returns {String}
       */
      getId: function() {
        return this.idPrefix + '_' + (++this.id);
      },
      /**
       * @typedef {Object} Source
       * @property {Function} postMessage
       */
      /**
       * @param {string} id
       * @param {string} pageId
       * @returns {Function}
       */
      asyncSendResponse: function(id, pageId) {
        return function(message) {
          message.responseId = id;
          message.to = pageId;

          browserAddon.port.emit('mono', message);
        };
      },
      listenerList: [],
      /**
       * @typedef {Object} MonoMsg
       * @property {boolean} mono
       * @property {string} [hook]
       * @property {string} idPrefix
       * @property {string} [callbackId]
       * @property {string} [responseId]
       * @property {string} from
       * @property {string} to
       * @property {boolean} hasCallback
       * @property {*} data
       */
      /**
       * @param {MonoMsg} message
       */
      listener: function(message) {
        var _this = msgTools;
        var sendResponse = null;
        if (message && message.mono && !message.responseId && message.idPrefix !== _this.idPrefix) {
          if (!message.hasCallback) {
            sendResponse = emptyFn;
          } else {
            sendResponse = _this.asyncSendResponse(message.callbackId, message.from);
          }

          var responseFn = onceFn(function(msg) {
            var message = _this.wrap(msg);
            sendResponse(message);
            sendResponse = null;
          });

          _this.listenerList.forEach(function(fn) {
            if (message.hook === fn.hook) {
              fn(message.data, responseFn);
            }
          });
        }
      },
      async: {},
      /**
       * @param {MonoMsg} message
       */
      asyncListener: function(message) {
        var _this = msgTools;
        if (message && message.mono && message.responseId && message.idPrefix !== _this.idPrefix) {
          var item = _this.async[message.responseId];
          var fn = item && item.fn;
          if (fn) {
            delete _this.async[message.responseId];
            if (!Object.keys(_this.async).length) {
              _this.removeMessageListener(_this.asyncListener);
            }

            fn(message.data);
          }
        }

        _this.gc();
      },
      /**
       * @param {*} [msg]
       * @returns {MonoMsg}
       */
      wrap: function(msg) {
        return {
          mono: true,
          data: msg,
          idPrefix: this.idPrefix
        };
      },
      /**
       * @param {string} id
       * @param {Function} responseCallback
       */
      wait: function(id, responseCallback) {
        this.async[id] = {
          fn: responseCallback,
          time: getTime()
        };

        this.addMessageListener(this.asyncListener);

        this.gc();
      },
      messageListeners: [],
      /**
       * @param {Function} callback
       */
      addMessageListener: function(callback) {
        var listeners = this.messageListeners;
        if (listeners.indexOf(callback) === -1) {
          browserAddon.port.on('mono', callback);
          listeners.push(callback);
        }
      },
      /**
       * @param {Function} callback
       */
      removeMessageListener: function(callback) {
        var listeners = this.messageListeners;
        var pos = listeners.indexOf(callback);
        if (pos !== -1) {
          browserAddon.port.removeListener('mono', callback);
          listeners.splice(pos, 1);
        }
      },
      gcTimeout: 0,
      gc: function() {
        var now = getTime();
        if (this.gcTimeout < now) {
          var expire = 180;
          var async = this.async;
          this.gcTimeout = now + expire;
          Object.keys(async).forEach(function(responseId) {
            if (async [responseId].time + expire < now) {
              delete async [responseId];
            }
          });

          if (!Object.keys(async).length) {
            this.removeMessageListener(this.asyncListener);
          }
        }
      }
    };

    var api = {
      isFF: true,
      addon: browserAddon,
      isModule: typeof _addon !== 'undefined',
      /**
       * @param {*} msg
       * @param {Function} [responseCallback]
       */
      sendMessageToActiveTab: function(msg, responseCallback) {
        this.sendMessage({
          action: 'getActiveWindowActiveTab'
        }, function(tabs) {
          tabs.forEach(function(tab) {
            var tabId = tab.id;
            if (tabId >= 0) {
              var message = msgTools.wrap(msg);
              message.to = tabId;

              var hasCallback = !!responseCallback;
              message.hasCallback = hasCallback;
              if (hasCallback) {
                message.callbackId = msgTools.getId();
                msgTools.wait(message.callbackId, responseCallback);
              }

              browserAddon.port.emit('mono', message);
            }
          });
        }, 'service');
      },
      /**
       * @param {*} msg
       * @param {Function} [responseCallback]
       * @param {String} [hook]
       */
      sendMessage: function(msg, responseCallback, hook) {
        var message = msgTools.wrap(msg);
        hook && (message.hook = hook);

        var hasCallback = !!responseCallback;
        message.hasCallback = hasCallback;
        if (hasCallback) {
          message.callbackId = msgTools.getId();
          msgTools.wait(message.callbackId, responseCallback);
        }

        browserAddon.port.emit('mono', message);
      },
      onMessage: {
        /**
         * @param {Function} callback
         * @param {Object} [details]
         */
        addListener: function(callback, details) {
          details = details || {};
          details.hook && (callback.hook = details.hook);

          if (msgTools.listenerList.indexOf(callback) === -1) {
            msgTools.listenerList.push(callback);
          }

          msgTools.addMessageListener(msgTools.listener);
        },
        /**
         * @param {Function} callback
         */
        removeListener: function(callback) {
          var pos = msgTools.listenerList.indexOf(callback);
          if (pos !== -1) {
            msgTools.listenerList.splice(pos, 1);
          }

          if (!msgTools.listenerList.length) {
            msgTools.removeMessageListener(msgTools.listener);
          }
        }
      }
    };

    var externalStorage = function() {
      return {
        /**
         * @param {String|[String]|Object|null|undefined} [keys]
         * @param {Function} callback
         */
        get: function(keys, callback) {
          if (keys === undefined) {
            keys = null;
          }
          return api.sendMessage({
            get: keys
          }, callback, 'storage');
        },
        /**
         * @param {Object} items
         * @param {Function} [callback]
         */
        set: function(items, callback) {
          return api.sendMessage({
            set: items
          }, callback, 'storage');
        },
        /**
         * @param {String|[String]} [keys]
         * @param {Function} [callback]
         */
        remove: function(keys, callback) {
          return api.sendMessage({
            remove: keys
          }, callback, 'storage');
        },
        /**
         * @param {Function} [callback]
         */
        clear: function(callback) {
          return api.sendMessage({
            clear: true
          }, callback, 'storage');
        }
      };
    };

    api.storage = externalStorage();
    api.storage.sync = api.storage;

    /**
     * @param {Function} cb
     * @param {number} [delay]
     * @returns {number}
     */
    api.setTimeout = function (cb, delay) {
      if (api.isModule) {
        return require("sdk/timers").setTimeout(cb, delay);
      } else {
        return setTimeout(cb, delay);
      }
    };

    /**
     * @param {number} timeout
     */
    api.clearTimeout = function(timeout) {
      if (api.isModule) {
        return require("sdk/timers").clearTimeout(timeout);
      } else {
        return clearTimeout(timeout);
      }
    };

    /**
     * @param {Function} cb
     * @param {number} [delay]
     * @returns {number}
     */
    api.setInterval = function(cb, delay) {
      "use strict";
      if (api.isModule) {
        return require("sdk/timers").setInterval(cb, delay);
      } else {
        return setInterval(cb, delay);
      }
    };

    /**
     * @param {number} timeout
     */
    api.clearInterval = function(timeout) {
      "use strict";
      if (api.isModule) {
        return require("sdk/timers").clearInterval(timeout);
      } else {
        return clearInterval(timeout);
      }
    };

    /**
     * @param {String} locale
     * @param {Function} cb
     */
    api.getLanguage = function (locale, cb) {
      var convert = function(messages) {
        var language = {};
        for (var key in messages) {
          if (messages.hasOwnProperty(key)) {
            language[key] = messages[key].message;
          }
        }
        return language;
      };

      var self = require('sdk/self');
      var url = '_locales/{locale}/messages.json';

      var messages = null;
      try {
        messages = JSON.parse(self.data.load(url.replace('{locale}', locale)));
        cb(null, convert(messages));
      } catch (e) {
        cb(e);
      }
    };

    api.getLoadedLocale = function () {
      var locale = require("sdk/l10n").get('lang');
      if (locale === 'lang') {
        locale = '';
      }
      return locale;
    };

    api.createBlob = function (byteArrays, details) {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return new _window.Blob(byteArrays, details);
    };

    api.btoa = function (data) {
      var fn = null;
      if (api.isModule) {
        fn = function (data) {
          var base64 = require("sdk/base64");
          return base64.encode(data);
        };
      } else {
        fn = function (data) {
          return btoa(data);
        }
      }
      return fn(data);
    };

    api.atob = function (b64) {
      var fn = null;
      if (api.isModule) {
        fn = function (b64) {
          var base64 = require("sdk/base64");
          return base64.decode(b64);
        };
      } else {
        fn = function (b64) {
          return atob(b64);
        }
      }
      return fn(b64);
    };

    api.urlRevokeObjectURL = function (url) {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return _window.URL.revokeObjectURL(url);
    };

    api.urlCreateObjectURL = function (url) {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return _window.URL.createObjectURL(url);
    };

    api.getFileReader = function () {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return new _window.FileReader();
    };

    api.getFormData = function () {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return new _window.FormData();
    };

    api.prompt = function (message, def) {
      var _window = null;
      if (api.isModule) {
        _window = require('sdk/window/utils').getMostRecentBrowserWindow();
      } else {
        _window = window;
      }
      return _window.prompt(message, def);
    };

    api.showNotification = function(icon, title, desc) {
      var notification = require("sdk/notifications");
      notification.notify({title: String(title), text: String(desc), iconURL: icon});
    };

    api.addInClipboard = function (text) {
      var clipboard = require("sdk/clipboard");
      clipboard.set(text);
    };

    api.setBadgeText = function (text) {
      mono.ffButton.badge = text;
    };

    var rgba2hex = function(r, g, b, a) {
      if (a > 1) {
        a = a / 100;
      }
      a = parseFloat(a);
      r = parseInt(r * a);
      g = parseInt(g * a);
      b = parseInt(b * a);

      var componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
      };

      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };

    api.setBadgeBackgroundColor = function (color) {
      var hexColor = rgba2hex.apply(mono, color.split(','));
      mono.ffButton.badgeColor = hexColor;
    };

    api.openTab = function (url) {
      mono.sendMessage({action: 'openTab', url: url}, null, 'service');
    };

    api.isTab = function () {
      return browserAddon.isVirtual;
    };

    (function () {
      var menu = [];
      var items = {};

      var getContentScript = function() {
        var onClick = function() {
          self.on("click", function(node) {
            var data = {};
            var href = node.href;
            if (/^magnet:/.test(href)) {
              data.href = href;
            } else
            if (href){
              data.href = href;
              data.referer = location.href;
            } else {
              data.error = -1;
            }
            return self.postMessage(data);
          });
        };
        return '(' + onClick.toString() + ')()';
      };

      var onMenuItemClick = function (id, fn) {
        return function (data) {
          !data.error && fn({
            linkUrl: data.href,
            menuItemId: id,
            referer: data.referer
          });
        };
      };

      var getDetails = function (createProperties) {
        var cm = require("sdk/context-menu");

        var details = {
          label: createProperties.title
        };

        if (createProperties.contexts[0] === 'link') {
          details.context = cm.SelectorContext("a");
        }

        if (createProperties.onclick) {
          details.onMessage = onMenuItemClick(createProperties.id, createProperties.onclick);
          details.contentScript = getContentScript();
        }

        if (!createProperties.parentId) {
          var self = require('sdk/self');
          details.image = self.data.url('./icons/icon-16.png');
        }

        return details;
      };

      var convertItemToMenu = function (mItem) {
        return function () {
          var cm = require("sdk/context-menu");
          var oldItem = mItem.item;
          if (mItem.type === 'item') {
            mItem.createProperties.onclick = null;
            var details = getDetails(mItem.createProperties);
            var newItem = cm.Menu(details);
            var parentMenu = oldItem.parentMenu;
            if (parentMenu) {
              parentMenu.removeItem(oldItem);
              parentMenu.addItem(newItem);
              mItem.type = 'menu';
              mItem.item = newItem;

              delete mItem.convert;

              var pos = menu.indexOf(oldItem);
              if (pos !== -1) {
                menu.splice(pos, 1, newItem);
              }
            }
          }
        };
      };

      /**
       * @param {Object} [createProperties]
       * @param {String} [createProperties.title]
       * @param {String} [createProperties.id]
       * @param {String} [createProperties.parentId]
       * @param {Array} [createProperties.contexts]
       * @param {Function} [createProperties.onclick]
       * @param {Function} [callback]
       */
      api.contextMenusCreate = function (createProperties, callback) {
        var cm = require("sdk/context-menu");

        var details = getDetails(createProperties);

        if (items[createProperties.id]) {
          throw new Error('Menu item is exists! ' + createProperties.id);
        }

        var item = cm.Item(details);
        if (!createProperties.parentId) {
          menu.push(item);
        } else {
          var parentItem = items[createProperties.parentId];
          if (parentItem.type !== 'menu') {
            parentItem.convert();
          }
          parentItem.item.addItem(item);
        }

        items[createProperties.id] = {
          item: item,
          type: 'item',
          createProperties: createProperties
        };

        items[createProperties.id].convert = convertItemToMenu(items[createProperties.id]);

        callback && callback();
      };

      /**
       * @param {Function} [callback]
       */
      api.contextMenusRemoveAll = function (callback) {
        menu.forEach(function (item) {
          var parent = item.parentMenu;
          parent && parent.removeItem(item);
        });

        Object.keys(items).forEach(function (id) {
          delete items[id];
        });

        menu.splice(0);

        callback && callback();
      };
    })();

    var _navigator = null;
    /**
     * @returns {{language: String, platform: String, userAgent: String}}
     */
    api.getNavigator = function() {
      "use strict";
      if (_navigator) {
        return _navigator;
      }

      var nav = null;
      if (api.isModule) {
        nav = require('sdk/window/utils').getMostRecentBrowserWindow().navigator;
      } else {
        nav = navigator;
      }

      _navigator = {};
      ['language', 'platform', 'userAgent'].forEach(function(key) {
        _navigator[key] = nav[key] || '';
      });

      return _navigator;
    };

    return {
      api: api
    };
  };

  var mono = browserApi(_addon).api;
  mono.isLoaded = true;
  mono.onReady = function(cb) {
    return cb();
  };

  //@insert

  return mono;
}));