define(['app', 'services.Api', 'services.ApiEvent', 'services.Push'], function(app)
{
	app.controller('ChatCtrl', ['$scope', '$state', '$timeout', '$ionicFrostedDelegate', '$ionicScrollDelegate', 
		'$ionicHistory', '$stateParams', 'Auth', 'Api','ApiEvent','PushProcessingService',
		function($scope, $state, $timeout, $ionicFrostedDelegate, $ionicScrollDelegate, 
			$ionicHistory, $stateParams, Auth, Api, ApiEvent,PushProcessingService) {
			$scope.backButton = function() {
				// console.log('back');
				$ionicHistory.goBack();
			};
			Api.getData(Api.getStateUrl(), $scope, 'clip', {
				itearator: {
					checkHasFollowedPost: {
						type:"existsFunction",
						attr:"subscribe",
					},
					doPostComment: {
						type: 'postFunction',
						attr: 'comment'
					}
				}
			}).then(function(){
				console.debug($scope.clip);
				($scope.checkHasFollowedPost = function(){
					$scope.clip.checkHasFollowedPost(function(hasFollowedPost){
						$scope.hasFollowedPost = hasFollowedPost;
					});
				})();
				
	      		$scope.toggleSubscribe = function(){

		      		var checkPush =  PushProcessingService.checkResult();
		    		if(checkPush == "No"){
		    			Auth.disallow();
		    		}

		    		if ($scope.hasFollowedPost){
		    			var tmp = {};
		    			Api.deleteData($scope.clip.subscribe).then(function(){
		    				$scope.checkHasFollowedPost();
		    			});
		    		}
		    		else{
		    			Api.putData($scope.clip.subscribe, {}).then(function(){
		    				$scope.checkHasFollowedPost();
		    			});
		    		}
				}

				//发送新消息
				$scope.formData = {content:''};
				$scope.send = function(newCommentForm){
					//提交后等待comet的话很慢，因此如果提交成功直接本地增加内容
					$scope.clip.doPostComment($scope.formData)
					.then(function(defer, response){
						// console.debug(response.data.rawData);
						// $scope.comments.push(response.data.rawData);
						$ionicScrollDelegate.scrollBottom();
						$scope.formData.content = '';
					});
				}
			}, function(defer, error){
				console.debug(error);
			})
			
			

			//初始化获取讨论内容
			var commentNextUrl = '';
			$scope.getComment = function(){
				Api.getData('/clip-comments/' + $stateParams.clipId + '?_last', $scope, 'comments').then(function(){
					$ionicScrollDelegate.scrollBottom();
					commentNextUrl = $scope.comments.meta.next;
				});
			};
			var tmp = {};
			$scope.refreshComment = function(){
				if (commentNextUrl){
					Api.getData(commentNextUrl, tmp, 'comments').then(function(){
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
			ApiEvent.registerByResource('clip', $stateParams.clipId, function(event){
				console.debug($state.current.name === 'tab.chat' , $state.current.params.chatId == $stateParams.chatId);
				if ($state.current.name === 'tab.chat' && $state.current.params.clipId == $stateParams.clipId){
					$scope.refreshComment();
				}
			});

  }]);
});
