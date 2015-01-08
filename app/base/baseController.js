(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('BaseController', [
    '$scope',
    BaseController
  ]);

  function BaseController($scope, $window, $q, $mdBottomSheet, $mdDialog, google) {
    $scope.base = {
      config: {}
    };
  }

})();