(function(angular) {'use strict';
  angular.module('materialDrive')
  .controller('GateCtrl', ['$route', '$location', 'google', GateCtrl])
  .controller('DriveCtrl', ['$routeParams', 'google', DriveCtrl]);

  function GateCtrl($route, $location, google) {
    var gate = this;
    gate.auth = function() {
      google.auth().then(function(authResult) {
        if (authResult) {
          $location.url('/drive/mydrive');
        }
      });
    };
  }

  function DriveCtrl($routeParams, google) {
    var drive = this;

    init();

    function init() {
      drive.topFolder = {};
      var folder;
      switch ($routeParams.folder) {
        case 'incoming':
          drive.topFolder.selectedIndex = 1;
          break;
        case 'recent':
          drive.topFolder.selectedIndex = 2;
          break;
        case 'starred':
          drive.topFolder.selectedIndex = 3;
          break;
        case 'trash':
          drive.topFolder.selectedIndex = 4;
          break;
        default:
          drive.topFolder.selectedIndex = 0;
          folder = 'root';
          break;
      }

      google.getFileList({
        folder: folder
      }).success(function(data) {
        drive.fileList = data.items;
      });
    }
  }
})(angular);