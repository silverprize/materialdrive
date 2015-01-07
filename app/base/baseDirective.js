(function() {
  'use strict';

  angular.module('materialDrive')
  .directive('frame', [function($route, $location) {
    return {
      replace: true,
      templateUrl: 'app/base/frame.tpl.html',
    };
  }]);
})();