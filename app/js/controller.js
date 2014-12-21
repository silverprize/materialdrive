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
    'google',
    DriveCtrl])
  .controller('GridBottomSheetCtrl', [
    '$scope',
    '$mdBottomSheet',
    GridBottomSheetCtrl]);

  function GateCtrl($location, $routeParams, google) {
    var vm = this;

    vm.authorize = authorize;

    function authorize() {
      google.authorize(false).then(function() {
        var redirect = $routeParams.redirect || '/drive/mydrive';
        $location.url(redirect);
      });
    }
  }

  function DriveCtrl($location, $routeParams, $filter, $window, $q, $mdBottomSheet, google) {
    var vm = this;

    vm.topMenuList = [{
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

    vm.clickItem = clickItem;

    vm.upToParentFolder = upToParentFolder;

    vm.showNewMenu = showNewMenu;

    init();

    function init() {
      vm.topFolder = {};
      var query;
      switch ($routeParams.category) {
        case 'incoming':
          vm.topMenuList[1].selected = true;
          query = 'trashed = false and not \'me\' in owners and sharedWithMe';
          break;
        case 'recent':
          vm.topMenuList[2].selected = true;
          query = '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false';
          break;
        case 'starred':
          vm.topMenuList[3].selected = true;
          query = 'trashed = false and starred = true';
          break;
        case 'trash':
          vm.topMenuList[4].selected = true;
          query = 'trashed = true and explicitlyTrashed = true';
          break;
        case 'folder':
          query = 'trashed = false and \'' + $routeParams.itemId + '\' in parents';
          break;
        default:
          vm.topMenuList[0].selected = true;
          query = 'trashed = false and \'root\' in parents';
          break;
      }

      var promises = [];
      if ($routeParams.itemId) {
        promises.push(google.filesGet($routeParams.itemId));
      }
      promises.push(google.filesList(query));

      $q.all(promises).then(function(responses) {
        var data;
        if (responses.length == 2) {
          vm.parentFolder = responses[0].data.parents[0];
          data = responses[1].data;
        } else {
          data = responses[0].data;
        }

        vm.folderList = [];
        vm.fileList = [];
        angular.forEach(data.items, function(item) {
          if (item.mimeType == 'application/vnd.google-apps.folder') {
            vm.folderList.push(item);
          } else {
            vm.fileList.push(item);
          }
        });
        vm.folderList = $filter('orderBy')(vm.folderList, 'title');
        vm.fileList = $filter('orderBy')(vm.fileList, 'title');
      });
    }

    function clickItem(item) {
      if (item.labels.trashed) {
        return;
      }

      if (item.mimeType == 'application/vnd.google-apps.folder') {
        $location.url('/drive/folder/' + item.id);
      } else {
        $window.open('https://docs.google.com/file/d/' + item.id);
      }
    }

    function upToParentFolder() {
      $location.url('/drive/folder/' + vm.parentFolder.id);
    }

    function showNewMenu($event) {
      $mdBottomSheet.show({
        templateUrl: 'app/tpls/new-menu-list.tpl.html',
        controller: 'GridBottomSheetCtrl',
        controllerAs: 'vm',
        targetEvent: $event
      }).then(function(clickedItem) {
        $scope.alert = clickedItem.name + ' clicked!';
      });
    }
  }

  function GridBottomSheetCtrl($scope, $mdBottomSheet) {
    var vm = this;

    vm.items = [{
      name: 'Document',
      icon: {
        class: 'fa-file-word-o',
        bg: 'file-word-bg'
      }
    }, {
      name: 'Spreadsheet',
      icon: {
        class: 'fa-file-excel-o',
        bg: 'file-spreadsheet-bg'
      }
    }, {
      name: 'Presentation',
      icon: {
        class: 'fa-file-powerpoint-o',
        bg: 'file-presentation-bg'
      }
    }];

    vm.listItemClick = function($index) {
      var clickedItem = vm.items[$index];
      $mdBottomSheet.hide(clickedItem);
    };
  }

})();