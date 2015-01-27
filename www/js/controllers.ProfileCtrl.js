define(['app', 'services.Api', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'Auth', 'Api',
    function($scope, $stateParams, UI, Auth, Api) {
      $scope.Auth = Auth;
      $scope.userData = Auth.currentUser().userData;
      console.debug($scope.userData);

      Api.getData($scope.userData.clips, $scope, 'clips', {
        last:true,
        itearator: {
          gameData: {
            type: 'getData',
            attr: 'game'
          }
        }
      }).then(function(){
        // console.debug($scope.clips);
	    });
    }
  ]);
});
