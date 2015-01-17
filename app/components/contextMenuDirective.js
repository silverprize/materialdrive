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

      var fnDestroyMenu = function() {
        if (self._menuListElem) {
          self._menuListElem.remove();
        }
      };

      $scope.onDropdownMenuSelected = function(menu) {
        $scope.onMenuSelected({menu: menu});
      };

      $scope.$on('$destroy', fnDestroyMenu);

      $scope.contextMenuState = {
        left: 0,
        top: 0,
        display: 'none'
      };

      self.init = function(elem) {
        var bodyElem = angular.element($document[0].body);

        bodyElem.on('click', function() {
          fnDestroyMenu();
          $scope.contextMenuState.display = 'none';
          $scope.$digest();
        });

        elem.on('contextmenu', function(event) {
          var menuListElem = angular.element('<mtd-dropdown></mtd-dropdown>');

          fnDestroyMenu();

          menuListElem.attr({
            'class': 'context-menu',
            'menu-list': 'menuList',
            'on-menu-selected': 'onDropdownMenuSelected(menu)',
            'ng-style': 'contextMenuState'
          });
          $compile(menuListElem)($scope);
          bodyElem.append(menuListElem);
          self._menuListElem = menuListElem;

          $scope.onPopup();
          $scope.contextMenuState.left = [event.clientX, 'px'].join('');
          $scope.contextMenuState.top = [event.clientY, 'px'].join('');
          $scope.contextMenuState.display = 'block';
          $scope.$digest();
          event.preventDefault();
        });
        self._elem = elem;
      };
    }

    function link(scope, elem, attrs, ctrl) {
      ctrl.init(elem);
    }
  }]);

})();