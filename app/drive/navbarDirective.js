(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('navbar', [function() {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      templateUrl: 'app/drive/navbar.tpl.html',
      controller: [
        '$route',
        NavbarController
      ],
      controllerAs: 'navbarCtrl',
    };

    function NavbarController($route) {
      var self = this;

      self.topMenuList = [{
        label: 'My Drive',
        href: '#drive/mydrive',
        index: 0
      }, {
        label: 'Incoming',
        href: '#drive/incoming',
        index: 1
      }, {
        label: 'Recent',
        href: '#drive/recent',
        index: 2
      }, {
        label: 'Starred',
        href: '#drive/starred',
        index: 3
      }, {
        label: 'Trash',
        href: '#drive/trash',
        index: 4
      }];

      self.onMenuSelect = onMenuSelect;

      init();

      function init() {
        switch ($route.current.params.category) {
          case 'incoming':
            self.selectedMenu = self.topMenuList[1];
            break;
          case 'recent':
            self.selectedMenu = self.topMenuList[2];
            break;
          case 'starred':
            self.selectedMenu = self.topMenuList[3];
            break;
          case 'trash':
            self.selectedMenu = self.topMenuList[4];
            break;
          default:
            self.selectedMenu = self.topMenuList[0];
            break;
        }

        self.selectedMenu.selected = true;
      }

      function onMenuSelect(menu) {
        self.selectedMenu.selected = false;
        menu.selected = true;
        self.selectedMenu = menu;
      }
    }
  }]);
})();