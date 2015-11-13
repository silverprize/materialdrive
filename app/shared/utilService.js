(function() {
  angular.module('materialDrive')
  .factory('Util', UtilService);

  function UtilService() {
    return {
      startsWith: function(src, prefix) {
        return src.length >= prefix.length && src.substring(0, prefix.length) === prefix;
      },
      offset: function(node) {
        var parentNode = node,
            top = 0,
            left = 0;

        while(typeof parentNode.offsetTop !== 'undefined') {
          top += parentNode.offsetTop;
          left += parentNode.offsetLeft;
          parentNode = parentNode.parentNode;
        }

        return {
          top: top,
          left: left
        };
      }
    };
  }
})();
