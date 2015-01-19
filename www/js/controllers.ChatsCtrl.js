define(['app', 'services.RestRoute'], function(app)
{
	app.controller('ChatsCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', 'Auth',
		function($scope, $stateParams, UI, RestRoute, Auth) {
			//Todo: 用户id从auth模块获取
			RestRoute.getLinkData('/followposts/' + Auth.currentUser().userData._id + '?_last', $scope, 'chats').then(function(){
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
