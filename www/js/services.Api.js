define(['app'], function(app)
{
    app.factory('Api', ['$state', function($state) {

    	//定义api, Todo:服务端生成
    	var resources = [
    	];

    	var apis = [
	    	{
	    		name: 'game',
	    		apiRegExp: /\/game\/(\w+)/,
	    		apiRegExpMap: ['gameId'],
	    		api: 'game/<%= gameId %>',
	    		apiType: 'detail',
	    		state: 'app.game',
	    	},
    	];

    	return {
    		apis: apis
    	};
    }]);
});