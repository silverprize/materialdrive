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

var OAUTH_TOKEN;

angular.module('materialDrive')
.factory('google', [
  '$http', '$q', '$interval', '$location', '$routeParams',
  GoogleService
]);

function GoogleService($http, $q, $interval, $location, $routeParams) {
  var authData;
  return {
    prepare: function() {
      var self = this;
      var deferred = $q.defer();
      var promise = deferred.promise;

      var interval = $interval(function() {
        if (self.isReady()) {
          $interval.cancel(interval);
          deferred.resolve(self);
          promise.then(function(google) {
            google.authorize(true).then(function() {
              $location.url('/drive/' + ($routeParams.category || 'mydrive'));
            });
            return self;
          });
        }
      }, 100);

      return promise;
    },
    isReady: function() {
      return angular.isDefined(gapi.auth);
    },
    authorize: function(immediate) {
      var deferred = $q.defer();

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
      return OAUTH_TOKEN;
    },
    getFileList: function(query) {
      return $http.get(FILE_LIST + '?q=' + encodeURIComponent(query) + '&sortBy=FOLDERS_FIRST&secondarySortBy=LAST_MODIFIED', OAUTH_TOKEN);
    },
  };
}

})();