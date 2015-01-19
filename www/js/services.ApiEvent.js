define(['app'], function(app)
{
  app.factory('ApiEvent', ['RestRoute', 'Auth', '$timeout',
  	function(RestRoute, Auth, $timeout) {

	  	console.log('Load ApiEvent Service');
	  	var events = {};

	  	var request = function(apiLink){
    		console.debug('ApiEvent running');
    		RestRoute.getLinkData(apiLink, events, 'event').then(function(){
	    		$timeout(function(){
	    			if (events.event && events.event.length && events.event.meta.next){
	    				request(events.event.meta.next);
	    			}else{
	    				request(apiLink);
	    			}
    			},1000);
    		})
    	};

	    return {
	    	connect: function(){
	    		request('/event-user?_last');
	    	}

	    }
	}
  ]);

});
