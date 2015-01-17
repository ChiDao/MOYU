define(['app', 'services.RestRoute', 'services.Auth'], function(app)
{
	app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', 'Auth',
		function($scope, $stateParams, UI, RestRoute, Auth) {
			$scope.Auth = Auth;
			// RestRoute.getData($scope, 'game').then(function(){
			// 	console.log(_.keys($scope));
			// });
		}
	]);
});
