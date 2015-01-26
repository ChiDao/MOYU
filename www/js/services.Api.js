define(['app'], function(app)
{
  app.factory('Api', ['$state', '$http', function($state, $http) {

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
        api.apiRegExpMap.push('urlParams');
        apiRegExpStr += '(\\?.*)?';
        api.api += '<%= urlParams %>';
      }
      api.apiRegExp = new RegExp(apiRegExpStr);
      return api;
    }

    var baseUrl = 'http://localhost:8485';
    var apis = [];
    //'user':'$currentUser'
    apis.push(makeApi('object', 'home', []));
    apis.push(makeApi('object', 'game', ['game']));
    apis.push(makeApi('stream', 'clients-by-platform', ['platform']));
    apis.push(makeApi('stream', 'recent-user-subscriptions', ['user']));
    console.debug(apis);

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
            // console.debug(api.apiRegExpMap);
            apiData.params = _.zipObject(api.apiRegExpMap, matches);
            // console.debug('get link data params: ' + JSON.stringify(apiData.params));
            console.log(api.apiRegExp);
          }
          return matches;
        });
        return apiData;
      },
      getData: function(apiLink, options){
        //get api
        var apiData = this.parse(apiLink);
        if (!apiData.api){
          console.debug("Can't find api:", apiLink);
          return Thenjs(function(defer){defer(undefined);});
        }

        //link
        var newLink = baseUrl + '/' + _.template(apiData.api.api, apiData.params);
        if (options && options.shouldAddRandom){
          newLink += (/\?/.test(newLink)? '&':'?') + 'r=' + Math.random();
        }

        //http config
        var httpConfig = {
          method:'GET',
          url: newLink,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': 'Bearer '+ localStorage.getItem('my-xsrf-header'),
          }
        };

        //get data
        var retData;
        Thenjs(function(defer){
          $http({method:'GET',
            url: newLink,
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          }).success(function(data, status, headers, config){
            switch (apiData.api.apiType){
              case 'object':
                retData = data;
              case 'stream':
                retData = data.slice?data.slice:[];
                retData.meta = _.pick(data, function(value, key){
                  return key !== 'slice';
                });
            }
            // console.debug(retData);
            defer(undefined, retData);
          }).error(function(data, status, headers, config){
            defer(status);
          });
        });
      }
    };
  }]);
});