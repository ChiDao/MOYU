define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute',
		function($scope, $stateParams, UI, RestRoute, $timeout) {
			RestRoute.getLinkData('http://42.120.45.236:8485/client/14a66eaac9ae6457', $scope, 'game').then(function(){
			});
		}
	]);
});
