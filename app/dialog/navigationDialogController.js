(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('NavigationDialogController', ['$mdDialog', 'google', NavigationDialogController]);

  function NavigationDialogController($mdDialog, google) {
    var self = this;

    self.currentFolder = {
      title: 'My Drive',
      id: 'root',
      isRoot: true
    };

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
        mimeType: google.mimeType.folder
      }).success(function (data) {
        self.folderList = data.items;
      });
    }
  }
}());