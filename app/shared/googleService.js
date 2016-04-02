(function() {
  'use strict';

  var CLIENT_ID = '608120956255-0me03edqv60mf1eilgdjoum9qcmv4deq.apps.googleusercontent.com',
      SCOPES = [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.apps.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      API = {
        ABOUT: 'https://www.googleapis.com/drive/v2/about',
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
  .factory('google', ['$http', '$q', '$interval', 'Upload', 'query', 'mimeType', GoogleService])
  .constant('query', {
    incoming: 'trashed = false and not \'me\' in owners and sharedWithMe',
    recent: '(not mimeType = \'application/vnd.google-apps.folder\') and lastViewedByMeDate > \'1970-01-01T00:00:00Z\' and trashed = false',
    starred: 'trashed = false and starred = true',
    trash: 'trashed = true and explicitlyTrashed = true',
    folder: 'trashed = false and \'%s\' in parents',
    fullText: 'trashed = false and fullText contains \'%s\''
  })
  .constant('mimeType', {
    folder : 'application/vnd.google-apps.folder',
    document: 'application/vnd.google-apps.document',
    spreadsheet: 'application/vnd.google-apps.spreadsheet',
    presentation: 'application/vnd.google-apps.presentation'
  });

  function GoogleService($http, $q, $interval, Upload, query, mimeType) {
    var authData;

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
          var authorize = function() {
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
          };

          if (!authData) {
            authorize();
          } else {
            gapi.auth.checkSessionState({
              'client_id': CLIENT_ID,
              'session_state': null
            }, function(result) {
              if (result) {
                deferred.resolve(authData);
              } else {
                authorize();
              }
            });
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
        return angular.isDefined(OAUTH_TOKEN);
      },
      mimeType: mimeType,
      query: query,
      about: function() {
        return $http.get(API.ABOUT, angular.copy(OAUTH_TOKEN));
      },
      filesList: function(args) {
        var query = '?q=' + encodeURIComponent(args.query);

        if (args.mimeType) {
          query += ' and mimeType = \'' + args.mimeType + '\'';
        }

        if (args.pageToken) {
          query += '&pageToken=' + encodeURIComponent(args.pageToken);
        }

        if (args.maxResults) {
          query += '&maxResults=' + args.maxResults;
        }

        if (args.orderBy) {
          query += '&orderBy=' + args.orderBy;
        }

        return $http.get(API.FILES_LIST + query, angular.copy(OAUTH_TOKEN));
      },
      filesGet: function(fileId) {
        return $http.get([API.FILES_GET , '?fileId=', encodeURIComponent(fileId)].join(''), angular.copy(OAUTH_TOKEN));
      },
      newFile: function(args) {
        return $http.post(
          API.INSERT_METADATA, {
            title: args.title,
            mimeType: args.mimeType,
            parents: args.parents ? [args.parents] : ''
          },
          angular.copy(OAUTH_TOKEN)
        );
      },
      getUploadEndpoint: function(args) {
        return $http({
          url: API.INSERT_FILE.concat('?uploadType=resumable'),
          method: 'POST',
          headers: OAUTH_TOKEN.headers,
          data: {
            title: args.file.fileName || args.file.name,
            mimeType: args.file.type || 'application/octet-stream',
            parents: args.parents ? [args.parents] : ''
          }
        });
      },
      uploadFile: function (args) {
        var offset = 0,
            end = args.file.size;

        return Upload.http({
          url: args.endpoint,
          method: 'PUT',
          headers: angular.extend({
            'Content-Range': ['bytes ', offset, '-', (end - 1), '/', args.file.size].join(''),
            'X-Upload-Content-Type': args.file.type
          }, OAUTH_TOKEN.headers),
          data: args.file.slice(offset, end)
        });
      },
      duplicateFile: function(args) {
        return $http.post(API.FILES_COPY.replace('%s', args.fileId), null, angular.copy(OAUTH_TOKEN));
      },
      moveToTrash: function(args) {
        return $http.post(API.FILES_TRASH.replace('%s', args.fileId), null, angular.copy(OAUTH_TOKEN));
      },
      moveTo: function(args) {
        return $http.patch([
          API.FILES_PATCH.replace('%s', args.fileId),
          '?addParents=', args.toFolderId,
          '&removeParents=', args.fromFolderId
        ].join(''),
        null,
        angular.copy(OAUTH_TOKEN));
      }
    };
  }

})();
