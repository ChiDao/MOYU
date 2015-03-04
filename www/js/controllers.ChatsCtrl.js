define(['app', 'services.Api'], function(app)
{
  app.controller('ChatsCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'UI', 'Api', 'Restangular',
    'Auth', 'Api', 'ApiEvent', '$http', '$timeout', '$ionicLoading', 
    function($scope, $rootScope, $state, $stateParams, UI, Api, Restangular, 
      Auth, Api, ApiEvent, $http, $timeout, $ionicLoading) {

      $scope.subscribes = Array(10);

      //Todo: 用户id从auth模块获取
      $scope.Api = Api;
      var subscribeLastCommentId = {};
      var hasRegisterSubscribe = {};
      $scope.hasNewComments = {};
      var fromDetailSubcribe = '';

      $scope.bindSubscribes = Api.bindList(Restangular.configuration.baseUrl + '/recent-user-subscriptions/' + Auth.currentUser().userData._id + '?_start=0' + '&r=' + Math.random(),$scope,'subscribes',{
        reverse: true,
        itearator: {
          callback: {
            type: 'callback',
            callback: function(subcribe){
              // console.debug(subcribe);
              return Thenjs(function(defer){

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

                // console.debug("getData 20",subcribe['@clip'] && subcribe['@clip']['@comments'] && subcribe['@clip']['@comments']['slice']);
                if (subcribe['@clip'] && subcribe['@clip']['@comments'] && subcribe['@clip']['@comments']['slice']){
                  var comments = subcribe['@clip']['@comments']['slice'];
                  var tmpLastComment = comments[comments.length - 1];
                  console.debug(tmpLastComment);
                  Api.getData(tmpLastComment.user, subcribe['@clip'], 'lastCommentUserData').then(function(){
                    Api.getData(subcribe['@clip'].game, subcribe['@clip'], 'gameData').then(function(){
                      // console.debug("getData 21");
                      console.debug(subcribe['@clip'].lastCommentUserData)
                      defer(undefined);
                    }, function(){
                      // console.debug("getData 22");
                      defer("Get game data error");
                    });
                  }, function(innerDefer){
                    // console.debug("getData 23");
                    defer("Get user data error");
                  });
                }else{
                  // console.debug("getData 24");
                  defer(undefined);
                }
              });//End of Thenjs
            }
          }
        }
      });
      $ionicLoading.show();
      $scope.bindSubscribes.init().then(function(defer, data){
        console.debug($scope['subscribes']);
        if (data.status === 404){
          $scope.subscribes.length = 0;
        }

        $scope.$on("$ionicView.afterEnter", function() {
          $ionicLoading.show();
          $scope.bindSubscribes.refresh().fin(function(){
            $ionicLoading.hide();
          });
        });

        // pull refresh
        $scope.pullRefresh = function() {
          $scope.bindSubscribes.refresh().then(function(defer){
            $scope.$broadcast('scroll.refreshComplete');
          }, function(defer){
            $scope.$broadcast('scroll.refreshComplete');
          })
        };
        defer(undefined);
      }, function(defer, error){
        defer(error);
      }).fin(function(){
        $ionicLoading.hide();
      });

      $scope.hasMore = $scope.bindSubscribes.hasMore;
      $scope.loadMore = function() {
        console.debug("load more")
        $scope.bindSubscribes.more().then(function(defer){
          console.debug('loadMore success')
          $scope.$broadcast('scroll.infiniteScrollComplete');
          defer(undefined);
        }, function(defer){
          console.debug('loadMore error')
          $scope.$broadcast('scroll.infiniteScrollComplete');
          defer(undefined);
        })
      };


    }
  ]);
});





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

      // //从讨论详情页回来，清除检查新comment
      // $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
      //   console.debug(event, toState, toParams, fromState, fromParams);
      //   if (toState === 'tab.chats' && fromState === 'tab.chat'){
      //     fromDetailSubcribe = fromParams.chatId;
      //   }
      // });

