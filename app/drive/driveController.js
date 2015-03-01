(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('NavbarController', [
    '$scope',
    '$window',
    '$document',
    '$location',
    '$q',
    '$cacheFactory',
    '$mdSidenav',
    'google',
    NavbarController
  ])
  .controller('SidenavController', [
    '$cacheFactory',
    'google',
    SidenavController
  ])
  .controller('DriveController', [
    '$scope',
    '$location',
    '$routeParams',
    '$filter',
    '$window',
    '$q',
    '$mdDialog',
    '$injector',
    '$cacheFactory',
    'notifier',
    'google',
    DriveController
  ])
  .controller('NavigationDialogController', [
    '$scope',
    '$mdDialog',
    '$injector',
    NavigationDialogController
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
  }])
  .directive('focus', ['$timeout', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, elem, attrs) {
        attrs.$observe('focus', function(newValue) {
          if (newValue === 'on') {
            $timeout(function() {
              elem.find('input').focus();
            });
          }
        });
      }
    };
  }]);

  function NavbarController($scope, $window, $document, $location, $q, $cacheFactory, $mdSidenav, google) {
    var self = this;

    self.toggleSidenav = toggleSidenav;

    self.querySearchText = querySearchText;

    self.searchItemSelected = searchItemSelected;

    self.breadcrumb = $cacheFactory.get('drive').get('breadcrumb');

    $scope.$on('$routeChangeSuccess', function() {
      self.queryFormState = '';
      self.searchText = '';
    });

    function toggleSidenav() {
      $mdSidenav('sidenav').toggle();
    }

    function querySearchText(searchText) {
      var deferred = $q.defer();

      google.filesList({
        query: 'fullText contains \'' + searchText + '\' and trashed = false',
        maxResults: 30
      }).then(function(response) {
        deferred.resolve(response.data.items);
      }, deferred.reject);

      return deferred.promise;
    }

    function searchItemSelected() {
      if (!self.selectedItem) {
        return;
      }

      if (self.selectedItem.mimeType === google.mimeType.folder) {
        $location.url('/drive/folder/' + self.selectedItem.id);
      } else {
        $window.open(self.selectedItem.alternateLink);
      }
    }
  }

  function SidenavController($cacheFactory, google) {
    var self = this;

    self.menuList = $cacheFactory.get('sidenav').get('menuList');

    self.selectedMenu = self.menuList.filter(function(menu) {
      return menu.selected;
    })[0];

    self.onMenuSelect = onMenuSelect;

    google.about().success(function(data) {
      self.user = data.user;
    });

    function onMenuSelect(menu) {
      self.selectedMenu.selected = false;
      menu.selected = true;
      self.selectedMenu = menu;
    }
  }

  function DriveController($scope, $location, $routeParams, $filter, $window, $q, $mdDialog, $injector, $cacheFactory, notifier, google) {
    var self = this,
        driveCache = $cacheFactory.get('drive'),
        sidenavCache = $cacheFactory.get('sidenav');

    if (!driveCache) {
      driveCache = $cacheFactory('drive');
      driveCache.put('breadcrumb', []);
    }

    if (!sidenavCache) {
      var menuList = [{
        icon: 'fa fa-folder fa-lg',
        label: 'My Drive',
        href: '#drive/mydrive',
        index: 0
      }, {
        icon: 'fa fa-users fa-lg',
        label: 'Share with me',
        href: '#drive/incoming',
        index: 1
      }, {
        icon: 'fa fa-clock-o fa-lg',
        label: 'Recent',
        href: '#drive/recent',
        index: 2
      }, {
        icon: 'fa fa-star fa-lg',
        label: 'Starred',
        href: '#drive/starred',
        index: 3
      }, {
        icon: 'fa fa-trash fa-lg',
        label: 'Trash',
        href: '#drive/trash',
        index: 4
      }];

      sidenavCache = $cacheFactory('sidenav');
      switch ($routeParams.category) {
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

      sidenavCache.put('menuList', menuList);
    }

    self.selectedItemMap = {};

    self.currentFolder = {
      isRoot: true
    };

    self.contextMenuList = [{
      name: 'Make a copy',
      icon: 'content-copy',
      enabled: true
    }, {
      name: 'Move to',
      icon: 'folder-open',
      enabled: true
    }, {
      name: 'Remove',
      icon: 'delete',
      enabled: true
    }];

    self.breadcrumb = driveCache.get('breadcrumb');

    $scope.base.config = {
      useNavbar: true,
      useFab: true,
      useSidenav: true,
      fabTemplateUrl: 'app/drive/new-item-fab.tpl.html',
      navbarTemplateUrl: 'app/drive/navbar.tpl.html',
      sidenavTemplateUrl: 'app/drive/sidenav.tpl.html',
      ngViewClass: 'drive-body-container',
      navbarClass: self.breadcrumb && self.breadcrumb.length > 0 ? ' md-tall' : ''
    };

    self.onContextMenuPopup = onContextMenuPopup;
    self.onContextMenuSelected = onContextMenuSelected;
    self.onItemClicked = onItemClicked;
    self.onItemDoubleClicked = onItemDoubleClicked;
    self.upToParentFolder = upToParentFolder;

    notifier.addListener('newItem', {
      listener: self,
      callback: onCreateNewItem
    });

    notifier.addListener('upload', {
      listener: self,
      callback: onUploadFile
    });

    $scope.$on('$destroy', function() {
      notifier.removeListener('newItem', self);
      notifier.removeListener('upload', self);
    });

    init();

    function init() {
      var query = (google.query[$routeParams.category] || google.query.folder).replace('%s', $routeParams.itemId || 'root'),
          promises = [];

      promises.push(google.filesList({query: query}));
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

        if (self.currentFolder.isRoot) {
          self.breadcrumb.splice(0, self.breadcrumb.length);
          $scope.base.config.navbarClass = '';
        } else {
          $scope.base.config.ngViewClass += ' double-toolbar';
          $scope.base.config.navbarClass = ' md-tall';
          makeBreadcrumb();
        }

        angular.forEach(data.items, function(item) {
          if (item.mimeType === google.mimeType.folder) {
            folderList.push(item);
          } else {
            fileList.push(item);
          }
        });
        self.folderList = $filter('orderBy')(folderList, 'title');
        self.fileList = $filter('orderBy')(fileList, 'title');
      });
    }

    function makeBreadcrumb() {
      var breadcrumb = [self.currentFolder];
      var getParent = function(parent) {
        if (!parent || parent.isRoot) {
          self.breadcrumb.splice(0, self.breadcrumb.length);
          breadcrumb.reverse().forEach(function(item) {
            self.breadcrumb.push(item);
          });
        } else {
          google.filesGet(parent.id).success(function(data) {
            breadcrumb.push(data);
            getParent(data.parents[0]);
          });
        }
      };
      getParent(self.currentFolder.parents[0]);
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

      if (item.mimeType === google.mimeType.folder) {
        $location.url('/drive/folder/' + item.id);
      } else {
        $window.open(item.alternateLink);
      }
    }

    function upToParentFolder() {
      $location.url('/drive/folder/' + self.currentFolder.parents[0].id);
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
        init();
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
            $q.all(uploadPromises).then(function(responses) {
              $mdDialog.hide();
              emptySelectedItem();
              init();
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
      var promises = [];

      angular.forEach(self.selectedItemMap, function(item, itemId) {
        promises.push(google.duplicateFile({fileId: itemId}));
      });

      $q.all(promises).then(function() {
        emptySelectedItem();
        init();
      });
    }

    function trashFiles() {
      var confirm = $mdDialog.confirm().title('Will be removed').ok('Yes').cancel('Cancel'),
          content = '';

      angular.forEach(self.selectedItemMap, function(item, itemId) {
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
          init();
        });
      });
    }

    function moveToFiles() {
      $mdDialog.show({
        controller: 'NavigationDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/drive/navigation-dialog.tpl.html',
        bindToController: true,
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
          init();
        });
      });
    }
  }

  function NavigationDialogController($scope, $mdDialog, $injector) {
    var self = this,
        $q = $injector.get('$q'),
        $filter = $injector.get('$filter'),
        google = $injector.get('google');

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
        self.folderList = $filter('orderBy')(data.items, 'title');
      });
    }
  }

})();