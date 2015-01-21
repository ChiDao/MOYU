define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChatsCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', 'Auth', 'ApiData',
    function($scope, $stateParams, UI, RestRoute, Auth, ApiData) {
      //Todo: 用户id从auth模块获取

      //获取关注话题
      if (ApiData.all('subscribes') === undefined){
        ApiData.init('subscribes').then(function(){
          $scope.subscribes = ApiData.all('subscribes');
        });
      }
      else{
        $scope.subscribes = ApiData.all('subscribes');
      }
      

      $scope.$on("$ionicView.afterEnter", function() {
        // RestRoute.getLinkData('/user-subscriptions/' + Auth.currentUser().userData._id + '?_last', $scope, 'subscribes').then(function(){
        //   // console.debug($scope.chats);
        //   _.forEach($scope.subscribes, function(subscribe){
        //     // console.debug(chat);
        //     RestRoute.getLinkData(subscribe.clip, subscribe, 'clipData').then(function(){
        //       // console.log(chat.postData);
        //     });
        //   })
        // }, function(){
        //   $scope.subscribes = undefined;
        // });
      });
      
    }
  ]);
});
