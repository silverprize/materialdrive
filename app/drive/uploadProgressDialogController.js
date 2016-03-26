(function () {
  'use strict';

  angular.module('materialDrive')
    .controller('UploadProgressDialogController', ['$mdDialog', '$mdToast', 'google', 'fileList', 'currentFolder', UploadProgressDialogController]);

  function UploadProgressDialogController($mdDialog, $mdToast, google, fileList, currentFolder) {
    var self = this,
      countSucceed = 0;

    self.abort = abort;

    uploadFile();

    function abort() {
      if (!!self.current.promise) {
        fileList.length = 0;
        self.current.promise.abort();
      }

      if (countSucceed > 0) {
        $mdDialog.hide();
      } else {
        $mdDialog.cancel();
      }
    }

    function uploadFile() {
      var file = fileList.pop();
      self.current = {
        file: file,
        progress: 0
      };
      var promise = google.getUploadEndpoint({
        file: file,
        parents: currentFolder.isRoot ? '' : currentFolder
      }).then(function(response) {
        return {
          endPoint: response.headers().location,
          file: file
        };
      });

      promise = promise.then(function(data) {
        var promise = google.uploadFile({
          endpoint: data.endPoint,
          file: data.file
        }).progress(function(response) {
          self.current.progress = Math.min(100, Math.ceil(response.loaded / response.total * 100));
        });

        self.current.promise = promise;
        return promise;
      });

      promise.then(function() {
        $mdToast.show(
          $mdToast.simple()
            .textContent('To upload ' + self.current.file.name + ' was Successful!')
            .position('top right')
            .hideDelay(2000)
        );
        countSucceed++;
        if (fileList.length > 0) {
          uploadFile();
        } else {
          $mdDialog.hide();
        }
      });
    }
  }

}());