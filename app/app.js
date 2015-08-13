(function() {
  'use strict';

  angular.module('materialDrive')
  .config(SetupRoute)
  .config(SetupHttp);

  SetupRoute.$injector = ['$urlRouterProvider', '$stateProvider'];
  function SetupRoute($urlRouterProvider, $stateProvider) {
     var driveResolve = {
      google: ['$injector', function($injector) {
        var $q = $injector.get('$q'),
            $state = $injector.get('$state'),
            $location = $injector.get('$location'),
            google = $injector.get('google'),
            deferred = $q.defer();

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
      auth: ['$injector', function($injector) {
        var $q = $injector.get('$q'),
            $state = $injector.get('$state'),
            google = $injector.get('google');

        return google.prepareGapi().then(function(google) {
          return google.authorize(true).then(function() {
            $state.go('drive.category', {
              category: 'mydrive'
            });
          }, function() {
            return $q.when();
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
    $httpProvider.interceptors.push(['$injector', function($injector) {
      return {
        responseError: function(rejection) {
          var google = $injector.get('google'),
              $q = $injector.get('$q'),
              $state = $injector.get('$state');

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
