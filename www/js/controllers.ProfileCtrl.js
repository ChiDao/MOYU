define(['app', 'services.Api', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'Auth', 'Api',
    function($scope, $stateParams, UI, Auth, Api) {
      $scope.Auth = Auth;
      $scope.userData = Auth.currentUser().userData;
      // console.debug($scope.userData);
      var tmp = {};
      Api.getData($scope.userData.clips, tmp, 'clips').then(function(){
        Api.getData(tmp.clips.meta.last, $scope, 'clips').then(function(){
          _.forEach($scope.clips,function(clip){
            console.debug(clip);
            Api.getData(clip.game, clip, 'gameData').then(function(){
              // console.debug(clip.gameData);
            });
          });
  	    });
      });
    }
  ]);
});
