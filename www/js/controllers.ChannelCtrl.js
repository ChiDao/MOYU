define(['app', 'services.Api'], function(app)
{
  app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'Api', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$ionicPopup',
    function($scope, $stateParams, UI, Api, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout,$ionicPopup) {

      
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
            },
            getClips: {
              type: 'function',
              attr: 'clips',
              options: {
                last: true,
                itearator: {
                  userData: {
                    type: 'getData',
                    attr: 'user'
                  }
                }
              }
            }
          }
        }).then(function(){
          console.debug('$scope.channel:', $scope.channel);
          // get clips
          $scope.getClips = function(){
            return $scope.channel.getClips($scope, 'clips').then(function(){
              console.debug($scope.clips);
            });
          };
          $scope.getClips();

          // pull refresh
          $scope.doRefresh = function() {
            $scope.getClips().then(function(){
              console.debug("refreshComplete ")
              $scope.$broadcast('scroll.refreshComplete');
            });
          };//End of doRefresh

          $scope.newClip = function(openGameTime,orientation){
            Api.postModal($scope.channel.addClip, {}, {
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
                      scope.formData.img = returnJson;
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
            //上传事件终结，清楚缓存
            localStorage.removeItem('playGameId');
            localStorage.removeItem('playGameDt');
            localStorage.removeItem('playGameTm');
            console.log('localStorage' + localStorage.removeItem('playGameTm'));
          };//End of new clip

          //如果上传事件未结束，则打开clip模态框
          if (localStorage.getItem('playGameTm') !== null){
             var time = localStorage.getItem('playGameTm');
             var direct = localStorage.getItem('playGameDt');
             $scope.newClip(time,direct);
          }
        });//End of then function
      });

      
      

      $scope.playGame = function(){
        if($scope.channel.orientation == true){
          var direct = true;
        }else{
          var direct = false;
        }

        $scope.data = {};
        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
          template: '<input type="text" ng-model="data.time" placeholder="minute">',
          title: '游戏时间',
          subTitle: '亲，你要离开多久呢？',
          scope: $scope,
          buttons: [
            { text: '取消' },
            {
              text: '<b>确定</b>',
              type: 'button-positive',
              onTap: function(e) {
                if (!$scope.data.time) {
                  e.preventDefault();
                } else {
                  return $scope.data.time;
                }
              }
            }
          ]
        });
        myPopup.then(function(res) {
          console.log('Tapped!', res);
          if(res !== undefined){
            var now                  = new Date().getTime();
            var backDate = new Date(now + res *60000);

            console.log("现在"+new Date(now)+"离开"+backDate);
            var id = Math.random();
            //缓存信息，以登记截图上传事件
            localStorage.setItem('playGameTm',now);
            localStorage.setItem('playGameDt',direct);
            localStorage.setItem('playGameId',$stateParams.gameId);

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
                date:    backDate
              });
            }

            window.open($scope.channel.clientsData[0].url + '://');
          }          
        });        
      }
    }
  ]);
});
