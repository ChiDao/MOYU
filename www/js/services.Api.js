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
    apis.push(createApi('object', 'game', ['gameId']));
    apis.push(createApi('object', 'clip', ['clipId']));
    apis.push(createApi('stream', 'user-interests', ['user']));
    apis.push(createApi('stream', 'recent-played-games', ['user']));
    apis.push(createApi('stream', 'clients-by-platform', ['platform']));
    apis.push(createApi('stream', 'recent-user-subscriptions', ['user']));
    apis.push(createApi('stream', 'event-user', ['user'], {'user':'$currentUser'}));
    apis.push(createApi('stream', 'user-clips', ['user']));
    apis.push(createApi('object', 'follow-game', ['game', 'user'], {'user':'$currentUser'}));

    setApiRouteMap('recent-played-games', {'default': 'tab.channels'});
    setApiRouteMap('recent-user-subscriptions', {'default': 'tab.chats'});
    setApiRouteMap('me', {'default': 'tab.profile'});
    setApiRouteMap('game', {'default': 'tab.channel'});
    setApiRouteMap('clip', {
      'default': 'tab.chat',
      'channels': 'tab.channel-chat',
      'chats': 'tab.chat',
      'profile': 'tab.profile-chat',
    });

    console.debug(apis);

    this.$get = function(Restangular, Modal, $state, $stateParams){
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
          apiData.params.apiLink = apiLink;
          var state;
          console.debug(apiData);
          if (apiData.api.routeMap){
            if (context && apiData.api.routeMap[context]){
              state = apiData.api.routeMap[context];
            }else if (apiData.api.routeMap){
              state = apiData.api.routeMap['default'];
            }
          }
          console.debug(apiLink, context, state);
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
          // var newLink = this.baseUrl + '/' + _.template(apiData.api.api, apiData.params).replace('/?', '?');
          var newLink = _.template(apiData.api.api, apiData.params).replace('/?', '?');
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
            if (apiData.api.apiType === 'stream'){
              Restangular.allUrl(newLink).getList().then(function(response){
                scope[scopeDataField] = response.data;
                defer(undefined, scope[scopeDataField]);
              });
            }
            else if (apiData.api.apiType === 'object'){
              return Restangular.oneUrl(newLink).get().then(function(response){
                scope[scopeDataField] = response.data.rawData;
                defer(undefined, scope[scopeDataField]);
              })
            }
          });
        },
        putData: function(apiLink, data){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return false;
          }
          return Thenjs(function(defer){
            Restangular.one(_.template(apiData.api.api, apiData.params)).put(data).then(function(response){
              console.debug('Put data to link:' + JSON.stringify(response));
              defer(undefined, response);
            }, function(error){
              console.debug('Put data to link error:' + JSON.stringify(error));
              defer("Put data to link error:" + JSON.stringify(error));
            });
          });
        }//End of putData
      };
    }; //End of this.$get 
  });
});





            // $http({method:'GET',
            //   url: newLink,
            //   withCredentials: true,
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'X-Requested-With': 'XMLHttpRequest'
            //   }
            // }).success(function(data, status, headers, config){
            //   switch (apiData.api.apiType){
            //     case 'object':
            //       retData = data;
            //     case 'stream':
            //       retData = data.slice?data.slice:[];
            //       retData.meta = _.pick(data, function(value, key){
            //         return key !== 'slice';
            //       });
            //   }
            //   console.debug(retData);
            //   scope[scopeDataField] = retData;
            //   defer(undefined, retData);
            // }).error(function(data, status, headers, config){
            //   defer("http error: " + status);
            // });