define(['app', 'services.Api'], function(app)
{
  app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'Api',
    '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$ionicPopup',
    '$ionicLoading','upyun', 'Modal',
    function($scope, $stateParams, UI, Api,
      $ionicFrostedDelegate, $ionicScrollDelegate, $timeout,$ionicPopup,
      $ionicLoading,upyun,Modal) {

      //
      $scope.$on("$ionicView.afterEnter", function() {
        var tmp = {};
        $ionicLoading.show();
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
        }).then(function(defer){
          console.debug('$scope.channel:', $scope.channel);
          // get clips
          var bindStruct = Api.bindList($scope.channel.clips, $scope, 'clips', {
            last: true,
            itearator: {
              userData: {
                type: 'getData',
                attr: 'user',
                options:{
                  last: true,
                  itearator: {
                    profile: {
                      type: 'getData',
                      attr: 'profile'
                    }
                  }
                }
              }
            }
          });
          bindStruct.init().then(function(defer){
            console.debug($scope.clips[0].userData);
            // pull refresh
            $scope.doRefresh = function() {
              console.debug(11111111)
              bindStruct.refresh().then(function(defer){
                $scope.$broadcast('scroll.refreshComplete');
                $scope.hasMore = bindStruct.moreData.length;
              }, function(defer){
                $scope.$broadcast('scroll.refreshComplete');
                $scope.hasMore = bindStruct.moreData.length;
              })
            };
            $scope.loadMore = function() {
              bindStruct.more().then(function(defer){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.hasMore = bindStruct.moreData.length;
              }, function(defer){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.hasMore = bindStruct.moreData.length;
              })
            };
          })//End of bindStruct.init()

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
                // scope.yupload = function() {
                //    console.log('正在开始上传...');
                //   upyun.upload('uploadForm', function(err, response, image){
                //     if (err) return console.error(err);
                //     console.log(response);
                //     console.log(image);
                //     if (image.code === 200 && image.message === 'ok') {
                //                 scope.image = {};
                //                 scope.image.ready = true;
                //                 scope.image.url = image.absUrl;
                //               }
                //               // scope.$apply();
                //   });
                // }
              },
              onOk: function(form, scope){
                return Thenjs(function(defer){
                  // console.log('正在开始上传...');
                  // upyun.upload('newPostForm',scope.imageURI, function(err, response, image){
                  //   if (err) console.error(err);
                  //   console.log('返回信息：');
                  //   console.log(response);
                  //   console.log('图片信息：');
                  //   console.log(image);
                  //   if (image.code === 200 && image.message === 'ok') {
                  //     scope.imageURI = image.absUrl;
                  //     scope.formData.img = image.absUrl;
                  //     defer(undefined);
                  //   }
                  //   scope.$apply();
                  // });
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
                  // options.fileKey = "file";
                  // options.fileName = scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1);
                  // console.log("fileName:" + scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1));
                  // options.mimeType = "image/jpeg";
                  //options.Authorization = "Basic emFra3poYW5nejgyMTE1MzY0"
                  options.Authorization="Basic IRoTyNc75husfQD24cq0bNmRSDI=";

                  var ft = new FileTransfer();
                  ft.upload(scope.imageURI, encodeURI("http://v0.api.upyun.com/upyun-form"), win, fail, options);
                });
              },
              onSuccess: function(form, scope){
                // $scope.doRefresh();
                scope.hideModal();
              }
            })//End of postModal
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

          defer(undefined);
        }, function(defer, error){
          defer(error)
        }).fin(function(){
          $ionicLoading.hide();
        });//End of then function
      });

      $scope.startGame = function(){
        Modal.okCancelModal('templates/modal-HowToScreen.html', {
          animation:'fade-in'
        }, {
          init: function(scope){

            var deviceInformation = ionic.Platform.device();
            scope.deviceImage = 'iphone5s';

            switch(deviceInformation) {
              case 'iPod1,1':
              case 'iPod2,1':
              case 'iPod3,1':
              case 'iPod4,1':
                scope.deviceImage = 'ipodtouch';
                break;
              case 'iPhone3,1':
              case 'iPhone3,2':
              case 'iPhone3,3':
              case 'iPhone4,1':
                scope.deviceImage = 'iphone4';
                break;
              case 'iPhone5,1':
              case 'iPhone5,2':
                scope.deviceImage = 'iphone5';
                break;
              case 'iPhone5,3':
              case 'iPhone5,4':
                scope.deviceImage = 'iphone5c';
                break;
              case 'iPhone6,1':
              case 'iPhone6,2':
                scope.deviceImage = 'iphone5s';
                break;
              case 'iPhone7,1':
                scope.deviceImage = 'iphone6p';
                break;
              case 'iPhone7,2':
                scope.deviceImage = 'iphone6';
                break;
            }

            scope.modalStep = 'trySnapshot';
            scope.shownHowToSnapshot = "null"
            // scope.shownHowToSnapshot = localStorage.getItem('shownHowToSnapshot');
            // if (scope.shownHowToSnapshot === null){
            //   scope.modalStep = 'trySnapshot';
            //   localStorage.setItem('shownHowToSnapshot', true);
            // } else {
            //   scope.modalStep = 'task'
            // }
            scope.formData = {selectedTask:undefined};
            scope.nextStepFunction = {
              trySnapshot: function(){
                scope.modalStep = 'task'
                Api.getData($scope.channel.tasks, scope, 'tasks', {
                  last:true
                }).then(function(defer, tasks){
                  scope.formData.selectedTask = tasks?tasks[0]._id:undefined;
                })
              },
              task: function(){
                $scope.selectedTask = scope.formData.selectedTask;
                console.debug(scope.formData.selectedTask);
                scope.modalStep = 'playGame';
                $scope.playGame();
              }
            }
            scope.next = function(){
              console.debug(scope.modalStep);
              scope.nextStepFunction[scope.modalStep]();
            }
          }
        })
      }//End of startGame


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

            window.open(_.result(_.find($scope.channel.clientsData,{'platform': 'ios'}), 'url') + '://');
          }
        });
      }//End of playGame
      $scope.startGame();
    }
  ]);
});
