(function() {
  'use strict';

  // var CLIENT_ID = '627339111893-9us5a8ovdeovt4p8blm07hgjamu1i0np.apps.googleusercontent.com';
  var CLIENT_ID = '627339111893-b6jkfk9kqp489tkamgjjrlpuuj6lrurj.apps.googleusercontent.com';
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

  var FILES_LIST = 'https://www.googleapis.com/drive/v2/files';
  var FILES_GET = 'https://www.googleapis.com/drive/v2/files/fileId';

  var OAUTH_TOKEN;

  angular.module('materialDrive')
  .factory('google', [
    '$injector', '$q', '$interval',
    GoogleService
  ]);

  function GoogleService($injector, $q, $interval) {
    var $http = $injector.get('$http');
    var authData;
    return {
      prepareGapi: function() {
        var self = this;
        var deferred = $q.defer();
        if (!self.isReady()) {
          var interval = $interval(function() {
            if (self.isReady()) {
              $interval.cancel(interval);
              deferred.resolve(self);
            }
          }, 100);
        } else {
          deferred.resolve(self);
        }

        return deferred.promise;
      },
      isReady: function() {
        return angular.isDefined(gapi.auth);
      },
      authorize: function(immediate) {
        var deferred = $q.defer();
        this.prepareGapi().then(function() {
          gapi.auth.authorize({
            'client_id': CLIENT_ID,
            'scope': SCOPES,
            'immediate': angular.isDefined(immediate) ? immediate : false
          }, function(authResult) {
            if (authResult && authResult.access_token) {
              deferred.resolve(authResult);
            } else {
              deferred.reject();
            }
          });
        });

        return deferred.promise.then(function(authResult) {
          authData = authResult;
          OAUTH_TOKEN = {
            params: {'alt': 'json'},
            headers: {
              'Authorization': 'Bearer ' + authData.access_token,
              'GData-Version': '3.0'
            }
          };
        });
      },
      isAuthenticated: function() {
        return angular.isDefined(OAUTH_TOKEN);
      },
      filesList: function(query) {
        return $http.get(FILES_LIST + '?q=' + encodeURIComponent(query), OAUTH_TOKEN);
      },
      filesGet: function(fileId) {
        return $http.get(FILES_GET + '?fileId=' + encodeURIComponent(fileId), OAUTH_TOKEN);
      }
    };
  }

})();