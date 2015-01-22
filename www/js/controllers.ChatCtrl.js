define(['app', 'services.RestRoute','services.Data', 'services.ApiEvent', 'services.Push'], function(app)
{
	app.controller('ChatCtrl', ['$scope', '$state', '$timeout', '$ionicFrostedDelegate', '$ionicScrollDelegate', '$ionicHistory', 'RestRoute', '$stateParams', 'Auth', 'ApiEvent','PushProcessingService',
		function($scope, $state, $timeout, $ionicFrostedDelegate, $ionicScrollDelegate, $ionicHistory, RestRoute, $stateParams, Auth, ApiEvent,PushProcessingService) {
			$scope.backButton = function() {
				console.log('back');
				$ionicHistory.goBack();
			};
			
			//检测是否关注该话题
			$scope.checkHasFollowedPost = function(){
				RestRoute.getLinkData('/is-subscribed/' + $stateParams.chatId, $scope, 'followedPost').then(function(){
					$scope.hasFollowedPost = true;
				}, function(){
					$scope.hasFollowedPost = false;
				});
			};
			$scope.checkHasFollowedPost();

			//初始化获取讨论内容
			var commentNextUrl = '';
			$scope.getComment = function(){
				RestRoute.getLinkData('/clip-comments/' + $stateParams.chatId + '?_last', $scope, 'comments').then(function(){
					$ionicScrollDelegate.scrollBottom();
					commentNextUrl = $scope.comments.meta.next;
				});
			};
			var tmp = {};
			$scope.refreshComment = function(){
				if (commentNextUrl){
					RestRoute.getLinkData(commentNextUrl, tmp, 'comments').then(function(){
						$scope.comments = $scope.comments.concat(tmp.comments);
						$ionicScrollDelegate.scrollBottom();
						commentNextUrl = tmp.comments.meta.next;
						$timeout(function(){
							$scope.refreshComment();
						},1)
					});
				}
			}
			$scope.getComment();

			//在讨论页面内，根据comet更新数据
			if (!$scope.comments) $scope.comments = [];
			ApiEvent.registerByResource('clip', $stateParams.chatId, function(event){
				// console.debug($state.current.name === 'tab.chat' , $state.current.params.chatId == $stateParams.chatId);
				if ($state.current.name === 'tab.chat' && $state.current.params.chatId == $stateParams.chatId){
					$scope.refreshComment();
				}
			});

			//发送新消息
			$scope.formData = {content:''};
			$scope.send = function(newCommentForm){
				//提交后等待comet的话很慢，因此如果提交成功直接本地增加内容
				RestRoute.postDataToLink('/new-comment/' + $stateParams.chatId, $scope.formData).then(function(defer, response){
					// console.debug(response.data.rawData);
					// $scope.comments.push(response.data.rawData);
					$ionicScrollDelegate.scrollBottom();
					$scope.formData.content = '';
				});
			}
      		$scope.toggleSubscribe = function(){

	      		var checkPush =  PushProcessingService.checkResult();
	    		if(checkPush == "No"){
	    			Auth.disallow();
	    		}
					
		        if ($scope.hasFollowedPost){
		          RestRoute.deleteDataFromLink($scope.followedPost.edit).then(function(){
		            $scope.checkHasFollowedPost();
		          });
		        }
		        else{
		          RestRoute.postDataToLink('/new-subscribe/' + $stateParams.chatId, {followedPost: $stateParams.chatId}).then(function(){
		            $scope.checkHasFollowedPost();
		          });
		        }
			}
  }]);
});
