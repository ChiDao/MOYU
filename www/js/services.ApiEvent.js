define(['app'], function(app)
{
  app.factory('ApiEvent', ['RestRoute', 'Auth', '$timeout',
  	function(RestRoute, Auth, $timeout) {

	  	console.log('Load ApiEvent Service');
	  	var tmp = {};
    	var apiCallbacks = {};
    	var resourceCallbacks = {};

    	//执行回调函数
    	var runCallbacks = function(event){
    		var apiData = RestRoute.parseApiLink(event.path);
    		if (apiData.apiConfig){
                //根据api进行注册的回调函数
                if (apiCallbacks[apiData.apiConfig.name]){
        			_.forEach(apiCallbacks[apiData.apiConfig.name], function(callback){
        				callback(event);
        			})
                }
                //根据资源进行注册的回调函数
                var tmpResourceCallbacks = resourceCallbacks[apiData.apiConfig.resource];
                var resourceId = apiData.params[apiData.apiConfig.resourceId];
                console.debug(tmpResourceCallbacks , resourceId , tmpResourceCallbacks[resourceId])
                if (tmpResourceCallbacks && resourceId && tmpResourceCallbacks[resourceId]){
                    _.forEach(tmpResourceCallbacks[resourceId], function(callback){
                        callback(event);
                    })
                }
    		}
    	}

    	//递归请求数据
	  	var request = function(apiLink){
    		console.debug('ApiEvent running');
    		RestRoute.getLinkData(apiLink, tmp, 'events').then(function(){
    			if (tmp.events && tmp.events.length && tmp.events.meta.next){
    				$timeout(function(){
    					_.forEach(tmp.events, function(event){
    						runCallbacks(event);
    					})
    					request(tmp.events.meta.next);
					},1);
    			}else{
    				$timeout(function(){
    					request(apiLink);
					},1);
    			}
    		}, function(error){
				console.debug(JSON.stringify(error));
				request(apiLink);
    		})
    	};
    	request('/event-user?_last');

	    return {
	    	//注册api回调函数，Todo:检查是否重复
	    	registerByApi: function(apiConfigName, callback){
	    		if (!apiCallbacks[apiConfigName]) apiCallbacks[apiConfigName] = [];
	    		apiCallbacks[apiConfigName].push(callback);
	    		// console.debug('Register', apiConfigName, apiCallbacks[apiConfigName])
	    	},
	    	//注册资源回调函数，Todo:检查是否重复
	    	registerByResource: function(resourceName, resourceId, callback){
	    		if (!resourceCallbacks[resourceName]) resourceCallbacks[resourceName] = {};
                if (!resourceCallbacks[resourceName][resourceId]) resourceCallbacks[resourceName][resourceId] = [];
	    		resourceCallbacks[resourceName][resourceId].push(callback);
	    	}
	    	//Todo: 取消注册
	    }
	}
  ]);

});
