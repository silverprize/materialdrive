(function(angular) {'use strict';

angular.module('materialDrive')
.controller('GateCtrl', ['$route', '$location', 'google', GateCtrl])
.controller('DriveCtrl', ['$scope', '$location', '$routeParams', '$filter', 'google', DriveCtrl]);

function GateCtrl($route, $location, google) {
  var vm = this;

  vm.authorize = authorize;

  function authorize() {
    google.authorize(false).then(function() {
      $location.url('/drive/mydrive');
    });
  }
}

function DriveCtrl($scope, $location, $routeParams, $filter, google) {
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
      default:
        vm.topMenuList[0].selected = true;
        query = 'trashed = false and \'root\' in parents';
        break;
    }

    google.getFileList(query).success(function(data) {
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
}

})(angular);