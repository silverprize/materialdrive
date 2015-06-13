(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('GateController', [
    '$scope',
    '$location',
    '$routeParams',
    'google',
    GateController
  ]);

  function GateController($scope, $location, $routeParams, google) {
    var self = this;

    self.authorize = authorize;

    function authorize() {
      google.authorize(false).then(function() {
        var redirect = $routeParams.redirect || '/drive/mydrive';
        $location.url(redirect);
      });
    }
  }
})();
