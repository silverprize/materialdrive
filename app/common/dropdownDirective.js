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
      templateUrl: 'app/common/dropdown.tpl.html',
      controller: ['$scope', DropdownController],
      controllerAs: 'dropdownCtrl'
    };

    function DropdownController($scope) {
      this.onMenuSelected = function(menu) {
        $scope.callback({menu: menu});
      };
    }
  }]);
})();
