(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('GateCtrl', [
    '$location',
    '$routeParams',
    'google',
    GateCtrl])
  .controller('DriveCtrl', [
    '$location',
    '$routeParams',
    '$filter',
    '$window',
    '$q',
    '$mdBottomSheet',
    '$mdDialog',
    'google',
    DriveCtrl]);

  function GateCtrl($location, $routeParams, google) {
    var self = this;

    self.authorize = authorize;

    function authorize() {
      google.authorize(false).then(function() {
        var redirect = $routeParams.redirect || '/drive/mydrive';
        $location.url(redirect);
      });
    }
  }

  function DriveCtrl($location, $routeParams, $filter, $window, $q, $mdBottomSheet, $mdDialog, google) {
    var self = this;

    self.topMenuList = [{
      label: 'My Drive',
      route: '#drive/mydrive'
    }, {
      label: 'Incoming',
      route: '#drive/incoming'
    }, {
      label: 'Recent',
      route: '#drive/recent'
    }, {
      label: 'Starred',
      route: '#drive/starred'
    }, {
      label: 'Trash',
      route: '#drive/trash'
    }];

    self.currentFolder = {
      isRoot: true
    };

    self.clickItem = clickItem;

    self.upToParentFolder = upToParentFolder;

    self.showNewMenu = showNewMenu;

    init();

    function init() {
      var query, promises;

      switch ($routeParams.category) {
        case 'incoming':
          self.topMenuList[1].selected = true;
          query = 'trashed = false and not \'me\' in owners and sharedWithMe';
          break;
        case 'recent':
          self.topMenuList[2].selected = true;
          query = '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false';
          break;
        case 'starred':
          self.topMenuList[3].selected = true;
          query = 'trashed = false and starred = true';
          break;
        case 'trash':
          self.topMenuList[4].selected = true;
          query = 'trashed = true and explicitlyTrashed = true';
          break;
        case 'folder':
          query = 'trashed = false and \''.concat($routeParams.itemId).concat('\' in parents');
          break;
        default:
          self.topMenuList[0].selected = true;
          query = 'trashed = false and \'root\' in parents';
          break;
      }

      promises = [];
      if ($routeParams.itemId) {
        promises.push(google.filesGet($routeParams.itemId));
      }
      promises.push(google.filesList(query));

      $q.all(promises).then(function(responses) {
        var folderList = [],
            fileList = [],
            data;

        if (responses.length === 2) {
          self.currentFolder = responses[0].data;
          self.currentFolder.isRoot = self.currentFolder.parents.length === 0;
          data = responses[1].data;
        } else {
          data = responses[0].data;
        }

        angular.forEach(data.items, function(item) {
          if (item.mimeType === 'application/vnd.google-apps.folder') {
            folderList.push(item);
          } else {
            fileList.push(item);
          }
        });
        self.folderList = $filter('orderBy')(folderList, 'title');
        self.fileList = $filter('orderBy')(fileList, 'title');
      });
    }

    function clickItem(item) {
      if (item.labels.trashed) {
        return;
      }

      if (item.mimeType === 'application/vnd.google-apps.folder') {
        $location.url('/drive/folder/'.concat(item.id));
      } else {
        $window.open(item.alternateLink);
      }
    }

    function upToParentFolder() {
      $location.url('/drive/folder/'.concat(self.currentFolder.parents[0].id));
    }

    function showNewMenu($event) {
      $mdBottomSheet.show({
        templateUrl: 'app/tpls/new-menu-list.tpl.html',
        controller: ['$scope', '$mdBottomSheet', 'google', BottomSheetCtrl],
        controllerAs: 'vm',
        targetEvent: $event
      }).then(function(clickedItem) {
        $mdDialog.show({
          controller: NameDialogCtrl,
          controllerAs: 'vm',
          templateUrl: 'app/tpls/name-dialog.tpl.html',
          targetEvent: $event,
          locals: {
            item: clickedItem
          }
        }).then(function(name) {
          google.newFile({
            title: name,
            mimeType: clickedItem.mimeType,
            parents: self.currentFolder.isRoot ? '' : self.currentFolder
          }).success(function(data) {
            if (data.mimeType !== 'application/vnd.google-apps.folder') {
              $window.open(data.alternateLink);
            }
            init();
          });
        });
      });
    }
  }

  function BottomSheetCtrl($scope, $mdBottomSheet, google) {
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

    self.listItemClick = function($index) {
      var clickedItem = self.items[$index];
      $mdBottomSheet.hide(clickedItem);
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