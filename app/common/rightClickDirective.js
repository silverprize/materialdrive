(function() {
  'use strict';

  angular.module('materialDrive')
    .directive('mtdRightClick', ['$parse', '$rootScope', MtdRightClick]);

  function MtdRightClick($parse, $rootScope) {
    return {
      compile: function($element, attr) {
        var fn = $parse(attr.mtdRightClick, /* interceptorFn */ null, /* expensiveChecks */ true);
        return function EventHandler(scope, element) {
          element.on('contextmenu', function(event) {
            var callback = function() {
              fn(scope, {$event:event});
            };
            if ($rootScope.$$phase) {
              scope.$evalAsync(callback);
            } else {
              scope.$apply(callback);
            }
          });
        };
      }
    };
  }

}());