(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('NavbarController', ['$scope', '$window', '$document', '$state', '$q', '$cacheFactory', '$mdSidenav', 'Google', NavbarController])
  .controller('SidenavController', ['$cacheFactory', 'Google', SidenavController])
  .controller('DriveController', ['$scope', '$state', '$window', '$q', '$mdDialog', '$injector', '$cacheFactory', '$mdMedia', '$mdSidenav', 'notifier', 'Google', 'mimeType', DriveController])
  .controller('NavigationDialogController', ['$scope', '$mdDialog', '$q', 'Google', NavigationDialogController]);

  function NavbarController($scope, $window, $document, $state, $q, $cacheFactory, $mdSidenav, Google) {
    var self = this,
        detailsCache = $cacheFactory.get('details');

    self.toggleSidenav = toggleSidenav;
    self.toggleDetails = toggleDetails;
    self.querySearchText = querySearchText;
    self.searchItemSelected = searchItemSelected;

    self.status = $cacheFactory.get('drive').get('status');
    self.breadcrumb = $cacheFactory.get('drive').get('breadcrumb');

    $scope.$on('$stateChangeSuccess', function() {
      self.status.search = false;
      self.searchText = '';
    });

    function toggleSidenav() {
      $mdSidenav('sidenav').toggle();
    }

    function toggleDetails() {
      var details = $mdSidenav('details');
      if (details.isOpen() || details.isLockedOpen()) {
        detailsCache.put('visible' , false);
        details.close();
      } else {
        detailsCache.put('visible' , true);
        details.open();
      }
    }

    function querySearchText(searchText) {
      var deferred = $q.defer();

      Google.filesList({
        query: Google.query.fullText.concat(' or title contains \'%s\'').replace('%s', searchText)
      }).then(function(response) {
        deferred.resolve(response.data.items);
      }, deferred.reject);

      return deferred.promise;
    }

    function searchItemSelected() {
      if (!self.selectedItem) {
        return;
      }

      if (self.selectedItem.mimeType === Google.mimeType.folder) {
        $state.go('drive.folder', {
          folderId: self.selectedItem.id
        });
      } else {
        $window.open(self.selectedItem.alternateLink);
      }
    }
  }

  function SidenavController($cacheFactory, google) {
    var self = this,
        cache = $cacheFactory.get('sidenav');

    self.onMenuSelect = onMenuSelect;

    self.menuList = cache.get('menuList');
    self.user = cache.get('userInfo');

    google.about().success(function(data) {
      self.user = data.user;
      cache.put('userInfo', data.user);
    });

    function onMenuSelect(menu) {
      if (!self.selectedMenu) {
        self.selectedMenu = self.menuList.filter(function(menu) {
          return menu.selected;
        })[0];
      }

      self.selectedMenu.selected = false;
      menu.selected = true;
      self.selectedMenu = menu;
    }
  }

  function DriveController($scope, $state, $window, $q, $mdDialog, $injector, $cacheFactory, $mdMedia, $mdSidenav, notifier, google, mimeType) {
    var self = this,
        driveCache = $cacheFactory.get('drive'),
        sidenavCache = $cacheFactory.get('sidenav'),
        detailsCache = $cacheFactory.get('details');

    self.init = init;
    self.onContextMenuPopup = onContextMenuPopup;
    self.onContextMenuSelected = onContextMenuSelected;
    self.onItemClicked = onItemClicked;
    self.onItemDoubleClicked = onItemDoubleClicked;
    self.upToParentFolder = upToParentFolder;
    self.isScreenSize = $mdMedia;
    self.isDetailsLocked = isDetailsLocked;

    self.mimeType = mimeType;

    if (!driveCache) {
      driveCache = $cacheFactory('drive');
      driveCache.put('breadcrumb', []);
      driveCache.put('status', {
        view: 'grid',
        search: false
      });
    }

    if (!sidenavCache) {
      sidenavCache = $cacheFactory('sidenav');
      sidenavCache.put('menuList', [{
        icon: 'folder',
        label: 'My Drive',
        href: 'mydrive',
        index: 0
      }, {
        icon: 'people',
        label: 'Share with me',
        href: 'incoming',
        index: 1
      }, {
        icon: 'history',
        label: 'Recent',
        href: 'recent',
        index: 2
      }, {
        icon: 'star',
        label: 'Starred',
        href: 'starred',
        index: 3
      }, {
        icon: 'delete',
        label: 'Trash',
        href: 'trash',
        index: 4
      }]);
    }

    if (!detailsCache) {
      detailsCache = $cacheFactory('details');
    }

    notifier.addListener('newItem', {
      listener: self,
      callback: onCreateNewItem
    });

    notifier.addListener('upload', {
      listener: self,
      callback: onUploadFile
    });

    $scope.$on('$stateChangeSuccess', function() {
      self.selectedItem = undefined;
    });

    $scope.$on('$destroy', function() {
      notifier.removeListener('newItem', self);
      notifier.removeListener('upload', self);
    });

    function init($stateParams) {
      var query = (google.query[$stateParams.category] || google.query.folder).replace('%s', $stateParams.folderId || 'root'),
          promises = [],
          menuList = sidenavCache.get('menuList');

      switch ($stateParams.category) {
        case 'incoming':
          menuList[1].selected = true;
          break;
        case 'recent':
          menuList[2].selected = true;
          break;
        case 'starred':
          menuList[3].selected = true;
          break;
        case 'trash':
          menuList[4].selected = true;
          break;
        default:
          menuList[0].selected = true;
          break;
      }

      self.breadcrumb = driveCache.get('breadcrumb');
      self.status = driveCache.get('status');

      self.selectedItemMap = {};

      self.currentFolder = {
        isRoot: true
      };

      self.contextMenuList = [{
        name: 'Make a copy',
        icon: 'content_copy',
        enabled: true
      }, {
        name: 'Move to',
        icon: 'folder_open',
        enabled: true
      }, {
        name: 'Remove',
        icon: 'delete',
        enabled: true
      }];

      self.loaded = false;

      self.itemListController = {
        query: query,
        maxResults: 20,
        orderBy: 'folder,title asc',
        isBusy: false,
        getItemAtIndex: function(index) {
          this.getMoreItems(index);
          return !!this.items && !!this.items[index] ? this.items[index] : null;
        },
        getMoreItems: function(index) {
          if (this.isBusy) {
            return;
          }

          var _this = this;

          if (!!this.nextPageToken && !!this.items && (this.items.length <= index + 1)) {
            this.isBusy = true;
            google.filesList({
              query: this.query,
              pageToken: this.nextPageToken,
              maxResults: this.maxResults,
              orderBy: this.orderBy
            }).success(function(data) {
              _this.isBusy = false;
              _this.nextPageToken = data.nextPageToken;
              _this.items = _this.items.concat(data.items);
            });
            this.nextPageToken = '';
          }
        },
        getLength: function() {
          return !this.items ? 0 : this.items.length;
        }
      };

      promises.push(google.filesList({
        query: query,
        orderBy: self.itemListController.orderBy,
        maxResults: self.itemListController.maxResults
      }));
      if ($stateParams.folderId) {
        promises.push(google.filesGet($stateParams.folderId));
      }

      $q.all(promises).then(function(responses) {
        var data = responses[0].data;

        if (responses.length === 2) {
          self.currentFolder = responses[1].data;
          self.currentFolder.isRoot = self.currentFolder.parents.length === 0;
        }

        makeBreadcrumb();

        self.itemListController = angular.extend(self.itemListController, data);

        self.loaded = true;
      });
    }

    function makeBreadcrumb() {
      var getRoot = function() {
            return $cacheFactory.get('sidenav').get('menuList').filter(function(menu) {
              return menu.selected;
            })[0];
          }, getParent, breadcrumb;

      if (self.currentFolder.isRoot) {
        self.breadcrumb.splice(0, self.breadcrumb.length);
        self.breadcrumb.push(getRoot());
      } else {
        breadcrumb = [self.currentFolder];
        getParent = function(parent) {
          google.filesGet(parent.id).success(function(data) {
            if (data.parents[0]) {
              breadcrumb.push(data);
              getParent(data.parents[0]);
            } else {
              self.breadcrumb.splice(0, self.breadcrumb.length);
              self.breadcrumb.push(getRoot());
              breadcrumb.reverse().forEach(function(item) {
                self.breadcrumb.push(item);
              });
            }
          });
        };
        getParent(self.currentFolder.parents[0]);
      }

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

      if (item.isSelected) {
        self.selectedItem = item;
      }
    }

    function onItemDoubleClicked(item) {
      if (item.labels.trashed) {
        return;
      }

      if (item.mimeType === google.mimeType.folder) {
        $state.go('drive.folder', {
          category: $state.params.category,
          folderId: item.id
        });
      } else {
        $window.open(item.alternateLink);
      }
    }

    function upToParentFolder() {
      $state.go('drive.folder', {
        category: $state.params.category,
        folderId: self.currentFolder.parents[0].id
      });
    }

    function onCreateNewItem(data) {
      google.newFile({
        title: data.name,
        mimeType: data.mimeType,
        parents: self.currentFolder.isRoot ? '' : self.currentFolder
      }).success(function(data) {
        if (data.mimeType !== google.mimeType.folder) {
          $window.open(data.alternateLink);
        }
        init($state.params);
      });
    }

    function onUploadFile(data) {
      $mdDialog.show({
        locals: {
          currentFolder: self.currentFolder
        },
        templateUrl: 'app/drive/upload-progress-dialog.tpls.html',
        escapeToClose: false,
        clickOutsideToClose: false,
        controllerAs: 'vm',
        controller: function($scope, $mdDialog, currentFolder) {
          var self = this,
              endpointPromises = [],
              uploadPromises = [];

          self.abort = function() {
            if (self.prepared) {
              uploadPromises.forEach(function(promise) {
                promise.abort();
              });
            }
            $mdDialog.cancel();
          };

          data.fileList.forEach(function(file) {
            var promise = google.getUploadEndpoint({
              file: file,
              parents: currentFolder.isRoot ? '' : currentFolder
            }).then(function(response) {
              return {
                response: response,
                file: file
              };
            });
            endpointPromises.push(promise);
          });

          $q.all(endpointPromises).then(function(results) {
            results.forEach(function(result) {
              uploadPromises.push(google.uploadFile({
                endpoint: result.response.headers().location,
                file: result.file
              }));
            });
            $q.all(uploadPromises).then(function() {
              $mdDialog.hide();
              emptySelectedItem();
              init($state.params);
            });
            self.prepared = true;
          });
        }
      });
    }

    function onContextMenuPopup() {
      var countItem = 0,
          hasFolder = false;

      angular.forEach(self.selectedItemMap, function(item) {
        countItem++;
        if (item.mimeType === google.mimeType.folder) {
          hasFolder = true;
        }
      });

      if (!countItem) {
        return false;
      }

      if (countItem > 1 || hasFolder) {
        self.contextMenuList[0].enabled = false;
      } else {
        self.contextMenuList[0].enabled = true;
      }

      return true;
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

    function duplicateFiles() {
      var promises = [];

      angular.forEach(self.selectedItemMap, function(item, itemId) {
        promises.push(google.duplicateFile({fileId: itemId}));
      });

      $q.all(promises).then(function() {
        emptySelectedItem();
        init($state.params);
      });
    }

    function trashFiles() {
      var confirm = $mdDialog.confirm().title('Will be removed').ok('Yes').cancel('Cancel'),
          content = '';

      angular.forEach(self.selectedItemMap, function(item) {
        content = [content, '"', item.title, '", '].join('');
      });
      confirm.content(content.substring(0, content.lastIndexOf(',')));

      $mdDialog.show(confirm).then(function() {
        var promises = [];

        angular.forEach(self.selectedItemMap, function(item, itemId) {
          promises.push(google.moveToTrash({fileId: itemId}));
        });

        $q.all(promises).then(function() {
          emptySelectedItem();
          init($state.params);
        });
      });
    }

    function moveToFiles() {
      $mdDialog.show({
        controller: 'NavigationDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/drive/navigation-dialog.tpl.html',
        bindToController: true,
        clickOutsideToClose: true,
        locals: {
          selectedItemMap: self.selectedItemMap
        },
        resolve: function() {
          return {
            '$injector': $injector
          };
        }
      }).then(function(folder) {
        var promises = [];

        angular.forEach(self.selectedItemMap, function(item, itemId) {
          promises.push(google.moveTo({
            fileId: itemId,
            fromFolderId: item.parents[0].id,
            toFolderId: folder.id
          }));
        });

        $q.all(promises).then(function() {
          emptySelectedItem();
          init($state.params);
        });
      });
    }

    function isDetailsLocked() {
      return !!($mdMedia('gt-md') && detailsCache.get('visible'));
    }
  }

  function NavigationDialogController($scope, $mdDialog, $q, google) {
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
})();
