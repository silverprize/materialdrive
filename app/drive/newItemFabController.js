(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('NewItemFabController', ['$scope', '$mdDialog', 'Google', 'notifier', NewItemFabController])
  .controller('NameDialogController', ['$scope', '$mdDialog', NameDialogController]);

  function NewItemFabController($scope, $mdDialog, Google, notifier) {
    var self = this;

    self.menuList = [{
      name: 'Document',
      icon: {
        name: 'fa fa-file-word-o fa-lg',
        bg: 'file-word-bg'
      },
      mimeType: Google.mimeType.document
    }, {
      name: 'Spreadsheet',
      icon: {
        name: 'fa fa-file-excel-o fa-lg',
        bg: 'file-spreadsheet-bg'
      },
      mimeType: Google.mimeType.spreadsheet
    }, {
      name: 'Presentation',
      icon: {
        name: 'fa fa-file-powerpoint-o fa-lg',
        bg: 'file-presentation-bg'
      },
      mimeType: Google.mimeType.presentation
    }, {
      name: 'Folder',
      icon: {
        name: 'fa fa-folder fa-lg',
        bg: 'file-bg'
      },
      mimeType: Google.mimeType.folder
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
        templateUrl: 'app/drive/name-dialog.tpl.html',
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

  function NameDialogController($scope, $mdDialog) {
    var self = this;

    $scope.ok = function() {
      $mdDialog.hide(self.fileName);
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  }

})();
