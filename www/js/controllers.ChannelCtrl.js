define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout',
		function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout) {
			RestRoute.getLinkData('/client/' + $stateParams.channelId, $scope, 'channel').then(function(){
				console.log($scope.channel);
			});
			RestRoute.getLinkData('/client-posts/' + $stateParams.channelId + '?_last', $scope, 'posts').then(function(){
				_.forEach($scope.posts, function(post){
					RestRoute.getLinkData(post.user, post, 'userData').then(function(){
						console.log(post.userData);
					});
				})
			});
		}
	]);
});
