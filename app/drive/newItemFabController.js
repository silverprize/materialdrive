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
      mimeType: 'application/vnd.google-apps.folder'
    }, {
      name: 'Document',
      icon: {
        class: 'fa-file-word-o',
        bg: 'file-word-bg'
      },
      mimeType: 'application/vnd.google-apps.document'
    }, {
      name: 'Spreadsheet',
      icon: {
        class: 'fa-file-excel-o',
        bg: 'file-spreadsheet-bg'
      },
      mimeType: 'application/vnd.google-apps.spreadsheet'
    }, {
      name: 'Presentation',
      icon: {
        class: 'fa-file-powerpoint-o',
        bg: 'file-presentation-bg'
      },
      mimeType: 'application/vnd.google-apps.presentation'
    }];

    self.listItemClick = function($event, $index) {
      $mdBottomSheet.hide();

      var clickedItem = self.items[$index];
      $mdDialog.show({
        controller: 'NameDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/drive/name-dialog.tpl.html',
        bindToController: true,
        locals: {
          item: clickedItem
        }
      }).then(function(name) {
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