define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChatsCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute',
		function($scope, $stateParams, UI, RestRoute) {
			//Todo: 用户id从auth模块获取
			RestRoute.getLinkData('/followposts/' + '14ab811c6b692787' + '?_last', $scope, 'chats').then(function(){
				// console.debug($scope.chats);
				_.forEach($scope.chats, function(chat){
					// console.debug(chat);
					RestRoute.getLinkData(chat.followedPost, chat, 'postData').then(function(){
						// console.log(chat.postData);
					});
				})
			});
		}
	]);
});
