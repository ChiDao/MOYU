define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChatsCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute',
		function($scope, $stateParams, UI, RestRoute) {
			$scope.chats = [
				{
					_id: 1,
					title: 'chat 1',
					image: 'img/ionic.png',
				},
				{
					_id: 2,
					title: 'chat 2',
					image: 'img/ionic.png',
				},
			]
		}
	]);
});
