define(['app'], function(app)
{
    app.factory('Api', ['$state', function($state) {

    	//定义api, Todo:服务端生成
        var makeApi = function(apiType, apiName, apiParams, apiParamsDefault){
            var api = {
                name: apiName,
                apiRegExpMap: apiParams,
                apiType: apiType,
            };
            api.api = apiName;
            var apiRegExpStr = '\\/' + apiName;
            _.forEach(apiParams, function(param){
                apiRegExpStr += '\\/(\\w+)';
                api.api += '/<%= ' + param + ' %>';
            })
            if (apiType === 'stream'){
                apiRegExpMap = apiParams.concat('urlParams');
                apiRegExpStr += '(\\?.*)?';
                api.api += '<%= urlParams %>';
            }
            api.apiRegExp = new RegExp(apiRegExpStr);
            return api;
        }

        var baseUrl = 'http://localhost:8485';
    	var apis = [];
        //'user':'$currentUser'
        apis.push(makeApi('object', 'game', ['game']));
        apis.push(makeApi('stream', 'clients-by-platform', ['platform', 'user']));
        // console.debug(apis);

    	return {
            baseUrl: baseUrl,
    		apis: apis,
            parse: function(apiLink){
                var apiData = {};
                //匹配路由并获得参数
                apiData.api = _.find(apis, function(api) {
                    var matches = api.apiRegExp.exec(apiLink);
                    if (matches){
                        matches.shift();
                        apiData.params = _.zipObject(api.apiRegExpMap, matches);
                        // console.debug('get link data params: ' + JSON.stringify(apiData.params));
                        console.log(api.apiRegExp);
                    }
                    return matches;
                });
                return apiData;
            }
    	};
    }]);
});