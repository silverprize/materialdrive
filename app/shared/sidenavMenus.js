(function () {
    var menusList = [{
      icon: 'folder',
      label: 'My Drive',
      href: 'root',
      index: 0
    }, {
      icon: 'people',
      label: 'Share with me',
      href: 'incoming',
      index: 1
    }, {
      icon: 'history',
      label: 'Recent',
      href: 'recent',
      index: 2
    }, {
      icon: 'star',
      label: 'Starred',
      href: 'starred',
      index: 3
    }, {
      icon: 'delete',
      label: 'Trash',
      href: 'trash',
      index: 4
    }];

    angular.module('materialDrive').constant('SidenavMenus', menusList);
})();