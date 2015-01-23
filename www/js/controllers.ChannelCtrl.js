define(['app', 'services.RestRoute', 'services.Modal'], function(app)
{
  app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', 'Restangular', 
    function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout, Restangular) {

      // pull refresh
      $scope.doRefresh = function() {
        $scope.getClips().then(function(){
          $scope.$broadcast('scroll.refreshComplete');
        });
      };
      
      //
      $scope.$on("$ionicView.afterEnter", function() {
        var tmp = {};
        RestRoute.getLinkData('/game/' + $stateParams.channelId, $scope, 'channel').then(function(){
          RestRoute.getLinkData($scope.channel.clients, tmp, 'client').then(function(){
            RestRoute.getLinkData(tmp.client.last, tmp, 'clientsData').then(function(){
              $scope.channel.clientsData = tmp.clientsData[0];
              console.debug('$scope.channel:', $scope.channel.clientsData);
            });
          });
        });
      });

      // get clips
      $scope.getClips = function(){
        return RestRoute.getLinkData('/game-clips/' + $stateParams.channelId + '?_last', $scope, 'clips').then(function(){
          _.forEach($scope.clips, function(clip){
            console.debug($scope.clips);
            RestRoute.getLinkData(clip.user, clip, 'userData').then(function(){
              console.log(clip.userData);
            });
          })
        });
      };
      $scope.getClips();
      $scope.newClip = function(){
        RestRoute.postModal('/new-clip/' + $stateParams.channelId, {}, {
          init: function(scope){
            // var
            scope.imageURI = 'img/upload-photo.png';
            console.log($scope.imageURI);
            scope.formData = {};
            scope.getPicture = function(){
              navigator.camera.getPicture(onSuccess, onFail, { 
                quality: 50, 
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM  
              }); 

              function onSuccess(imageURI) {
                var image = document.getElementById('newPostImage');
                image.src = imageURI;
                scope.imageURI = imageURI;
              }

              function onFail(message) {
                alert('Failed because: ' + message);
              }
            }
          },
          onOk: function(form, scope){
            return Thenjs(function(defer){
              var win = function (r) {
                  console.log("Code = " + r.responseCode);
                  console.log("Response = " + r.response);
                  console.log("Sent = " + r.bytesSent);
                  var returnJson = JSON.parse(r.response);
                  scope.formData.img = returnJson['294@2x'];
                  defer(undefined);
              };

              var fail = function (error) {
                  alert("An error has occurred: Code = " + JSON.stringify(error));
                  console.log("upload error source " + error.source);
                  console.log("upload error target " + error.target);
                  defer("Upload image error");
              };

              var options = new FileUploadOptions();
              options.fileKey = "file";
              options.fileName = scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1);
              console.log("fileName:" + scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1));
              options.mimeType = "image/jpeg";
              //options.Authorization = "Basic emFra3poYW5nejgyMTE1MzY0"

              var ft = new FileTransfer();
              //Restangular.configuration.baseUrl
              ft.upload(scope.imageURI, encodeURI("http://42.120.45.236:8485/upload"), win, fail, options);
            });
          },
          onSuccess: function(form, scope){
            $scope.getClips();
            scope.hideModal();
          }
        })
      };

      $scope.playGame = function(){
        var now                  = new Date().getTime(),
        _60_seconds_from_now = new Date(now + 5*1000);
        var id = Math.random();

        if (window.plugin && window.plugin.notification && window.plugin.notification.local){
          window.plugin.notification.local.onclick = function(id, state, json){
            $scope.newClip();
          }
          window.plugin.notification.local.add({
            id:      id,
            title:   'Reminder',
            message: 'Dont forget to buy some flowers.',
            repeat:  'secondly',
            date:    _60_seconds_from_now
          });
        }

        window.open($scope.channel.clientsData.url + '://');
      }
    }
  ]);
});
