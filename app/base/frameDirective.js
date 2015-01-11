(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('mtdFrame', [function($route, $location) {
    return {
      replace: true,
      templateUrl: 'app/base/frame.tpl.html',
    };
  }]);
})();