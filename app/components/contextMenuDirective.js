(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdContextMenu', ['$compile', '$document', function($compile, $document) {
    return {
      restrict: 'A',
      scope: {
        menuList: '=',
        callback: '&onMenuSelected'
      },
      controller: ['$scope', '$compile', ContextMenuController],
      controllerAs: 'contextMenuCtrl',
      link: link
    };

    function ContextMenuController($scope, $compile) {

    }

    function link(scope, elem, attrs) {
      var menuListElem = angular.element('<mtd-dropdown></mtd-dropdown>'),
          bodyElem = angular.element($document[0].body);

      menuListElem.attr({
        'class': 'context-menu',
        'menu-list': 'menuList',
        'on-menu-selected': 'onMenuSelected(menu)',
        'ng-style': 'contextMenuState'
      });
      $compile(menuListElem)(scope);
      bodyElem.append(menuListElem);
      scope.$on('$destroy', function() {
        menuListElem.remove();
      });

      bodyElem.on('click', function() {
        scope.contextMenuState.display = 'none';
        scope.$digest();
      });

      elem.on('contextmenu', function(event) {
        event.preventDefault();
        scope.contextMenuState.left = [event.clientX, 'px'].join('');
        scope.contextMenuState.top = [event.clientY, 'px'].join('');
        scope.contextMenuState.display = 'block';
        scope.$digest();
      });

      scope.contextMenuState = {
        left: 0,
        top: 0,
        display: 'none'
      };

      scope.onMenuSelected = function(menu) {
        scope.callback({menu: menu});
      };
    }
  }]);

})();