define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChannelsCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute',
		function($scope, $stateParams, UI, RestRoute) {

			var games = {};
			$scope.games = [];
			RestRoute.getLinkData('http://42.120.45.236:8485/client/14a66eaac9ae6457', games, 'game1').then(function(){
				$scope.games.push(games.game1);
			});
			RestRoute.getLinkData('http://42.120.45.236:8485/client/14a66ece010e6459', games, 'game2').then(function(){
				$scope.games.push(games.game2);
			});
		}
	]);
});
