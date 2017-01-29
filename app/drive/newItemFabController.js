(function() {
  'use strict';

  angular.module('materialDrive')
    .controller('NewItemFabController', [
      '$window',
      '$mdDialog',
      '$state',
      'google',
      'notifier',
      'MimeType',
      NewItemFabController
    ]);

  function NewItemFabController($window, $mdDialog, $state, google, notifier, MimeType) {
    var self = this;

    self.isExpanded = false;

    self.menuList = [{
      name: 'Document',
      icon: {
        name: 'fa fa-file-word-o fa-lg',
        bg: 'file-word-bg'
      },
      mimeType: MimeType.document
    }, {
      name: 'Spreadsheet',
      icon: {
        name: 'fa fa-file-excel-o fa-lg',
        bg: 'file-spreadsheet-bg'
      },
      mimeType: MimeType.spreadsheet
    }, {
      name: 'Presentation',
      icon: {
        name: 'fa fa-file-powerpoint-o fa-lg',
        bg: 'file-presentation-bg'
      },
      mimeType: MimeType.presentation
    }, {
      name: 'Folder',
      icon: {
        name: 'fa fa-folder fa-lg',
        bg: 'file-bg'
      },
      mimeType: MimeType.folder
    }];

    self.onFileSelected = function($files/*, $file, $event, $rejectedFiles*/) {
      if (!$files.length) {
        return;
      }

      notifier.notify('onFileSelected', {
        fileList: $files
      });
    };

    self.onMenuClick = function($event, $menuIndex, currentFolder) {
      var menuItem = self.menuList[$menuIndex];
      var dialogOption = {
        controller: 'NameDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/dialog/name-dialog.tpl.html',
        bindToController: true,
        clickOutsideToClose: true,
        targetEvent: $event,
        locals: {
          item: menuItem
        }
      };

      if (menuItem.mimeType === MimeType.folder) {
        $mdDialog.show(dialogOption).then(function(name) {
          google.newFile({
            title: name,
            mimeType: menuItem.mimeType,
            parents: currentFolder.isRoot ? undefined : currentFolder
          }).then(function() {
            notifier.notify('onNewItemCreated');
          });
        });
      } else {
        dialogOption.locals.onOk = onFileOk;
        $mdDialog.show(dialogOption);
      }

      function onFileOk(name) {
        $window.callback = function () {
          return google.newFile({
            title: name,
            mimeType: menuItem.mimeType,
            parents: currentFolder.isRoot ? undefined : currentFolder
          }).then(function(response) {
            notifier.notify('onNewItemCreated');

            var data = response.data;
            return data.alternateLink;
          });
        };

        $window.open($state.href('new'), '_blank');
      }
    };
  }

})();
