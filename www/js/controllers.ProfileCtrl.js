define(['app', 'services.RestRoute', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', 'Auth',
    function($scope, $stateParams, UI, RestRoute, Auth) {
      $scope.Auth = Auth;
      $scope.userData = Auth.currentUser().userData;
      // console.debug($scope.userData);
      var tmp = {};
      RestRoute.getLinkData($scope.userData.clips, tmp, 'clips').then(function(){
        RestRoute.getLinkData(tmp.clips.last, $scope, 'clips').then(function(){
          _.forEach($scope.clips,function(clip){
            console.debug(clip);
            RestRoute.getLinkData(clip.game, clip, 'gameData').then(function(){
              // console.debug(clip.gameData);
            });
          });
  	    });
      });
    }
  ]);
});
