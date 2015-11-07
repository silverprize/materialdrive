(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdRightClick', ['$parse', '$rootScope', MtdRightClick])
  .directive('mtdFocus', ['$timeout', MtdFocus])
  .directive('mtdDetails', ['mimeType', MtdDetails]);

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
          if (newValue === 'on') {
            $timeout(function() {
              elem.find('input').focus();
            });
          }
        });
      }
    };
  }

  function MtdDetails(mimeType) {
    return {
      scope: {
        item: '=mtdDetails'
      },
      templateUrl: 'app/drive/details.tpl.html',
      controller: ['$scope', '$mdSidenav', '$mdMedia', '$cacheFactory',
           function($scope,   $mdSidenav,   $mdMedia,   $cacheFactory) {
        var self = this;

        self.isFolder = isFolder;

        if (!!($mdMedia('gt-md') && $cacheFactory.get('details').get('visible'))) {
          $mdSidenav('details').open();
        } else {
          $mdSidenav('details').close();
        }

        function isFolder() {
          return $scope.item && $scope.item.mimeType === mimeType.folder;
        }
      }],
      controllerAs: 'detailsCtrl'
    };
  }

})();
