(function(angular) {'use strict';
angular.module('materialDrive')
.config(['$routeProvider', setupRoute])
.config(['$httpProvider', setupHttp]);

function setupRoute($routeProvider) {
  $routeProvider.when('/drive/:folder', {
    templateUrl: 'app/tpls/drive.html',
    controller: 'DriveCtrl',
    controllerAs: 'drive',
    resolve: {
      google: ['google', function(google) {
        return google.prepare();
      }]
    }
  }).otherwise({
    templateUrl: 'app/tpls/gate.html',
    controller: 'GateCtrl',
    controllerAs: 'gate',
    resolve: {
      auth: ['google', function(google) {
        return google.prepare();
      }]
    }
  });
}

function setupHttp($httpProvider) {
  $httpProvider.interceptors.push(['$q', '$location', function($q, $location) {
    return {
      responseError: function(rejection) {
        $location.path('/');
        return $q.reject(rejection);
      }
    }
  }]);
}
})(angular);