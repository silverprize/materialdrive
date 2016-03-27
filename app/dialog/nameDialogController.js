(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('NameDialogController', ['$scope', '$mdDialog', NameDialogController]);

  function NameDialogController($scope, $mdDialog) {
    var self = this;

    $scope.ok = function() {
      $mdDialog.hide(self.fileName);
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  }

}());