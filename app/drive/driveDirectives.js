(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdRightClick', ['$parse', '$rootScope', MtdRightClick])
  .directive('mtdFocus', ['$timeout', MtdFocus])
  .directive('mtdDetails', [MtdDetails]);

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

  function MtdFocus($timeout) {
    return {
      link: function(scope, elem, attrs) {
        attrs.$observe('mtdFocus', function(newValue) {
          if (!!newValue) {
            $timeout(function() {
              elem.find('input').focus();
            });
          }
        });
      }
    };
  }

  function MtdDetails() {
    return {
      restrict: 'EA',
      scope: {
        item: '=mtdDetailsItem'
      },
      templateUrl: 'app/drive/details.tpl.html',
      controller: ['$scope', '$mdSidenav', '$mdMedia', '$cacheFactory',
           function($scope,   $mdSidenav,   $mdMedia,   $cacheFactory) {
        if (!!($mdMedia('gt-md') && $cacheFactory.get('details').get('visible'))) {
          $mdSidenav('details').open();
        } else {
          $mdSidenav('details').close();
        }
      }],
      controllerAs: 'detailsCtrl'
    };
  }

})();
