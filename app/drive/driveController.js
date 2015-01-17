(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('DriveController', [
    '$scope',
    '$location',
    '$routeParams',
    '$filter',
    '$window',
    '$q',
    '$mdDialog',
    'notifier',
    'google',
    DriveController
  ])
  .controller('FileNavigationDialogController', [
    '$scope',
    '$mdDialog',
    FileNavigationDialogController
  ])
  .directive('mtdRightClick', ['$parse', '$rootScope', function($parse, $rootScope) {
    return {
      restrict: 'A',
      compile: function($element, attr) {
        var fn = $parse(attr.mtdRightClick, /* interceptorFn */ null, /* expensiveChecks */ true);
        return function EventHandler(scope, element) {
          element.on('contextmenu', function(event) {
            var callback = function() {
              fn(scope, {$event:event});
            };
            if ($rootScope.$$phase) {
              scope.$evalAsync(callback);
            } else {
              scope.$apply(callback);
            }
          });
        };
      }
    };
  }]);

  function DriveController($scope, $location, $routeParams, $filter, $window, $q, $mdDialog, notifier, google) {
    var self = this;

    $scope.base.config = {
      useNavbar: true,
      useFab: true,
      fabTemplateUrl: 'app/drive/new-item-fab.tpl.html',
      ngViewClass: 'drive-body-container'
    };

    self.selectedItemMap = {};

    self.currentFolder = {
      isRoot: true
    };

    self.contextMenuList = [{
      name: 'Make a copy',
      enabled: true
    }, {
      name: 'Move to',
      enabled: true
    }, {
      name: 'Remove',
      enabled: true
    }];

    self.onContextMenuPopup = onContextMenuPopup;
    self.onContextMenuSelected = onContextMenuSelected;
    self.onItemClicked = onItemClicked;
    self.onItemDoubleClicked = onItemDoubleClicked;
    self.upToParentFolder = upToParentFolder;

    notifier.addListener('newItem', {
      listener: self,
      callback: callbackNewItemEvent
    });

    $scope.$on('$destroy', function() {
      notifier.removeListener('newItem', self);
    });

    init();

    function init() {
      var query = (google.query[$routeParams.category] || google.query.folder).replace('%s', $routeParams.itemId || 'root'),
          promises = [];

      promises.push(google.filesList(query));
      if ($routeParams.itemId) {
        promises.push(google.filesGet($routeParams.itemId));
      }

      $q.all(promises).then(function(responses) {
        var folderList = [],
            fileList = [],
            data = responses[0].data;

        if (responses.length === 2) {
          self.currentFolder = responses[1].data;
          self.currentFolder.isRoot = self.currentFolder.parents.length === 0;
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

    function onItemClicked(item, add) {
      if (add) {
        if (self.selectedItemMap[item.id]) {
          delete self.selectedItemMap[item.id];
          item.isSelected = false;
        } else {
          self.selectedItemMap[item.id] = item;
          item.isSelected = true;
        }
      } else if (!self.selectedItemMap[item.id]) {
        emptySelectedItem();
        self.selectedItemMap[item.id] = item;
        item.isSelected = true;
      }
    }

    function onItemDoubleClicked(item) {
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

    function callbackNewItemEvent(data) {
      google.newFile({
        title: data.name,
        mimeType: data.mimeType,
        parents: self.currentFolder.isRoot ? '' : self.currentFolder
      }).success(function(data) {
        if (data.mimeType !== 'application/vnd.google-apps.folder') {
          $window.open(data.alternateLink);
        }
        init();
      });
    }

    function onContextMenuPopup() {
      var countItem = 0,
          hasFolder = false;

      angular.forEach(self.selectedItemMap, function(item) {
        countItem++;
        if (item.mimeType === 'application/vnd.google-apps.folder') {
          hasFolder = true;
        }
      });

      if (countItem > 1 || hasFolder) {
        self.contextMenuList[0].enabled = false;
      } else {
        self.contextMenuList[0].enabled = true;
      }
    }

    function onContextMenuSelected(menu) {
      switch (menu.name) {
      case 'Make a copy':
        duplicateFiles();
        break;
      case 'Remove':
        trashFiles();
        break;
      case 'Move to':
        moveToFiles();
        break;
      }
    }

    function emptySelectedItem() {
      angular.forEach(self.selectedItemMap, function(item) {
        item.isSelected = false;
      });
      self.selectedItemMap = {};
    }

    function countSelectedItems() {
      var count = 0;
      angular.forEach(self.selectedItemMap, function() {
        count++;
      });
      return count;
    }

    function duplicateFiles() {
      var promise;
      angular.forEach(self.selectedItemMap, function(item, itemId) {
        promise = google.duplicateFile({fileId: itemId});
      });
      promise.success(function() {
        emptySelectedItem();
        init();
      });
    }

    function trashFiles() {
      var promise;
      angular.forEach(self.selectedItemMap, function(item, itemId) {
        promise = google.moveToTrash({fileId: itemId});
      });
      promise.success(function() {
        emptySelectedItem();
        init();
      });
    }

    function moveToFiles() {
      $mdDialog.show({
        controller: 'FileNavigationDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/drive/file-navigation-dialog.tpl.html',
      }).then(function(folder) {
        var promise;
        angular.forEach(self.selectedItemMap, function(item, itemId) {
          promise = google.moveTo({
            fileId: itemId,
            fromFolderId: item.parents[0].id,
            toFolderId: folder.id,
            locals: {
              google: google
            }
          });
        });
        promise.success(function() {
          emptySelectedItem();
          init();
        });
      });
    }
  }

  function FileNavigationDialogController($scope, $mdDialog, google) {

  }

})();