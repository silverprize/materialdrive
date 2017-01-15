(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('SidenavController', [
      '$cacheFactory',
      '$mdSidenav',
      'google',
      SidenavController
    ]);

  function SidenavController($cacheFactory, $mdSidenav, google) {
    var self = this;
    var cache = $cacheFactory.get('sidenav');

    self.onMenuSelect = onMenuSelect;

    self.menuList = cache.get('menuList');
    self.user = cache.get('userInfo');

    google.about().then(function(response) {
      var data = response.data;
      data.user = angular.extend({
        picture: {
          url: 'assets/images/ic_account_circle_white_24px.svg'
        }
      }, data.user);
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

      $mdSidenav('sidenav').toggle();
    }
  }

}());