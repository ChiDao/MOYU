define(['app'], function(app)
{
  app.provider('Api', function() {

    this.baseUrl = '';
    this.setBaseUrl = function(baseUrl){
      this.baseUrl = baseUrl;
    }

    //定义api, Todo:服务端生成
    var apis = [];
    var createApi = function(apiType, apiName, apiParams, apiContext){
      var api = {
        name: apiName,
        apiRegExpMap: apiParams,
        apiType: apiType,
      };
      api.api = apiName;
      var apiRegExpStr = '\\/' + apiName;
      _.forEach(apiParams, function(param){
        apiRegExpStr += (apiContext && apiContext[param]?'(?:\\/(\\w+))?':'\\/(\\w+)');
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

    var setApiRouteMap = function(apiName, routeMap){
      if (api = _.find(apis, {name:apiName})){
        api.routeMap = routeMap;
      }
    }

    //'user':'$currentUser'
    apis.push(createApi('object', 'home', []));
    apis.push(createApi('object', 'me', [], {'_id':'$currentUser'}));
    apis.push(createApi('object', 'game', ['game']));
    apis.push(createApi('object', 'clip', ['clipId']));
    apis.push(createApi('object', 'recent-played-games', ['user']));
    apis.push(createApi('stream', 'clients-by-platform', ['platform']));
    apis.push(createApi('stream', 'recent-user-subscriptions', ['user']));
    apis.push(createApi('stream', 'event-user', ['user'], {'user':'$currentUser'}));

    setApiRouteMap('recent-played-games', {'default': 'tab.channels'});
    setApiRouteMap('recent-user-subscriptions', {'default': 'tab.chats'});
    setApiRouteMap('me', {'default': 'tab.profile'});
    setApiRouteMap('clip', {
      'default': 'tab.chat',
      'chats': 'tab.chat'
    });

    console.debug(apis);

    this.$get = function($http, Modal, $state, $stateParams){
      return {
        baseUrl: this.baseUrl,
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
        jumpTo: function(apiLink, context){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return false;
          }
          var state;
          console.debug(apiData);
          if (apiData.api.routeMap){
            if (context && context.name && apiData.api.routeMap[context.name]){
              state = apiData.api.routeMap[context.name];
            }else if (apiData.api.routeMap){
              state = apiData.api.routeMap['default'];
            }
          }
          console.debug(state);
          $state.go(state, apiData.params);
        },
        getData: function(apiLink, scope, scopeDataField, options){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return Thenjs(function(defer){defer("Can't find api.");});
          }

          //link
          var newLink = this.baseUrl + '/' + _.template(apiData.api.api, apiData.params).replace('/?', '?');
          if (options && options.random){
            newLink += (/\?/.test(newLink)? '&':'?') + 'r=' + Math.random();
          }
          console.debug(newLink);

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
          return Thenjs(function(defer){
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
              console.debug(retData);
              scope[scopeDataField] = retData;
              defer(undefined, retData);
            }).error(function(data, status, headers, config){
              defer("http error: " + status);
            });
          });
        },

      };
    }; //End of this.$get 
  });
});