(function () {
  'use strict';

  angular.module('materialDrive')
    .directive('mtdDoubleClick', ['$parse', '$rootScope', '$timeout', '$window', MtdDoubleClick]);

  function MtdDoubleClick($parse, $rootScope, $timeout, $window) {
    return {
      restrict: 'A',
      compile: function($element, attr) {
        var fn = $parse(attr.mtdDoubleClick, /* interceptorFn */ null, /* expensiveChecks */ true);

        return function EventHandler(scope, element) {
          if ('ontouchstart' in $window) {
            doubleTab(scope, element);
          } else {
            doubleClick(scope, element);
          }
        };

        function doubleClick(scope, element) {
          element.on('dblclick', function(event) {
            if ($rootScope.$$phase) {
              scope.$evalAsync(callback);
            } else {
              scope.$apply(callback);
            }

            function callback() {
              fn(scope, {$event:event});
            }
          });
        }

        function doubleTab(scope, element) {
          var INTERVAL = 300;
          var firstClickTime;
          var isWaitingSecondClick = false;

          element.on('touchend', function (event) {
            if (!isWaitingSecondClick) {
              firstClickTime = Date.now();
              isWaitingSecondClick = true;

              $timeout(function () {
                isWaitingSecondClick = false;
              }, INTERVAL);
            } else {
              isWaitingSecondClick = false;

              if (Date.now() - firstClickTime < INTERVAL) {
                if ($rootScope.$$phase) {
                  scope.$evalAsync(callback);
                } else {
                  scope.$apply(callback);
                }
              }
            }

            function callback() {
              fn(scope, {$event: event});
            }
          });
        }
      }
    };
  }
})();