define(['app', 'services.RestRoute', 'services.Modal'], function(app)
{
	app.controller('ChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout',
		function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout) {
			$scope.$on("$ionicView.afterEnter", function() {
				RestRoute.getLinkData('/client/' + $stateParams.channelId, $scope, 'channel').then(function(){
					console.log($scope.channel);
				});
			});
			$scope.getPosts = function(){
				RestRoute.getLinkData('/client-posts/' + $stateParams.channelId + '?_last', $scope, 'posts').then(function(){
					_.forEach($scope.posts, function(post){
						RestRoute.getLinkData(post.user, post, 'userData').then(function(){
							console.log(post.userData);
						});
					})
				});
			};
			$scope.getPosts();
			$scope.newPost = function(){
				RestRoute.postModal('/new-post/' + $stateParams.channelId, {}, {
					init: function(scope){
						scope.formData = {};
						scope.getPicture = function(){
							navigator.camera.getPicture(onSuccess, onFail, { 
								quality: 50, 
								destinationType: Camera.DestinationType.FILE_URI,
								sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM	
							}); 

							function onSuccess(imageURI) {
								var image = document.getElementById('newPostImage');
								image.src = imageURI;
								scope.imageURI = imageURI;
							}

							function onFail(message) {
								alert('Failed because: ' + message);
							}
						}
					},
					onOk: function(form, scope){
						return Thenjs(function(defer){
							var win = function (r) {
							    console.log("Code = " + r.responseCode);
							    console.log("Response = " + r.response);
							    console.log("Sent = " + r.bytesSent);
							    var returnJson = JSON.parse(r.response);
							    scope.formData.img = returnJson['294@2x'];
							    defer(undefined);
							};

							var fail = function (error) {
							    alert("An error has occurred: Code = " + JSON.stringify(error));
							    console.log("upload error source " + error.source);
							    console.log("upload error target " + error.target);
							    defer("Upload image error");
							};

							var options = new FileUploadOptions();
							options.fileKey = "file";
							options.fileName = scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1);
							console.log("fileName:" + scope.imageURI.substr(scope.imageURI.lastIndexOf('/') + 1));
							options.mimeType = "image/jpeg";
							//options.Authorization = "Basic emFra3poYW5nejgyMTE1MzY0"

							var ft = new FileTransfer();
							ft.upload(scope.imageURI, encodeURI("http://42.120.45.236:8485/upload"), win, fail, options);
						});
					},
					onSuccess: function(scope){
						$scope.getPosts();
						scope.hideModal();
					}
				})
			}
		}
	]);
});
