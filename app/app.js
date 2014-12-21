(function() {
  'use strict';

  angular.module('materialDrive')
  .config(['$routeProvider', setupRoute])
  .config(['$httpProvider', setupHttp]);

  function setupRoute($routeProvider) {
    $routeProvider.when('/drive/:category/:itemId?', {
      templateUrl: 'app/tpls/drive.tpl.html',
      controller: 'DriveCtrl',
      controllerAs: 'vm',
      resolve: {
        google: ['$injector', function($injector) {
          var $q = $injector.get('$q'),
              $location = $injector.get('$location'),
              google = $injector.get('google'),
              deferred = $q.defer();

          google.authorize(true).then(function() {
            deferred.resolve(google);
          }, function() {
            deferred.promise.then(null, function() {
              $location.url('/sign?redirect=' + $location.url());
            });
            deferred.reject();
          });
          return deferred.promise;
        }]
      }
    }).when('/sign', {
      templateUrl: 'app/tpls/gate.tpl.html',
      controller: 'GateCtrl',
      controllerAs: 'vm',
      resolve: {
        auth: ['$injector', function($injector) {
          var $q = $injector.get('$q'),
              $location = $injector.get('$location'),
              $routeParams = $injector.get('$routeParams'),
              google = $injector.get('google');

          return google.prepareGapi().then(function(google) {
            return google.authorize(true).then(function() {
              var redirect = $routeParams.redirect || '/drive/mydrive';
              $location.url(redirect);
            }, function() {
              var deferred = $q.defer();
              deferred.resolve();
              return deferred.promise;
            });
          }, function() {
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
          });
        }]
      }
    }).otherwise({
      redirectTo: function() {
        return '/drive/mydrive';
      }
    });
  }

  function setupHttp($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function($injector) {
      return {
        responseError: function(rejection) {
          var google = $injector.get('google');
          var $q = $injector.get('$q');
          var $location = $injector.get('$location');
          var $route = $injector.get('$route');
          if (rejection.status == 401) {
            google.authorize(true).then(function() {
              $route.reload();
            }, function() {
              $location.url('/');
            });
          }
          return $q.reject(rejection);
        }
      }
    }]);
  }
})();