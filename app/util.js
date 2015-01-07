var Util = (function() {
  return {
    startsWith: function(src, prefix) {
      return src.length >= prefix.length && src.substring(0, prefix.length) === prefix;
    }
  };
})();