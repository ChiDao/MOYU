define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChatsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute', 'Auth', 'ApiData', 'ApiEvent', '$http', '$timeout',
    function($scope, $state, $stateParams, UI, RestRoute, Auth, ApiData, ApiEvent, $http, $timeout) {
      //Todo: 用户id从auth模块获取

      var subscribeLastCommentId = {};
      var hasRegisterSubscribe = {};
      $scope.hasNewComments = {};


      //检查新增comment函数
      var checkNewComments = function(subscribe){
        // console.debug("subscribeLastCommentId 1", subscribe._id, subscribeLastCommentId[subscribe._id]);
        //读取缓存
        var localLastCommentsId = localStorage.getItem('subscribeLastCommentId'+subscribe._id);
        if (!subscribeLastCommentId[subscribe._id] && localLastCommentsId !== null){
          subscribeLastCommentId[subscribe._id] = localLastCommentsId;
        }
        // console.debug("subscribeLastCommentId 2", subscribe._id, subscribeLastCommentId[subscribe._id]);

        if (subscribe['@clip'] && subscribe['@clip']['@comments'] && subscribe['@clip']['@comments'].slice){
          console.debug(subscribe['@clip']['@comments'].slice);
          var comments = subscribe['@clip']['@comments'].slice;
          var tmpLastCommentsId = comments[comments.length - 1]._id;
          //新关注的subscriptions
          if (!subscribeLastCommentId[subscribe._id]){
            $scope.hasNewComments[subscribe._id] = false;
            subscribeLastCommentId[subscribe._id] = tmpLastCommentsId;
            localStorage.setItem('subscribeLastCommentId'+subscribe._id, tmpLastCommentsId);
          }
          //新增了comments
          else if (subscribeLastCommentId[subscribe._id] != tmpLastCommentsId){
            $scope.hasNewComments[subscribe._id] = true;
            subscribeLastCommentId[subscribe._id] = tmpLastCommentsId;
            localStorage.setItem('subscribeLastCommentId'+subscribe._id, tmpLastCommentsId);
            console.log("subscribe has new comments", subscribe._id);
          }else{
            $scope.hasNewComments[subscribe._id] = false;
          }
        }else{
          //新增的没有comment的subscriptions
          $scope.hasNewComments[subscribe._id] = false;
          subscribeLastCommentId[subscribe._id] = '';
          localStorage.setItem('subscribeLastCommentId'+subscribe._id, '');
        }
        // console.debug(subscribe._id, subscribe["@clip"]._id, $scope.hasNewComments[subscribe["@clip"]._id])
        // console.debug("subscribeLastCommentId 3", subscribe._id, subscribeLastCommentId[subscribe._id]);
      };


      //更新列表
      var getSubscribes = function(){
        $http({method:'GET',
            url:'http://localhost:8485/user-subscriptions/14af80f4ced1684f?_last' + '&r=' + Math.random(),
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
         }).success(function(data){
          $scope.subscribes = data.slice;
          // console.debug($scope.subscribes);

          _.forEach($scope.subscribes, function(subcribe){
            checkNewComments(subcribe);

            //注册comet事件，只在本页时进行刷新
            // console.debug("clipId", subcribe['@clip']._id);
            if (!hasRegisterSubscribe[subcribe['@clip']._id]){
              ApiEvent.registerByResource('clip', subcribe['@clip']._id, function(event){
                // console.debug("checkNewComments", $state.current.name, $state.current);
                if ($state.current.name === 'tab.chats'){
                  $timeout(function(){
                    getSubscribes();
                  },1); 
                }
              });
              hasRegisterSubscribe[subcribe['@clip']._id] = true;
            }
          });
        });
       };

      getSubscribes();


      //获取关注话题
      // $scope.$on("$ionicView.afterEnter", function() {
        // console.log('/user-subscriptions/' + Auth.currentUser().userData._id + '?_last');
        // RestRoute.getLinkData('/user-subscriptions/' + Auth.currentUser().userData._id + '?_last', $scope, 'subscribes').then(function(){
        //   // console.debug($scope.subscribes);
        //   _.forEach($scope.subscribes, function(subscribe){
        //     console.debug(JSON.stringify(subscribe));
        //     RestRoute.getLinkData(subscribe.clip, subscribe, 'clipData').then(function(){
        //       // console.log(chat.postData);
        //     });
        //   })
        // }, function(){
        //   $scope.subscribes = undefined;
        // });
      // });
      
    }
  ]);
});
