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
    'notifier',
    'google',
    DriveController
  ]);

  function DriveController($scope, $location, $routeParams, $filter, $window, $q, notifier, google) {
    var self = this;

    $scope.base.config = {
      useNavbar: true,
      useFab: true
    };

    self.selectedItemMap = {};

    self.currentFolder = {
      isRoot: true
    };

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
      var query, promises;

      switch ($routeParams.category) {
        case 'incoming':
          query = 'trashed = false and not \'me\' in owners and sharedWithMe';
          break;
        case 'recent':
          query = '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false';
          break;
        case 'starred':
          query = 'trashed = false and starred = true';
          break;
        case 'trash':
          query = 'trashed = true and explicitlyTrashed = true';
          break;
        case 'folder':
          query = 'trashed = false and \''.concat($routeParams.itemId).concat('\' in parents');
          break;
        default:
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

    function onItemClicked(item) {
      if (self.selectedItemMap[item.id]) {
        delete self.selectedItemMap[item.id];
        item.isSelected = false;
      } else {
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
  }

})();