(function() {
  'use strict';

  angular.module('materialDrive')
  .controller('GateController', ['$scope', '$location', '$state', 'Google', GateController]);

  function GateController($scope, $location, $state, Google) {
    var self = this;

    self.authorize = authorize;

    function authorize() {
      Google.authorize(false).then(function() {
        var redirect = $state.params.redirect || '/drive/mydrive';
        $location.url(redirect);
      });
    }
  }
})();
