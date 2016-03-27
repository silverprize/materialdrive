(function() {
  'use strict';

  angular.module('materialDrive')
    .directive('mtdFocus', ['$timeout', MtdFocus]);

  function MtdFocus($timeout) {
    return {
      link: function(scope, elem, attrs) {
        attrs.$observe('mtdFocus', function(newValue) {
          if (!!newValue) {
            $timeout(function() {
              elem.find('input').focus();
            });
          }
        });
      }
    };
  }

}());