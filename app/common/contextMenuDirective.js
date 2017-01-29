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
        '$timeout',
        'Util',
        ContextMenuController
      ],
      controllerAs: 'contextMenuCtrl',
      link: link
    };

    function ContextMenuController($scope, $document, $compile, $timeout, Util) {
      var self = this;
      var bodyElem = angular.element($document[0].body);

      $scope.onDropdownMenuSelected = function(menu) {
        $scope.onMenuSelected({menu: menu});
      };

      $scope.$on('$destroy', function() {
        self._menuListElem.remove();
        bodyElem.off('click', onClickOutside);
      });

      $scope.contextMenuState = {
        left: 0,
        top: 0,
        display: 'none'
      };

      self.init = function(elem) {
        var menuListElem = angular.element('<mtd-dropdown></mtd-dropdown>');

        menuListElem.attr({
          'class': 'context-menu',
          'menu-list': 'menuList',
          'on-menu-selected': 'onDropdownMenuSelected(menu)',
          'ng-style': 'contextMenuState'
        });
        $compile(menuListElem)($scope);
        bodyElem.append(menuListElem);

        bodyElem.on('click', onClickOutside);

        elem.on('contextmenu', function(event) {
          event.preventDefault();

          var left;
          var top;
          var offset;

          if ($scope.onPopup()) {
            left = event.clientX;
            top = event.clientY;

            $scope.contextMenuState.visibility = 'hidden';
            $scope.contextMenuState.display = 'block';

            $scope.$digest();

            $timeout(function () {
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
            }.bind(this));
          }
        });

        self._elem = elem;
        self._menuListElem = menuListElem;
      };

      function onClickOutside() {
        $scope.contextMenuState.display = 'none';
        $scope.$digest();
      }
    }

    function link(scope, elem, attrs, ctrl) {
      ctrl.init(elem);
    }
  }]);

})();
