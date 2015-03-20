define(['app'], function(app)
{
  app.factory('ApiEvent', ['$rootScope', 'Auth', '$timeout', 'Api', '$state',
    function($rootScope, Auth, $timeout, Api, $state) {

      console.log('Load ApiEvent Service');
      var tmp = {};
      var lastEventId = localStorage.getItem('lastEventId');
      var apiCallbacks = {};
      var resourceCallbacks = {};
      var bindUrls = [];

      if (lastEventId === null) 
          lastEventId = '';

      //执行回调函数
      var runCallbacks = function(events){
        _.forEach(events, function(event){
          event.apiData = Api.parse(event.path);
          event.resourceId = event.apiData.params[event.apiData.api.resourceId];
        });

        _.forEach(_.uniq(events, function(event){
          return event.apiData.api;
        }), function(event){
          if (event.apiData.api){
            //根据api进行注册的回调函数
            if (apiCallbacks[event.apiData.api.name]){
              _.forEach(apiCallbacks[event.apiData.api.name], function(callback){
                callback(event);
              })
            }
          }
        });

        //先去重然后执行
        _.forEach(_.uniq(events, function(event){
          return '' + event.apiData.api.resource + '-' + event.resourceId;
        }), function(event){
          if (event.apiData.api){
            //根据资源进行注册的回调函数
            var tmpResourceCallbacks = resourceCallbacks[event.apiData.api.resource];
            var resourceId = event.resourceId;
            console.debug(tmpResourceCallbacks , event.apiData.params, resourceId , tmpResourceCallbacks[resourceId])
            if (tmpResourceCallbacks && resourceId && tmpResourceCallbacks[resourceId]){
              console.debug(tmpResourceCallbacks , resourceId , tmpResourceCallbacks[resourceId])
              _.forIn(tmpResourceCallbacks[resourceId], function(callback){
                callback(event);
              })
            }
          };
        });
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
                  runCallbacks(tmp.events);
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
      // console.debug(Auth.currentUser().userData.homeData.upload);
      console.debug("Auth.isLoggedIn()", Auth.isLoggedIn(), Auth.currentUser().userData.homeData.event);
      if (Auth.isLoggedIn()) request(Auth.currentUser().userData.homeData.event + '?_last', true);

      //路由改变，清楚绑定路由的注册
      $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        var url = _.template(fromState.url.replace(/:(\w+)/g, "<%= $1 %>"), fromParams);
        console.debug(resourceCallbacks)
        _.forIn(resourceCallbacks, function(aResourceCallbacks){
          // console.debug(aResourceCallback)
          _.forIn(aResourceCallbacks, function(resourceCallbacks){
            // console.debug(resourceCallbacks);
            _.forIn(resourceCallbacks, function(callback, key){
              // console.debug(callback, key)
              if (key, url + '-', key.indexOf(url + '-') >= 0){
                delete resourceCallbacks[key];
              }
            })
          });
        })
      });

      return {
        //检查是否有新的评论
        checkedNewEvent: function(){
          // console.debug("checkedNewEvent: " + lastEventId);
          return Thenjs(function(defer){
            if (!lastEventId){
              // console.debug('checkedNewEvent 1');
              Api.getData(Auth.currentUser().userData.homeData.event + '?_last', tmp, 'events').then(function(){
                if (tmp.events.length > 0){ 
                  var tmpLastEventId = tmp.events[tmp.events.length - 1]._id;
                  lastEventId = tmpLastEventId;
                  localStorage.setItem('lastEventId', lastEventId);
                  defer(undefined, false);
                }
              });
            }else{
              // console.debug('checkedNewEvent 2');
              Api.getData(Auth.currentUser().userData.homeData.event + '?_last', tmp, 'events').then(function(){
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
          Api.getData(Auth.currentUser().userData.homeData.event + '?_last', tmp, 'events').then(function(){
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
        //注册资源回调函数
        registerByResource: function(resourceName, resourceId, callback, bindId){
          if (!resourceCallbacks[resourceName]) resourceCallbacks[resourceName] = {};
          if (!resourceCallbacks[resourceName][resourceId]) resourceCallbacks[resourceName][resourceId] = [];
          if (bindId){
            var url = _.template($state.current.url.replace(/:(\w+)/g, "<%= $1 %>"), $state.current.params);
            resourceCallbacks[resourceName][resourceId][url+ '-' + bindId] = callback;
          } else {
            resourceCallbacks[resourceName][resourceId][''+(new Date).getTime()] = callback;
          }
        }
      }
    }
  ]);

});
