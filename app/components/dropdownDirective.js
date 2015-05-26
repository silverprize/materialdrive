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
      templateUrl: 'app/components/dropdown.tpl.html?id=1',
      controller: ['$scope', DropdownController],
      controllerAs: 'dropdownCtrl'
    };

    function DropdownController($scope) {
      var self = this;

      this.onMenuSelected = function(menu) {
        $scope.callback({menu: menu});
      };
    }
  }]);
})();
