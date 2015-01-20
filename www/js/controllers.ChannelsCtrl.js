define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute',
    function($scope, $state, $stateParams, UI, RestRoute) {

    	UI.testModal('modal-new-clip');

		RestRoute.getLinkData('/all-clients/ios?_last', $scope, 'channels').then(function(){
		console.log($scope.channels);
		});
    }
  ]);
});
