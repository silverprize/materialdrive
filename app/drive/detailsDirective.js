(function() {
  'use strict';

  angular.module('materialDrive')
    .directive('mtdDetails', [MtdDetails]);

  function MtdDetails() {
    return {
      restrict: 'EA',
      scope: {
        item: '=mtdDetailsItem'
      },
      templateUrl: 'app/drive/details.tpl.html',
      controller: ['$scope', '$mdSidenav', '$mdMedia', '$cacheFactory',
           function($scope,   $mdSidenav,   $mdMedia,   $cacheFactory) {
        if (!!($mdMedia('gt-md') && $cacheFactory.get('details').get('visible'))) {
          $mdSidenav('details').open();
        } else {
          $mdSidenav('details').close();
        }
      }],
      controllerAs: 'detailsCtrl'
    };
  }

})();
