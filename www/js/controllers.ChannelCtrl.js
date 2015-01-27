define(['app', 'services.Api'], function(app)
{
  app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'Api', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', 
    function($scope, $stateParams, UI, Api, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout) {

      // pull refresh
      $scope.doRefresh = function() {
        $scope.getClips().then(function(){
          $scope.$broadcast('scroll.refreshComplete');
        });
      };
      
      //
      $scope.$on("$ionicView.afterEnter", function() {
        var tmp = {};
        Api.getData(Api.getStateUrl(), $scope, 'channel', {
          itearator: {
            clientsData: {
              type: 'getData',
              attr: 'clients',
              options: {
                last: true
              }
            }
          }
        }).then(function(){
              console.debug('$scope.channel:', $scope.channel.clientsData);
        });
      });

      // get clips
      $scope.getClips = function(){
        return Api.getData('/game-clips/' + $stateParams.gameId + '?_last', $scope, 'clips').then(function(){
          _.forEach($scope.clips, function(clip){
            console.debug($scope.clips);
            Api.getData(clip.user, clip, 'userData').then(function(){
              console.log(clip.userData);
            });
          })
        });
      };
      $scope.getClips();
      $scope.newClip = function(openGameTime,orientation){
        Api.postModal('/new-clip/' + $stateParams.gameId, {}, {
          init: function(scope){
            // var
            console.log("时间："+openGameTime);
            console.log("方向："+orientation);
            scope.imageURI = 'img/upload-photo.png';
            console.log(scope.imageURI);
            scope.formData = {};
            scope.getPicture = function(){
              navigator.camera.getScreenShot(onSuccess, onFail, { 
                date: openGameTime,
                orientation:orientation
              }); 

              function onSuccess(imageURI) {
                var image = document.getElementById('newPostImage');
                image.src = imageURI;
                scope.imageURI = imageURI;
                console.log("成功截图");
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
        if($scope.channel.orientation == true){
          var direct = true;
        }else{
          var direct = false;
        }
        var now                  = new Date().getTime(),
        _60_seconds_from_now = new Date(now + 5*1000);
        var id = Math.random();

        if (window.plugin && window.plugin.notification && window.plugin.notification.local){

          //返回应用时取消对应的推送并开启截图上传页
          document.addEventListener("resume", openNewClip, false);
                            
          function openNewClip() {
            $scope.newClip(now,direct);

            window.plugin.notification.local.cancel(id,function () {
              console.log("已取消");
            }, $scope);
            
            document.removeEventListener("resume",openNewClip,false); //删除返回监听事件
            return;
          }

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
