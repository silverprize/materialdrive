(function () {
    var menusList = [{
      icon: 'folder',
      label: 'My Drive',
      id: 'root',
      index: 0
    }, {
      icon: 'people',
      label: 'Share with me',
      id: 'incoming',
      index: 1
    }, {
      icon: 'history',
      label: 'Recent',
      id: 'recent',
      index: 2
    }, {
      icon: 'star',
      label: 'Starred',
      id: 'starred',
      index: 3
    }, {
      icon: 'delete',
      label: 'Trash',
      id: 'trash',
      index: 4
    }];

    angular.module('materialDrive').constant('SidenavMenus', menusList);
})();