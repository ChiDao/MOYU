define(['app', 'services.RestRoute','services.Data', 'services.ApiEvent', 'services.Push', 'services.Modal'], function(app)
{
	app.controller('ChatCtrl', ['$scope', '$timeout', '$ionicFrostedDelegate', '$ionicScrollDelegate', '$ionicHistory', 'RestRoute', '$stateParams', 'Auth', 'ApiEvent','PushProcessingService','Modal',
		function($scope, $timeout, $ionicFrostedDelegate, $ionicScrollDelegate, $ionicHistory, RestRoute, $stateParams, Auth, ApiEvent,PushProcessingService,Modal) {
			$scope.backButton = function() {
				console.log('back');
				$ionicHistory.goBack();
			};
			

			$scope.checkHasFollowedPost = function(){
				RestRoute.getLinkData('/is-subscribed/' + $stateParams.chatId, $scope, 'followedPost').then(function(){
					$scope.hasFollowedPost = true;
				}, function(){
					$scope.hasFollowedPost = false;
				});
			};
			$scope.checkHasFollowedPost();
			$scope.getComment = function(){
				RestRoute.getLinkData('/clip-comments/' + $stateParams.chatId + '?_last', $scope, 'comments').then(function(){

				});
			};
			$scope.getComment();
			if (!$scope.comments) $scope.comments = [];
			ApiEvent.registerByApi('new-comment', function(data){
				// if (data && data._id) console.debug(data._id, _.filter($scope.comments, {_id:data._id}).length);
				if (data && data._id && !_.filter($scope.comments, {_id:data._id}).length){
					$scope.comments.push(data);
				}
			});
			$scope.formData = {content:''};
			$scope.send = function(newCommentForm){
				//提交后等待comet的话很慢，因此如果提交成功直接本地增加内容
				RestRoute.postDataToLink('/new-comment/' + $stateParams.chatId, $scope.formData).then(function(defer, response){
					// console.debug(response.data.rawData);
					$scope.comments.push(response.data.rawData);
				});
			}
      		$scope.toggleSubscribe = function(){

	      		var checkPush =  PushProcessingService.checkResult();
	    		if(checkPush != "Yes"){
	    			Modal.okCancelModal('templates/modal-allow-notification.html', {}, {
	    				onOk: function(form, scope){     
	    					PushProcessingService.initialize();                                                
	    					scope.push = false;
	    					scope.hideModal();
	    					Modal.okCancelModal('templates/modal-how-to-notification.html', {}, {
	    						init: function(scope){
	    							scope.push = false;
								//循环检查
								recheck(scope);
								}
							})
	    				}
	    			});
	    		}
					
				function recheck(scope){                
				 	$timeout(function() {                         
				    	PushProcessingService.checkinitialize(); 
				    	$timeout(function() {                        
					   	    var checkPush =  PushProcessingService.checkResult();                         
					   	    console.log("checkPush is "+checkPush);                         
					   	    if(checkPush != "Yes"){                        
					    	    console.log("循环检查");                         
					    	    recheck(scope);                         
					    	}else{
					            scope.push =true;
					            $timeout(function() {
					    	        scope.hideModal();
					    	    },5000)
					    	}
					    },1);
				  	}, 1000);   
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
