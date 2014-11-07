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
      google: ['$q', '$location', 'google', function($q, $location, google) {
        var deferred = $q.defer();
        if (google.inited()) {
          deferred.resolve(google);
        } else {
          deferred.reject();
          $location.url('/');
        }
        return deferred.promise;
      }]
    }
  }).otherwise({
    templateUrl: 'app/tpls/gate.html',
    controller: 'GateCtrl',
    controllerAs: 'gate'
  });
}

function setupHttp($httpProvider) {
  $httpProvider.interceptors.push(function() {
    return {
      'request': function(config) {
        console.log(config);
        return config;
      },
      'response': function(response) {
        console.log(response);
        return response;
      }
    }
  });
}
})(angular);