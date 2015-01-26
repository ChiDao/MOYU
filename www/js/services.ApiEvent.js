define(['app'], function(app)
{
  app.factory('ApiEvent', ['RestRoute', 'Auth', '$timeout', 'Api',
  	function(RestRoute, Auth, $timeout, Api) {

	  	console.log('Load ApiEvent Service');
	  	var tmp = {};
        var lastEventId = localStorage.getItem('lastEventId');
    	var apiCallbacks = {};
    	var resourceCallbacks = {};

        if (lastEventId === null) 
            lastEventId = '';

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
                // console.debug(tmpResourceCallbacks , resourceId , tmpResourceCallbacks[resourceId])
                if (tmpResourceCallbacks && resourceId && tmpResourceCallbacks[resourceId]){
                    // console.debug(tmpResourceCallbacks , resourceId , tmpResourceCallbacks[resourceId])
                    _.forEach(tmpResourceCallbacks[resourceId], function(callback){
                        callback(event);
                    })
                }
    		}
    	}

    	//递归请求数据
	  	var request = function(apiLink, isInit){
    		console.debug('ApiEvent running');
            // Api.getData(apiLink, tmp, 'events');
    		Api.getData(apiLink, tmp, 'events', {random:true}).then(function(){
                // console.debug('ApiEvent return', tmp.events);
    			if (tmp.events && tmp.events.length && tmp.events.meta.next){
    				$timeout(function(){
                        if (!isInit){
        					_.forEach(tmp.events, function(event){
        						runCallbacks(event);
        					})
                        }
                        var next = tmp.events.meta.next;
                        tmp.events = undefined;
    					request(next);
					},1);
    			}else{
    				$timeout(function(){
    					request(apiLink);
					},1);
    			}
    		}, function(defer, error){
				console.debug(JSON.stringify(error));
				$timeout(function(){
                    request(apiLink);
                },10000);
    		})
    	};
        // console.debug("Auth.isLoggedIn()", Auth.isLoggedIn());
        if (Auth.isLoggedIn()) request('/event-user?_last', true);

	    return {
            //检查是否有新的评论
            checkedNewEvent: function(){
                // console.debug("checkedNewEvent: " + lastEventId);
                return Thenjs(function(defer){
                    if (!lastEventId){
                        // console.debug('checkedNewEvent 1');
                        RestRoute.getLinkData('/event-user?_last', tmp, 'events').then(function(){
                            if (tmp.events.length > 0){ 
                                var tmpLastEventId = tmp.events[tmp.events.length - 1]._id;
                                lastEventId = tmpLastEventId;
                                localStorage.setItem('lastEventId', lastEventId);
                                defer(undefined, false);
                            }
                        });
                    }else{
                        // console.debug('checkedNewEvent 2');
                        RestRoute.getLinkData('/event-user?_last', tmp, 'events').then(function(){
                            if (tmp.events.length > 0){ 
                                var tmpLastEventId = tmp.events[tmp.events.length - 1]._id;
                                if (lastEventId === tmpLastEventId){
                                    defer(undefined, false);
                                }else{
                                    // console.debug('checkedNewEvent', 'newEventId:' + tmpLastEventId);
                                    lastEventId = tmpLastEventId;
                                    localStorage.setItem('lastEventId', lastEventId);
                                    defer(undefined, true);
                                }
                            }
                            //没有任何event
                            else{
                                defer(undefined, false);
                            }
                        });
                    }
                });
            },
            updateEventId: function(){
                RestRoute.getLinkData('/event-user?_last', tmp, 'events').then(function(){
                    if (tmp.events.length > 0){ 
                        var tmpLastEventId = tmp.events[tmp.events.length - 1]._id;
                        lastEventId = tmpLastEventId;
                        localStorage.setItem('lastEventId', lastEventId);
                    }
                });
            },
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
