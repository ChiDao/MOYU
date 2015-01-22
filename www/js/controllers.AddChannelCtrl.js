define(['app', 'services.RestRoute'], function(app)
{
  app.controller('AddChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', 'Auth',
    function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout, Auth) {
      	RestRoute.getLinkData('/clients-by-platform/ios?_last' + '&r=' + Math.random(), $scope, 'channels').then(function(){
			console.log($scope.channels);
		});

		$scope.followGame = function(channle){
			console.debug('followGame')
			if (!Auth.isLoggedIn()){
				Auth.login();
			}
			else{
				console.debug(channle);
				// RestRoute.postDataToLink(channle.follow);
			}
		}
    }
  ]);
});
