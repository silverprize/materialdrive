(function() {
  'use strict';

  angular.module('materialDrive')
    .controller('NewItemFabController', [
      '$mdDialog',
      'google',
      'notifier',
      'MimeType',
      NewItemFabController
    ]);

  function NewItemFabController($mdDialog, google, notifier, MimeType) {
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

      notifier.notify('upload', {
        fileList: $files
      });
    };

    self.menuClick = function($event, $index) {
      var clickedMenu = self.menuList[$index];
      $mdDialog.show({
        controller: 'NameDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/dialog/name-dialog.tpl.html',
        bindToController: true,
        clickOutsideToClose: true,
        targetEvent: $event,
        locals: {
          item: clickedMenu
        },
        onComplete: function(scope, elem/*, options*/) {
          elem.find('input').focus();
        }
      }).then(function(name) {
        notifier.notify('newItem', {
          name: name,
          mimeType: clickedMenu.mimeType
        });
      });
    };
  }

})();
