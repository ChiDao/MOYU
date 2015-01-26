define(['app', 'services.RestRoute'], function(app)
{
  app.controller('TabsCtrl', ['$scope', '$state', 'RestRoute', '$timeout', 'ApiEvent', 'Auth', 'Api',
    function($scope, $state, RestRoute, $timeout, ApiEvent, Auth, Api) {

    	//处理新增评论事件
    	var checkedNewEvent = function(){
	    	ApiEvent.checkedNewEvent().then(function(defer, hasNewEvent){
				$scope.badgeContent = hasNewEvent?'+':'';
	    	});
	    };
	    checkedNewEvent();
    	ApiEvent.registerByApi('new-comment', function(event){
    		if ($state.current.name === 'tab.chat' || $state.current.name === 'tab.chats'){
    			ApiEvent.updateEventId();
    			$scope.badgeContent = '';
    		}else{
	    		checkedNewEvent();
	    	}
    	});

        $scope.Api = Api;
        $scope.homeData= Auth.currentUser().userData.homeData;
    	
    	$scope.hideTabs = function(){
    		//根据路由判断是否清理badge
    		switch ($state.current.name) {
    			case 'tab.chat':
    				$scope.badgeContent = '';
    			case 'tab.chats':
    				$scope.badgeContent = '';
    			default:
    		}
    		//根据路由判断是否显示Tabs
    		switch ($state.current.name) {
    			case 'tab.channel':
    				return true;
    			case 'tab.chat':
    				return true;
    			case 'tab.channel-chat':
    				return true;
                case 'tab.profile-chat':
                    return true;
    			default:
    				return false;
    		}
    	};
    }
  ]);
});