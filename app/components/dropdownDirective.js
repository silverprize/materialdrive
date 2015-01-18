(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdDropdown', [function() {
    return {
      restrict: 'EA',
      scope: {
        menuList: '=',
        callback: '&onMenuSelected'
      },
      templateUrl: 'app/components/dropdown.tpl.html',
      controller: ['$scope', DropdownController],
      controllerAs: 'dropdownCtrl',
      link: link
    };

    function DropdownController($scope) {

    }

    function link(scope, elem, attrs) {
      scope.onMenuSelected = function(menu) {
        scope.callback({menu: menu});
      };
    }
  }]);
})();