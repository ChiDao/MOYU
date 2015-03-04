define(['app', 'services.Api', 'services.ApiEvent', 'services.Push'], function(app)
{
  app.controller('ChatCtrl', ['$scope', '$state', '$timeout', '$ionicScrollDelegate','$ionicPopup',
    '$stateParams', 'Auth', 'Api','ApiEvent','PushProcessingService', '$ionicLoading',
    function($scope, $state, $timeout, $ionicScrollDelegate,$ionicPopup,
      $stateParams, Auth, Api, ApiEvent,PushProcessingService, $ionicLoading) {

      $scope.hasFollowedPost = true;

      //获取截屏话题信息
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
          }
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
          //提交后等待comet的话很慢，因此如果提交成功直接本地增加内容
          if($scope.formData.content != ''){
            $scope.clip.doPostComment($scope.formData)
            .then(function(defer, response){
              // console.debug(response.data.rawData);
              // $scope.comments.push(response.data.rawData);
              $ionicScrollDelegate.scrollBottom();
              $scope.formData.content = '';
            });
          }else{
            var alertPopup = $ionicPopup.alert({
              title: '不可以发送空白信息哦！',
                 // template: 'hehe!'
            });
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

          $ionicScrollDelegate.scrollBottom();

          //下拉刷新
          $scope.pullRefresh = function(){
            $scope.bindComments.more().then(function(defer){
              $scope.$broadcast('scroll.refreshComplete');
              defer(undefined);
            }, function(defer, error){
              $scope.$broadcast('scroll.refreshComplete');
              defer(error)
            })
          }

          //在讨论页面内，根据comet更新comment
          ApiEvent.registerByResource('clip', $stateParams.clipId, function(event){
            console.debug($state.current.name === 'tab.chat' , $state.current.params.chatId == $stateParams.chatId);
            if ($state.current.name === 'tab.chat' && $state.current.params.clipId == $stateParams.clipId){
              $scope.bindComments.newer().then(function(){
                $timeout(function(){
                  $ionicScrollDelegate.scrollBottom();
                }, 200)
              })
            }
          });
          defer(undefined);
        }, function(defer, error){
          defer(error);
        })
        .fin(function(defer){
          $ionicLoading.hide();
        })
        
      }, function(defer, error){
        console.debug(error);
      })




  }]);
});
