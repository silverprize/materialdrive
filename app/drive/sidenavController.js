(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('SidenavController', ['$cacheFactory', 'google', SidenavController]);

  function SidenavController($cacheFactory, google) {
    var self = this,
      cache = $cacheFactory.get('sidenav');

    self.onMenuSelect = onMenuSelect;

    self.menuList = cache.get('menuList');
    self.user = cache.get('userInfo');

    google.about().success(function(data) {
      self.user = data.user;
      cache.put('userInfo', data.user);
    });

    function onMenuSelect(menu) {
      if (!self.selectedMenu) {
        self.selectedMenu = self.menuList.filter(function(menu) {
          return menu.selected;
        })[0];
      }

      self.selectedMenu.selected = false;
      menu.selected = true;
      self.selectedMenu = menu;
    }
  }

}());