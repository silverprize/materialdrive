(function() {
  'use strict';

  var CLIENT_ID = '627339111893-9us5a8ovdeovt4p8blm07hgjamu1i0np.apps.googleusercontent.com',
  // var CLIENT_ID = '627339111893-b6jkfk9kqp489tkamgjjrlpuuj6lrurj.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.apps.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      API = {
        FILES_LIST: 'https://www.googleapis.com/drive/v2/files',
        FILES_GET: 'https://www.googleapis.com/drive/v2/files/fileId',
        INSERT_FILE: 'https://www.googleapis.com/upload/drive/v2/files',
        INSERT_METADATA: 'https://www.googleapis.com/drive/v2/files',
        FILES_COPY: 'https://www.googleapis.com/drive/v2/files/%s/copy',
        FILES_DELETE: 'https://www.googleapis.com/drive/v2/files/%s',
        FILES_TRASH: 'https://www.googleapis.com/drive/v2/files/%s/trash',
        FILES_PATCH: 'https://www.googleapis.com/drive/v2/files/%s'
      },
      OAUTH_TOKEN;

  angular.module('materialDrive')
  .factory('google', [
    '$injector',
    '$q',
    '$interval',
    'query',
    'mimeType',
    GoogleService
  ])
  .constant('query', {
    incoming: 'trashed = false and not \'me\' in owners and sharedWithMe',
    recent: '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false',
    starred: 'trashed = false and starred = true',
    trash: 'trashed = true and explicitlyTrashed = true',
    folder: 'trashed = false and \'%s\' in parents'
  })
  .constant('mimeType', {
    folder : 'application/vnd.google-apps.folder'
  });

  function GoogleService($injector, $q, $interval, query, mimeType) {
    var $http = $injector.get('$http'),
        authData;

    return {
      prepareGapi: function() {
        var self = this,
            deferred = $q.defer();

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
      mimeType: mimeType,
      query: query,
      filesList: function(query, mimeType) {
        query = encodeURIComponent(query);
        if (mimeType) {
          query = [query, ' and mimeType = \'', mimeType, '\''].join('');
        }
        return $http.get([API.FILES_LIST, '?q=', query].join(''), OAUTH_TOKEN);
      },
      filesGet: function(fileId) {
        return $http.get([API.FILES_GET , '?fileId=', encodeURIComponent(fileId)].join(''), OAUTH_TOKEN);
      },
      newFile: function(args) {
        return $http.post(
          API.INSERT_METADATA, {
            title: args.title,
            mimeType: args.mimeType,
            parents: args.parents ? [args.parents] : ''
          },
          OAUTH_TOKEN
        );
      },
      duplicateFile: function(args) {
        return $http.post(API.FILES_COPY.replace('%s', args.fileId), null, OAUTH_TOKEN);
      },
      moveToTrash: function(args) {
        return $http.post(API.FILES_TRASH.replace('%s', args.fileId), null, OAUTH_TOKEN);
      },
      moveTo: function(args) {
        return $http.patch([
          API.FILES_PATCH.replace('%s', args.fileId),
          '?addParents=', args.toFolderId,
          '&removeParents=', args.fromFolderId
        ].join(''),
        null,
        OAUTH_TOKEN);
      }
    };
  }

})();