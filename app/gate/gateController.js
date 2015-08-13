(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('GateController', GateController);

  GateController.$injector = ['$scope', '$location', '$state', 'google'];
  function GateController($scope, $location, $state, google) {
    var self = this;

    self.authorize = authorize;

    function authorize() {
      google.authorize(false).then(function() {
        var redirect = $state.params.redirect || '/drive/mydrive';
        $location.url(redirect);
      });
    }
  }
})();
