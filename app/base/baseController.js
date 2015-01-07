(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('BaseController', [
    '$scope',
    '$window',
    '$q',
    '$mdBottomSheet',
    '$mdDialog',
    'google',
    BaseController
  ]);

  function BaseController($scope, $window, $q, $mdBottomSheet, $mdDialog, google) {
    $scope.base = {
      config: {}
    };

    $scope.base.showNewItemMenu = showNewItemMenu;

    function showNewItemMenu($event) {
      $mdBottomSheet.show({
        templateUrl: 'app/widgets/new-item-menu-sheet.tpl.html',
        controller: [
          '$scope',
          '$mdBottomSheet',
          '$mdDialog',
          'google',
          'notifier',
          BottomSheetCtrl
        ],
        controllerAs: 'vm',
        targetEvent: $event
      });
    }
  }

  function BottomSheetCtrl($scope, $mdBottomSheet, $mdDialog, google, notifier) {
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
      var clickedItem = self.items[$index];
      $mdDialog.show({
        controller: NameDialogCtrl,
        controllerAs: 'vm',
        templateUrl: 'app/widgets/name-dialog.tpl.html',
        targetEvent: $event,
        locals: {
          item: clickedItem
        }
      }).then(function(name) {
        notifier.notify('newItem', {
          name: name,
          mimeType: clickedItem.mimeType
        });
      });
      $mdBottomSheet.hide();
    };
  }

  function NameDialogCtrl($scope, $mdDialog, item) {
    var self = this;

    self.item = item;

    self.ok = function() {
      $mdDialog.hide(self.fileName);
    };

    self.cancel = function() {
      $mdDialog.cancel();
    };
  }

})();