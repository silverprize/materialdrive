(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('NavigationDialogController', [
      '$mdDialog',
      'google',
      'MimeType',
      'SidenavMenus',
      NavigationDialogController
    ]);

  function NavigationDialogController($mdDialog, google, MimeType, SidenavMenus) {
    var self = this;

    self.currentFolder = angular.copy(SidenavMenus[0], {isRoot: true});

    self.path = [self.currentFolder];

    self.selectFolder = selectFolder;

    self.exapnd = expand;

    self.goToParent = goToParent;

    getList(self.currentFolder.id);

    function selectFolder() {
      $mdDialog.hide(self.currentFolder);
    }

    function goToParent() {
      if (self.path.length > 1) {
        self.path.pop();
      }
      self.currentFolder = self.path[self.path.length - 1];
      getList(self.currentFolder.id);
    }

    function expand(folder) {
      self.path.push(folder);
      self.currentFolder = folder;
      getList(folder.id);
    }

    function getList(id) {
      google.filesList({
        query: google.query.folder.replace('%s', id),
        mimeType: MimeType.folder
      }).then(function (response) {
        var data = response.data;
        self.folderList = data.items;
      });
    }
  }
}());