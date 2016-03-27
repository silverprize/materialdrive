(function() {
  'use strict';

  angular.module('materialDrive')
  .factory('notifier', [
    Notifier
  ]);

  function Notifier() {
    var listenerMap = {};
    return {
      addListener: function(eventType, listener) {
        var listenerList = listenerMap[eventType];
        if (!listenerList) {
          listenerMap[eventType] = listenerList = [];
        }
        listenerList.push(listener);
      },
      notify: function(eventType, data) {
        var listenerList = listenerMap[eventType];
        if (listenerList) {
          angular.forEach(listenerList, function(listener) {
            listener.callback(data);
          });
        }
      },
      removeListener: function(eventType, listener) {
        var listenerList = listenerMap[eventType],
            i = 0;

        if (listenerList) {
          for (i = 0; i < listenerList.length; i++) {
            if (listener === listenerList[i].listener) {
              listenerList.splice(i, 1);
              break;
            }
          }
        }
      }
    };
  }
})();