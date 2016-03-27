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
        'Util',
        ContextMenuController
      ],
      controllerAs: 'contextMenuCtrl',
      link: link
    };

    function ContextMenuController($scope, $document, $compile, Util) {
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
        visibility: 'hidden'
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
          var left, top, offset;

          if ($scope.onPopup()) {
            left = event.clientX;
            top = event.clientY;
            offset = Util.offset(this);

            if (left + menuListElem[0].clientWidth > offset.left + this.clientWidth) {
              left -= (left + menuListElem[0].clientWidth) - (offset.left + this.clientWidth);
            }
            if (top + menuListElem[0].clientHeight > offset.top + this.clientHeight) {
              top -= (top + menuListElem[0].clientHeight) - (offset.top + this.clientHeight);
            }

            $scope.contextMenuState.left = left + 'px';
            $scope.contextMenuState.top = top + 'px';
            $scope.contextMenuState.visibility = 'visible';
            $scope.contextMenuState.display = 'block';
          }

          $scope.$digest();
          event.preventDefault();
        });

        self._elem = elem;
        self._menuListElem = menuListElem;
      };
    }

    function link(scope, elem, attrs, ctrl) {
      ctrl.init(elem);
    }
  }]);

})();
