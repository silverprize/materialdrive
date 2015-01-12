(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdContextMenu', [function() {
    return {
      restrict: 'A',
      scope: {
        menuList: '=',
        onPopup: '&',
        onMenuSelected: '&'
      },
      controller: [
        '$scope',
        '$document',
        '$compile',
        ContextMenuController
      ],
      controllerAs: 'contextMenuCtrl',
      link: link
    };

    function ContextMenuController($scope, $document, $compile) {
      var self = this;

      $scope.onDropdownMenuSelected = function(menu) {
        $scope.onMenuSelected({menu: menu});
      };

      $scope.$on('$destroy', function() {
        self._menuListElem.remove();
      });

      $scope.contextMenuState = {
        left: 0,
        top: 0,
        display: 'none'
      };

      self.init = function(elem) {
        var menuListElem = angular.element('<mtd-dropdown></mtd-dropdown>'),
            bodyElem = angular.element($document[0].body);

        menuListElem.attr({
          'class': 'context-menu',
          'menu-list': 'menuList',
          'on-menu-selected': 'onDropdownMenuSelected(menu)',
          'ng-style': 'contextMenuState'
        });
        $compile(menuListElem)($scope);
        bodyElem.append(menuListElem);

        bodyElem.on('click', function() {
          $scope.contextMenuState.display = 'none';
          $scope.$digest();
        });

        elem.on('contextmenu', function(event) {
          $scope.onPopup();
          event.preventDefault();
          $scope.contextMenuState.left = [event.clientX, 'px'].join('');
          $scope.contextMenuState.top = [event.clientY, 'px'].join('');
          $scope.contextMenuState.display = 'block';
          $scope.$digest();
        });

        self._menuListElem = menuListElem;
        self._elem = elem;
      };
    }

    function link(scope, elem, attrs, ctrl) {
      ctrl.init(elem);
    }
  }]);

})();