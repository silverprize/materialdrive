(function(angular) {'use strict';

angular.module('materialDrive')
.controller('GateCtrl', ['$route', '$location', 'google', GateCtrl])
.controller('DriveCtrl', ['$scope', '$location', '$routeParams', 'google', DriveCtrl]);

function GateCtrl($route, $location, google) {
  var gate = this;

  gate.auth = function() {
    google.authorize(false).then(function() {
      $location.url('/drive/mydrive');
    });
  };
}

function DriveCtrl($scope, $location, $routeParams, google) {
  var drive = this;

  drive.changeTopFolder = changeTopFolder;

  init();

  function init() {
    drive.topFolder = {};
    var query;
    switch ($routeParams.folder) {
      case 'incoming':
        drive.topFolder.selectedIndex = 1;
        query = 'trashed = false and not \'me\' in owners and sharedWithMe';
        break;
      case 'recent':
        drive.topFolder.selectedIndex = 2;
        query = '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false';
        break;
      case 'starred':
        drive.topFolder.selectedIndex = 3;
        query = 'trashed = false and starred = true';
        break;
      case 'trash':
        drive.topFolder.selectedIndex = 4;
        query = 'trashed = true and explicitlyTrashed = true';
        break;
      default:
        drive.topFolder.selectedIndex = 0;
        query = 'trashed = false and \'root\' in parents';
        break;
    }

    google.getFileList(query).success(function(data) {
      drive.fileList = data.items;
    });
  }

  function changeTopFolder(alias) {
    $location.path('/drive/' + alias);
  }
}

})(angular);