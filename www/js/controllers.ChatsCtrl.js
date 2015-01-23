define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChatsCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'UI', 'RestRoute', 'Restangular',
    'Auth', 'ApiData', 'ApiEvent', '$http', '$timeout',
    function($scope, $rootScope, $state, $stateParams, UI, RestRoute, Restangular, Auth, ApiData, ApiEvent, $http, $timeout) {

      //Todo: 用户id从auth模块获取

      var subscribeLastCommentId = {};
      var hasRegisterSubscribe = {};
      $scope.hasNewComments = {};
      var fromDetailSubcribe = '';

      // //检查新增comment函数
      // var checkNewComments = function(subscribe){
      //   // console.debug("subscribeLastCommentId 1", subscribe._id, subscribeLastCommentId[subscribe._id]);
      //   //读取缓存
      //   var localLastCommentsId = localStorage.getItem('subscribeLastCommentId'+subscribe._id);
      //   if (!subscribeLastCommentId[subscribe._id] && localLastCommentsId !== null){
      //     subscribeLastCommentId[subscribe._id] = localLastCommentsId;
      //   }
      //   // console.debug("subscribeLastCommentId 2", subscribe._id, subscribeLastCommentId[subscribe._id]);

      //   if (subscribe['@clip'] && subscribe['@clip']['@comments'] && subscribe['@clip']['@comments'].slice){
      //     // console.debug(subscribe['@clip']['@comments'].slice);
      //     var comments = subscribe['@clip']['@comments'].slice;
      //     var tmpLastCommentsId = comments[comments.length - 1]._id;
      //     //新关注的subscriptions
      //     if (!subscribeLastCommentId[subscribe._id]){
      //       $scope.hasNewComments[subscribe['@clip']._id] = false;
      //       subscribeLastCommentId[subscribe._id] = tmpLastCommentsId;
      //       localStorage.setItem('subscribeLastCommentId'+subscribe._id, tmpLastCommentsId);
      //     }
      //     //新增了comments
      //     else if (subscribeLastCommentId[subscribe._id] != tmpLastCommentsId){
      //       //从讨论详情页回来，清除检查新comment
      //       console.debug(fromDetailSubcribe , fromDetailSubcribe == subscribe._id);
      //       $scope.hasNewComments[subscribe['@clip']._id] = 
      //         (fromDetailSubcribe && fromDetailSubcribe == subscribe._id?false:true);
      //       subscribeLastCommentId[subscribe._id] = tmpLastCommentsId;
      //       localStorage.setItem('subscribeLastCommentId'+subscribe._id, tmpLastCommentsId);
      //       console.log("subscribe has new comments", subscribe._id);
      //     }else{
      //       $scope.hasNewComments[subscribe['@clip']._id] = false;
      //     }
      //   }else{
      //     //新增的没有comment的subscriptions
      //     $scope.hasNewComments[subscribe['@clip']._id] = false;
      //     subscribeLastCommentId[subscribe._id] = '';
      //     localStorage.setItem('subscribeLastCommentId'+subscribe._id, '');
      //   }
      //   fromDetailSubcribe = '';

      //   // console.debug(subscribe._id, subscribe["@clip"]._id, $scope.hasNewComments[subscribe["@clip"]._id])
      //   // console.debug("subscribeLastCommentId 3", subscribe._id, subscribeLastCommentId[subscribe._id]);
      // };


      //更新列表
      var getSubscribes = function(){
        return Thenjs(function(defer){
          console.debug(Restangular.configuration.baseUrl + '/recent-user-subscriptions/' + Auth.currentUser().userData._id + '?_start=0' + '&r=' + Math.random());
          $http({method:'GET',
              url:Restangular.configuration.baseUrl + '/recent-user-subscriptions/' + Auth.currentUser().userData._id + '?_start=0' + '&r=' + Math.random(),
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
              }
           }).success(function(data){
            $scope.subscribes = data.slice.reverse();
            console.debug($scope.subscribes);

            _.forEach($scope.subscribes, function(subcribe){
              // checkNewComments(subcribe);

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

              defer(undefined);
            });
          });
          })
       };

      $scope.$on("$ionicView.afterEnter", function() {
        getSubscribes();
      });

      // //从讨论详情页回来，清除检查新comment
      // $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      //   console.debug(event, toState, toParams, fromState, fromParams);
      //   if (toState === 'tab.chats' && fromState === 'tab.chat'){
      //     fromDetailSubcribe = fromParams.chatId;
      //   }
      // });

      // pull refresh
      $scope.doRefresh = function() {
        getSubscribes().then(function(defer){
          $scope.$broadcast('scroll.refreshComplete');
        })
        
      };

    }
  ]);
});
