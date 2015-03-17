define(['app', 'services.Api', 'services.ApiEvent', 'services.Push'], function(app)
{
  app.directive('focusOn', function() {
    console.debug(1111);
    return {
      restrict: 'A',
      scope: { focusOn: '@focusOn' },
      link: function(scope, elem, attr) {
        scope.$on('focusOn', function(e, name) {
          console.debug(name, attr.focusOn)
          if(name === attr.focusOn) {
            elem[0].focus();
          }
        });
      }
    };
  });

  app.factory('focus', function ($rootScope, $timeout) {
    return function(name) {
      $timeout(function (){
        $rootScope.$broadcast('focusOn', name);
      });
    }
  });

  app.controller('ChatCtrl', ['$scope', '$state', '$timeout', '$ionicScrollDelegate','$ionicPopup',
    '$stateParams', 'Auth', 'Api','ApiEvent','PushProcessingService', '$ionicLoading',
    '$location', '$anchorScroll', 'focus',
    function($scope, $state, $timeout, $ionicScrollDelegate,$ionicPopup,
      $stateParams, Auth, Api, ApiEvent,PushProcessingService, $ionicLoading,
      $location, $anchorScroll, focus) {

      $scope.hasFollowedPost = true;

      //获取截屏话题信息
      $scope.$on("$ionicView.afterEnter", function() {
        $ionicLoading.show();
        Api.getData(Api.getStateUrl(), $scope, 'clip', {
          itearator: {
            checkHasFollowedPost: {
              type:"existsFunction",
              attr:"subscribe",
            },
            doPostComment: {
              type: 'postFunction',
              attr: 'comment'
            },
          }
        }).then(function(){
          console.debug($scope.clip);
          ($scope.checkHasFollowedPost = function(){
            $scope.clip.checkHasFollowedPost(function(hasFollowedPost){
              $scope.hasFollowedPost = hasFollowedPost;
              console.log(hasFollowedPost);
            });
          })();

          $scope.toggleSubscribe = function(){
            if(!Auth.isLoggedIn()){
              Auth.login();
              return;
            }
            /*
              跳過驗證
             */
            // Api.putData($scope.clip.subscribe, {}).then(function(){
            //   $scope.checkHasFollowedPost();
            // });
            // return;

            var checkPush =  PushProcessingService.checkResult();
            if(checkPush == "No"){
              Auth.disallow();
            }else{
              if(Auth.currentUser().userData['#profile'] == 404){
                var alertSet1 = $ionicPopup.alert({
                  title: '你还没有设置个人信息，赶快去个人主页设置吧！',
                });
                // $timeout(function(){
                //   alert("你还没有设置个人信息，赶快去个人主页设置吧！")
                // },1)
              }else{
                if(Auth.currentUser().userData['@profile'].nickname ==''){
                  var alertSet2 = $ionicPopup.alert({
                    title: '你还没有填写昵称，赶快去个人主页设置吧！',
                  });
                  // $timeout(function(){
                  //   alert("你还没有填写昵称，赶快去个人主页设置吧！")
                  // },1)
                }else if(Auth.currentUser().userData['@profile'].logo['100']==''){
                  var alertSet3 = $ionicPopup.alert({
                    title: '你还没有上传头像，赶快去个人主页设置吧！',
                  });
                  // $timeout(function(){
                  //   alert("你还没有上传头像，赶快去个人主页设置吧！")
                  // },1)
                }else{
                  if ($scope.hasFollowedPost){
                    var tmp = {};
                    Api.deleteData($scope.clip.subscribe).then(function(){
                      $scope.checkHasFollowedPost();
                    });
                  }
                  else{
                    Api.putData($scope.clip.subscribe, {}).then(function(){
                      $scope.checkHasFollowedPost();
                    });
                  }
                }
              }
            }
          }

          //发送新消息
          $scope.formData = {content:''};
          $scope.send = function(keyCode){
            focus('focusMe')
            if($scope.formData.content != '' && $scope.formData.content != undefined){
              $scope.clip.doPostComment($scope.formData)
              .then(function(defer, response){
                $ionicScrollDelegate.scrollBottom();
                $scope.formData.content = '';
              });
            }else{
              // console.log("aaa"+$scope.formData.content);
              $timeout(function(){
                alert("不可以发送空白信息哦！")
              },1)
              // var alertPopup = $ionicPopup.alert({
              //   title: '不可以发送空白信息哦！',
              //      // template: 'hehe!'
              // });
            }
          }

          $scope.enter = function(event){
            if (event.keyCode === 13){
              $scope.formData.content;
            }
          }

          //绑定列表Api
          $scope.bindComments = Api.bindList($scope.clip.comments, $scope, 'comments',{
            last: true,
            itearator: {
              isOwned: {
                type: 'transfer',
                attr: '@user',
                transfer: function(user){
                  return user && user._id == Auth.currentUser().userData._id;
                }
              },
              userName: {
                type: 'transfer',
                attr: '@user',
                transfer: function(user){
                  return (user['@profile'] && user['@profile'].nickname)
                    ?user['@profile'].nickname
                    :user.email;
                }
              },
              userLogo: {
                type: 'transfer',
                attr: '@user',
                transfer: function(user){
                  return (user['@profile'] && user['@profile'].logo && user['@profile'].logo['100'])
                    ?user['@profile'].logo['100']
                    :'img/ionic.png';
                }
              }

            }
          });

          //初始化列表
          $scope.bindComments
          .init().then(function(defer){

            $ionicScrollDelegate.scrollBottom(false);

            //下拉刷新
            $scope.pullRefresh = function(){
              var tmpHash = $scope.comments[0]?$scope.comments[0]._id:undefined;
              $scope.bindComments.moreGetData().then(function(defer){
                $scope.$broadcast('scroll.refreshComplete');
                $scope.bindComments.moreUpdateData();
                if (tmpHash){
                  $location.hash(tmpHash);
                  $ionicScrollDelegate.anchorScroll();
                }
                defer(undefined);
              }, function(defer, error){
                $scope.$broadcast('scroll.refreshComplete');
                defer(error)
              })
            }

            $scope.goNewComments = function(){
              $scope.getNewComments = false;
              $ionicScrollDelegate.scrollBottom();
            }

            $scope.doScroll = function(){
              var currentPosition = $ionicScrollDelegate.getScrollPosition().top;
              var scrollHeight = $ionicScrollDelegate.getScrollView().__maxScrollTop;
              if (currentPosition >= scrollHeight - 50){
                $scope.getNewComments = false;
                $ionicScrollDelegate.resize();
              }
            }

            //在讨论页面内，根据comet更新comment
            ApiEvent.registerByResource('clip', $stateParams.clipId, function(event){
              console.debug($state.current.name === 'tab.chat' , $state.current.params.chatId == $stateParams.chatId);
              if ($state.current.name === 'tab.chat' && $state.current.params.clipId == $stateParams.clipId){
                var currentPosition = $ionicScrollDelegate.getScrollPosition().top;
                var scrollHeight = $ionicScrollDelegate.getScrollView().__maxScrollTop;
                $scope.bindComments.newer().then(function(){
                  $timeout(function(){
                    if (currentPosition == scrollHeight){
                      $ionicScrollDelegate.scrollBottom();
                    } else {
                      $scope.getNewComments = true;
                    }
                  }, 200),
                  Api.getData($scope.clip.comments, $scope, 'tmpClip', {last:true});
                })
              }
            }, '1');
            defer(undefined);
          }, function(defer, error){
            defer(error);
          })
          .fin(function(defer){
            $ionicLoading.hide();
          })

        }, function(defer, error){
          console.debug(error);
          $ionicLoading.hide();
        })
      })

      $scope.onHold= function(index){
        $scope.currentChatIndex = index;
      }

      $scope.copy= function(text){
        if (ionic.Platform.isWebView() && cordova.plugins.clipboard){
          cordova.plugins.clipboard.copy(text);
        } else {
          console.debug("copy the text：", text);
        }
        $scope.currentChatIndex = -1;
      }

      $scope.onTouch = function (argument) {
        $scope.currentChatIndex = -1;
      }

      $scope.action = function(){
        var options = {
            'buttonLabels': ['举报'],
            'androidEnableCancelButton' : true, // default false
            'winphoneEnableCancelButton' : true, // default false
            'addCancelButtonWithLabel': '取消',
            'addDestructiveButtonWithLabel' : '退出讨论'
        };
        var callback = function(buttonIndex) {
            if(buttonIndex == 1){
              Api.getData($scope.clip.subscribe,$scope,'subscribe').then(function(){
                console.log("退出讨论"+$scope.subscribe.edit);
                Api.deleteData($scope.subscribe.edit);
                $scope.checkHasFollowedPost();
              })
            }else if(buttonIndex == 2){
              console.log("举报"+$scope.clip.report);
              Api.putData($scope.clip.report,{});
            }
        };
        window.plugins.actionsheet.show(options, callback);
      }

  }]);
});
