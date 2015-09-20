(function() {
  'use strict';

  angular.module('materialDrive')
  .config(SetupRoute)
  .config(SetupHttp);

  SetupRoute.$injector = ['$urlRouterProvider', '$stateProvider'];
  function SetupRoute($urlRouterProvider, $stateProvider) {
     var driveResolve = {
      google: ['$q', '$state', '$location', 'google', function($q, $state, $location, google) {
        var deferred = $q.defer();
        google.authorize(true).then(function() {
          deferred.resolve(google);
        }, function() {
          deferred.promise.then(null, function() {
            $state.go('gate.sign', {
              redirect: $location.url()
            });
          });
          deferred.reject();
        });
        return deferred.promise;
      }]
    }, gateResolve = {
      auth: ['$q', '$state', 'google', function($q, $state, google) {
        return google.prepareGapi().then(function(google) {
          return google.authorize(true).then(function() {
            $state.go('drive.category', {
              category: 'mydrive'
            });
          }, function() {
            return $q.resolve();
          });
        });
      }]
    };

    $urlRouterProvider
    .otherwise('/drive/mydrive');

    $stateProvider
    .state('gate', {
      url: '',
      templateUrl: 'app/gate/gate.tpl.html',
      controller: 'GateController as gateCtrl',
      resolve : gateResolve
    })
    .state('gate.sign', {
      url: '/sign?redirect',
      templateUrl: 'app/gate/gate.tpl.html',
      controller: 'GateController as gateCtrl',
      resolve : gateResolve
    })
    .state('drive', {
      url: '/drive',
      templateUrl: 'app/drive/drive.tpl.html',
      controller: 'DriveController as driveCtrl',
      resolve: driveResolve
    })
    .state('drive.category', {
      url: '/:category',
      templateUrl: 'app/drive/drive-list.tpl.html',
      controller: ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.driveCtrl.init($stateParams);
      }]
    })
    .state('drive.folder', {
      url: '/folder/:folderId',
      templateUrl: 'app/drive/drive-list.tpl.html',
      controller: ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.driveCtrl.init($stateParams);
      }]
    });
  }

  SetupHttp.$injector = ['$httpProvider'];
  function SetupHttp($httpProvider) {
    $httpProvider.interceptors.push(['$injector', '$q', function($injector, $q) {
      return {
        responseError: function(rejection) {
          var $state = $injcetor.get('$state'),
            google = $injcetor.get('google');

          if (rejection.status === 401) {
            google.authorize(true).then(function() {
              $state.reload();
            }, function() {
              $state.go('gate');
            });
          }
          return $q.reject(rejection);
        }
      };
    }]);
  }
})();
