define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute', 'Auth',
    function($scope, $state, $stateParams, UI, RestRoute, Auth) {

    	// UI.testModal('modal-new-clip');

    	$scope.addChannel = function(){
    		$state.go('tab.add-channel');
    	}

    	if (!Auth.isLoggedIn()) $state.go('tab.add-channel');
    	// RestRoute.getData();
		// RestRoute.getLinkData('/all-clients/ios?_last', $scope, 'channels').then(function(){
		// 	console.log($scope.channels);
		// });
    }
  ]);
});
