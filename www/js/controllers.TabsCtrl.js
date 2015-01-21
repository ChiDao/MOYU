define(['app', 'services.RestRoute'], function(app)
{
  app.controller('TabsCtrl', ['$scope', '$state', 'RestRoute', '$timeout', 'ApiData', 'ApiEvent',
    function($scope, $state, RestRoute, $timeout, ApiData, ApiEvent) {

    	//获取关注话题
    	if (ApiData.all('subscribes') === undefined) ApiData.init('subscribes');
    	$scope.subscribes = ApiData.all('subscribes');
    	console.debug($scope.subscribes);

    	$scope.badgeContent = 0;
    	ApiEvent.registerByApi('new-comment', function(event){
    		console.log('refresh');
    		if ($state.current.name === 'tab.chat'){
    			$scope.badgeContent = undefined;
    		}
    		$scope.badgeContent ++ ;
    	});


    	//根据路由判断是否显示Tabs
    	$scope.hideTabs = function(){
    		switch ($state.current.name) {
    			case 'tab.channel':
    			return true;
    			case 'tab.chat':
    			return true;
    			case 'tab.channel-chat':
    			return true;
    			default:
    			return false;
    		}
    	};
    }
  ]);
});