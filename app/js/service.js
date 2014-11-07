(function() {'use strict';
var CLIENT_ID = '627339111893-9us5a8ovdeovt4p8blm07hgjamu1i0np.apps.googleusercontent.com';
// var CLIENT_ID = '627339111893-b6jkfk9kqp489tkamgjjrlpuuj6lrurj.apps.googleusercontent.com';
var SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

var FILE_LIST = 'https://www.googleapis.com/drive/v2/files';

var CONFIG;

angular.module('materialDrive')
.factory('google', ['$http', '$q', function($http, $q) {
  var inited = false;
  var deferred, authData;
  return {
    auth: function() {
      checkAuth(false);
      deferred = $q.defer()
      return deferred.promise.then(function(authResult) {
        authData = authResult;

        CONFIG = {
          params: {'alt': 'json'},
          headers: {
            'Authorization': 'Bearer ' + authData.access_token,
            'GData-Version': '3.0'
          }
        };
        return authData;
      });
    },
    inited: function() {
      return CONFIG;
    },
    getFileList: function(args) {
      var query = 'trashed = ' + (args.trashed || 'false') + ' and \''+ args.folder +'\' in parents';
      return $http.get(FILE_LIST + '?q=' + encodeURIComponent(query), CONFIG);
    }
  };

  function checkAuth(immediate) {
    gapi.auth.authorize({
      'client_id': CLIENT_ID,
      'scope': SCOPES,
      'immediate': angular.isDefined(immediate) ? immediate : false
    }, handleAuthResult);
  }

  function handleAuthResult(authResult) {
    deferred.resolve(authResult);
  }

}]);
})();