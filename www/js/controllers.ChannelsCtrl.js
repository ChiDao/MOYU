define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute', 'Auth',
    function($scope, $state, $stateParams, UI, RestRoute, Auth) {

    	// UI.testModal('modal-new-clip');

    	$scope.addChannel = function(){
    		$state.go('tab.add-channel');
    	}

    	if (!Auth.isLoggedIn()) $state.go('tab.add-channel');

        var tmp = {};
        RestRoute.getLinkData('/recent-played-games/' + Auth.currentUser().userData._id + '?_start=0', $scope, 'channels').then(function(){
            console.debug($scope.channels);
            _.forEach($scope.channels, function(interest){
                RestRoute.getLinkData(interest.game, interest, 'gameData').then(function(){
                    console.debug(interest.gameData);
                });
            })
        });
    	// RestRoute.getData();
		// 
    }
  ]);
});
