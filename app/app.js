(function(angular) {'use strict';
angular.module('materialDrive')
.config(['$routeProvider', setupRoute])
.config(['$httpProvider', setupHttp]);

function setupRoute($routeProvider) {
  $routeProvider.when('/drive/:category', {
    templateUrl: 'app/tpls/drive.html',
    controller: 'DriveCtrl',
    controllerAs: 'vm',
    resolve: {
      google: ['google', function(google) {
        return google.prepare();
      }]
    }
  }).otherwise({
    templateUrl: 'app/tpls/gate.html',
    controller: 'GateCtrl',
    controllerAs: 'vm',
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
        $location.url('/');
        return $q.reject(rejection);
      }
    }
  }]);
}
})(angular);