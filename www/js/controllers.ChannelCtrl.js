define(['app', 'services.Api'], function(app)
{
  app.controller('ChannelCtrl', ['$rootScope', '$scope', '$stateParams', 'UI', 'Api',
    '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$ionicPopup',
    '$ionicLoading','upyun', 'Modal','$ionicSlideBoxDelegate','Auth','$state',
    function($rootScope, $scope, $stateParams, UI, Api,
      $ionicFrostedDelegate, $ionicScrollDelegate, $timeout,$ionicPopup,
      $ionicLoading,upyun,Modal,$ionicSlideBoxDelegate,Auth,$state) {

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
          if (typeof(appAvailability) !== 'undefined'){
            appAvailability.check(
              $scope.channel.clientsData[0].url + "://", 
              function() {  
                $scope.channel.installed = true;
              },
              function() {  
                $scope.channel.installed = false;
              }
            );
          }else{  
            $scope.channel.installed = true;
          }
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
            // console.debug($scope.clips[0].userData);
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

            /*
              Debug:
             */
            // $scope.startGame();

          })//End of bindStruct.init()
          
          $scope.taskList = function(gameId){
            console.log(gameId);
            // $state.go('tab.profile');
            $state.go('tab.tasks',{gameId:gameId});
          }

          $scope.newClip = function(openGameTime,orientation){
            //选择图片
            (function(newClipModal){
              Modal.okCancelModal('templates/modal-select-img.html', {}, {
                init: function(scope){
                  scope.imgs=[];
                  if(navigator&&navigator.camera&&navigator.camera.getScreenShots){
                    navigator.camera.getScreenShots(onSuccess, onFail, {
                      date: openGameTime,
                      orientation:orientation
                    });

                    function onSuccess(photos) {
                      scope.imgs = photos
                      console.log("成功截图"+scope.imgs);
                    }

                    function onFail(message) {
                      alert('Failed because: ' + message);
                    }
                  }
                    
                  // scope.imgs=[
                  //   "http://ionicframework.com.s3.amazonaws.com/demos/ionic-contrib-swipecards/pic.png",
                  //   "http://ionicframework.com.s3.amazonaws.com/demos/ionic-contrib-swipecards/pic2.png",
                  //   "http://ionicframework.com.s3.amazonaws.com/demos/ionic-contrib-swipecards/pic3.png",
                  //   "http://ionicframework.com.s3.amazonaws.com/demos/ionic-contrib-swipecards/pic4.png",
                  // ]
                  scope.selectIndex = 0;
                  scope.slideHasChanged=function(index){
                      console.debug(1111);
                      scope.selectIndex = index;
                  }
                },
                onOk: function(form,scope){
                  console.log(scope.imgs);
                  if(scope.imgs != ''){
                    var selectImg = scope.imgs[scope.selectIndex];
                    newClipModal(selectImg);                    
                  }
                  scope.hideModal();               
                },               
              })
            })
            (function(imgUrl){
              Api.postModal($scope.channel.addClip, {}, {
                init: function(scope){   
                  console.log(scope.selectImg);             
                  // var
                  console.log("时间："+openGameTime);
                  console.log("方向："+orientation);
                  scope.imageURI = imgUrl;
                  console.log('scope.imageURI', scope.imageURI);
                  scope.formData = {};
                  
                },
                onOk: function(form, scope){                 
                  return Thenjs(function(defer){
                    console.debug(111111); 
                    console.log('正在开始上传...');
                    upyun.upload(scope.imageURI, function(err, response, image){
                      if (err) console.error(err);
                      if (image.code === 200 && image.message === 'ok') {
                        scope.imageURI = image.absUrl;
                        scope.formData.img = image;
                        console.log("图片信息："+scope.formData.img)
                        defer(undefined);
                      }
                      scope.$apply();
                    });                    
                  });
                },
                onSuccess: function(form, scope,data){
                  console.log("成功返回数据"+JSON.stringify(data));
                  if ($scope.selectedTask._id != undefined){
                    var taskData = {'task':'/task/' + $scope.selectedTask._id};
                    // console.log("任务"+ JSON.stringify(taskData));
                    Api.putData("http://42.120.45.236:8485/clip-by-id/"+data._id, taskData).then(function(){
                      console.log("OK～～");                  
                    })
                  }                 
                  $scope.doRefresh();
                  scope.hideModal();
                }
              })//End of postModal              
            })
            //上传事件终结，清除缓存
            localStorage.removeItem('playGameId');
            localStorage.removeItem('playGameDt');
            localStorage.removeItem('playGameTm');
            console.log('localStorage' + localStorage.removeItem('playGameTm'));           
          };//End of new clip
          // $scope.newClip();

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
        if(!Auth.isLoggedIn()){
          Auth.login();
        }else{
          if(!$scope.channel.installed){
            var confirmPopup = $ionicPopup.confirm({
              title: '亲，偷偷告诉你哦',
              template: '您还没有安装<b style="color:red">'+ $scope.channel.name +'</b>哦！马上前往App Store安装?'
            });
            confirmPopup.then(function(res) {
              if(res) {
                window.open($scope.channel.clientsData[0].store, '_system');
              } else {
                console.log('download cancel');
              }
            });
          }else{
            Modal.okCancelModal('templates/modal-HowToScreen.html', {
              animation:'fade-in'
            }, {
              init: function(scope){

                var deviceInformation = ionic.Platform.device().model;
                if (deviceInformation == undefined) {
                  deviceInformation = 'iPhone6,2';
                }

                switch(deviceInformation) {
                  case 'iPod1,1':
                  case 'iPod2,1':
                  case 'iPod3,1':
                  case 'iPod4,1':
                    scope.deviceImage = 'ipodtouch';
                    scope.deviceAnimate = 'fadeInDown';
                    break;
                  case 'iPhone3,1':
                  case 'iPhone3,2':
                  case 'iPhone3,3':
                  case 'iPhone4,1':
                    scope.deviceImage = 'iphone4';
                    scope.deviceAnimate = 'fadeInDown';
                    break;
                  case 'iPhone5,1':
                  case 'iPhone5,2':
                    scope.deviceImage = 'iphone5';
                    scope.deviceAnimate = 'fadeInDown';
                    break;
                  case 'iPhone5,3':
                  case 'iPhone5,4':
                    scope.deviceImage = 'iphone5c';
                    scope.deviceAnimate = 'fadeInDown';
                    break;
                  case 'iPhone6,1':
                  case 'iPhone6,2':
                    scope.deviceImage = 'iphone5s';
                    scope.deviceAnimate = 'fadeInDown';
                    break;
                  case 'iPhone7,1':
                    scope.deviceImage = 'iphone6p';
                    scope.deviceAnimate = 'fadeInRight';
                    break;
                  case 'iPhone7,2':
                    scope.deviceImage = 'iphone6';
                    scope.deviceAnimate = 'fadeInRight';
                    break;
                }

                //判断是否显示截屏教程
                scope.modalStep = 'trySnapshot';
                scope.shownHowToSnapshot = localStorage.getItem('shownHowToSnapshot');
                if (scope.shownHowToSnapshot === null){
                  scope.modalStep = 'trySnapshot';
                  if (window.plugin && window.plugin.notification && window.plugins.pushNotification){
                    localStorage.setItem('shownHowToSnapshot', true);
                    window.plugins.pushNotification.notifyScreenShot();
                  }               
                } else {
                  scope.modalStep = 'task'
                }
                //获取任务
                Api.getData($rootScope.start.about, scope, 'about').then(function(defer, about){
                  Api.getData($scope.channel.tasks, scope, 'tasks', {
                    last:true,
                    itearator: {
                      minute: {
                        type: 'transfer',
                        transfer: function(attr){
                          return attr?attr:about.defaultTaskInterval;
                        },
                        attr: 'minute'
                      }
                    }
                  }).then(function(defer, tasks){
                    scope.tasks.unshift({name:about.defaultTask, minute: about.defaultTaskInterval});
                    defer(undefined);
                  }, function(defer, error){
                    if (error.status === 404){
                      scope.tasks = [{name:about.defaultTask, minute: about.defaultTaskInterval}];
                      defer(undefined);
                    }
                    defer(error);
                  }).then(function(){
                    //选择任务
                    scope.selectTask = function(index){
                      scope.currentTaskIndex = index;
                      $scope.selectedTask = scope.tasks[index];
                      console.debug($scope.selectedTask);
                    };
                    scope.selectTask(0);
                  })
                })
                
                //开始游戏按钮
                scope.nextStepFunction = {
                  trySnapshot: function(){
                    scope.modalStep = 'task';
                    if (window.plugin && window.plugin.notification && window.plugins.pushNotification){
                      window.plugins.pushNotification.removeScreenShot();
                    }

                  },
                  task: function(){
                    scope.modalStep = 'playGame';
                    $timeout(function(){
                      $scope.playGame();
                      scope.modal.hide();
                    },800)
                  }
                }
                scope.next = function(){
                  console.debug(scope.modalStep);
                  scope.nextStepFunction[scope.modalStep]();
                }

              },
              onClose:function(scope){
                if (window.plugin && window.plugin.notification && window.plugins.pushNotification){
                  window.plugins.pushNotification.removeScreenShot();
                }
                console.log("关闭！");
                scope.modal.hide();
              },
              onCancel:function(scope){
                if (window.plugin && window.plugin.notification && window.plugins.pushNotification){
                  window.plugins.pushNotification.removeScreenShot();
                }
                console.log("取消！");
                scope.modal.hide();
              }
            })//End of Modal
          }//End of installed          
        }//End of login      
      }//End of startGame


      $scope.playGame = function(){
        if($scope.channel.orientation == true){
          var direct = true;
        }else{
          var direct = false;
        }

        var now                  = new Date().getTime();
        var duration = $scope.selectedTask.minute;
        var taskName = $scope.selectedTask.name;
        console.log("任务时间:"+duration);
        console.log("任务名称:"+taskName);
        var backDate = new Date(now + duration *60000);

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
            title:   '是否已捕捉到#'+taskName+'的截屏?',
            message: '点击返回Gamo!',
            repeat:  'secondly',
            date:    backDate
          });
        }

        window.open(_.result(_.find($scope.channel.clientsData,{'platform': 'ios'}), 'url') + '://');
      }//End of playGame
    }
  ]);
});