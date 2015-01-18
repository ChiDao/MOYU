define(['app', 'services.RestRoute', 'services.Modal'], function(app)
{
	app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout',
		function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout) {
			$scope.$on("$ionicView.afterEnter", function() {
				RestRoute.getLinkData('/client/' + $stateParams.channelId, $scope, 'channel').then(function(){
					console.log($scope.channel);
				});
			});
			RestRoute.getLinkData('/client-posts/' + $stateParams.channelId + '?_last', $scope, 'posts').then(function(){
				_.forEach($scope.posts, function(post){
					RestRoute.getLinkData(post.user, post, 'userData').then(function(){
						console.log(post.userData);
					});
				})
			});
			$scope.newPost = function(){
				RestRoute.postModal('/new-post/' + $stateParams.channelId, {}, {
					init: function(scope){
						console.log('xxxxxx')
						scope.getPicture = function(){
							navigator.camera.getPicture(onSuccess, onFail, { 
								quality: 50, 
								destinationType: Camera.DestinationType.FILE_URI,
								sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM	
							}); 

							function onSuccess(imageURI) {
								var image = document.getElementById('newPostImage');
								image.src = imageURI;
								$scope.imageURI = imageURI;
							}

							function onFail(message) {
								alert('Failed because: ' + message);
							}
						}
					}
				})
			}
		}
	]);
});
