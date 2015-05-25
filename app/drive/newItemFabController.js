(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('NewItemFabController', [
    '$scope',
    '$mdBottomSheet',
    '$mdDialog',
    NewItemFabController
  ])
  .controller('BottomSheetController', [
    '$scope',
    '$mdBottomSheet',
    '$mdDialog',
    'google',
    'notifier',
    BottomSheetController
  ])
  .controller('NameDialogController', [
    '$scope',
    '$mdDialog',
    NameDialogController
  ]);

  function NewItemFabController($scope, $mdBottomSheet, $mdDialog) {
    var self = this;

    self.showNewItemMenu = showNewItemMenu;

    function showNewItemMenu($event) {
      $mdBottomSheet.show({
        templateUrl: 'app/drive/new-item-menu-sheet.tpl.html',
        controller: 'BottomSheetController',
        controllerAs: 'vm',
        targetEvent: $event
      });
    }
  }

  function BottomSheetController($scope, $mdBottomSheet, $mdDialog, google, notifier) {
    var self = this;

    self.items = [{
      name: 'Folder',
      icon: {
        class: 'fa-folder',
        bg: ''
      },
      mimeType: google.mimeType.folder
    }, {
      name: 'Document',
      icon: {
        class: 'fa-file-word-o',
        bg: 'file-word-bg'
      },
      mimeType: google.mimeType.document
    }, {
      name: 'Spreadsheet',
      icon: {
        class: 'fa-file-excel-o',
        bg: 'file-spreadsheet-bg'
      },
      mimeType: google.mimeType.spreadsheet
    }, {
      name: 'Presentation',
      icon: {
        class: 'fa-file-powerpoint-o',
        bg: 'file-presentation-bg'
      },
      mimeType: google.mimeType.presentation
    }];

    self.onFileSelected = function ($files, $event) {
      $mdBottomSheet.hide();
      notifier.notify('upload', {
        fileList: $files
      });
    };

    self.listItemClick = function($event, $index) {
      var clickedItem = self.items[$index];
      $mdDialog.show({
        controller: 'NameDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/drive/name-dialog.tpl.html',
        bindToController: true,
        clickOutsideToClose: true,
        targetEvent: $event,
        locals: {
          item: clickedItem
        },
        onComplete: function(scope, elem, options) {
          elem.find('input').focus();
        }
      }).then(function(name) {
        $mdBottomSheet.hide();
        notifier.notify('newItem', {
          name: name,
          mimeType: clickedItem.mimeType
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
