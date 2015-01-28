define(['app', 'services.Modal'], function(app)
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

    var setApiModal = function(apiName, modalTemplate, modalFormData){
      if (api = _.find(apis, {name:apiName})){
        api.modalTemplate = modalTemplate;
        if (modalFormData) api.modalFormData = modalFormData;
      }
    }

    //第三个参数要与api的参数配置一致
    var setApiResource = function(apiName, resource, resourceId){
      if (api = _.find(apis, {name:apiName})){
        api.resource = resource;
        api.resourceId = resourceId;
      }
    }

    //Entity
    apis.push(createApi('object', 'user', ['userId']));
    apis.push(createApi('object', 'game', ['gameId']));
    apis.push(createApi('object', 'clip', ['clipId']));
    //User
    apis.push(createApi('stream', 'signup', []));
    apis.push(createApi('stream', 'pre-register', []));
    apis.push(createApi('object', 'home', []));
    apis.push(createApi('object', 'me', [], {'_id':'$currentUser'}));
    apis.push(createApi('stream', 'event-user', ['user'], {'user':'$currentUser'}));
    //game client
    apis.push(createApi('stream', 'game-clients', ['game']));
    apis.push(createApi('object', 'follow-game', ['game', 'user'], {'user':'$currentUser'}));
    apis.push(createApi('stream', 'recent-played-games', ['user']));
    apis.push(createApi('stream', 'clients-by-platform', ['platform']));
    //clip comments
    apis.push(createApi('stream', 'new-clip', ['game'], {'user':'$currentUser'}));
    apis.push(createApi('stream', 'game-clips', ['game']));
    apis.push(createApi('stream', 'user-clips', ['user']));
    apis.push(createApi('stream', 'user-interests', ['user']));
    apis.push(createApi('object', 'follow-clip', ['clip', 'user'], {'user':'$currentUser'}));
    apis.push(createApi('stream', 'recent-user-subscriptions', ['user']));
    apis.push(createApi('stream', 'clip-comments', ['clip']));
    apis.push(createApi('object', 'new-comment', ['clip'], {'user':'$currentUser'}));

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
    setApiModal('signup', 'templates/modal-signup.html', {email: ''});
    setApiModal('pre-register', 'templates/modal-login.html', {password: ''});
    setApiModal('new-clip', 'templates/modal-new-clip.html');

    //第三个参数要与api的参数配置一致
    setApiResource('new-comment', 'clip', 'clip');

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
        getStateUrl: function(){
          var api = _.find(apis, function(api) {
            return api.routeMap && _.indexOf(_.values(api.routeMap), $state.current.name) >= 0;
          });
          if (!api){
            console.debug("No api map to the state");
            return undefined;
          }else{
            return '/' + _.template(api.api, $stateParams);
          }
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
          var parse = this.parse;
          var getData = function(apiLink, scope, scopeDataField, options){
            //get api
            var apiData = parse(apiLink);
            if (!apiData.api){
              console.debug("Can't find api:", apiLink);
              return Thenjs(function(defer){defer("Can't find api.");});
            }

            //link
            // var newLink = this.baseUrl + '/' + _.template(apiData.api.api, apiData.params).replace('/?', '?');
            var newLink = _.template(apiData.api.api, apiData.params)
              .replace('/?', '?')
              .replace(/\&r=0\.\d+|r=0\.\d+\&/, '')
              .replace(/single=true\&|\&single=true/, '');
            if (options){
              if (options.random){
                newLink += (/\?/.test(newLink)? '&':'?') + 'r=' + Math.random();
              }
              if (options.last){
                newLink += (/\?/.test(newLink)? '&':'?') + '_last';
              }
            }
            console.debug(newLink);

            var iteratorData = function(data){
              return Thenjs(function(defer){
                async.each(_.pairs(options.itearator), function(oper,callback){
                  // console.debug("getData itea", oper);
                  switch (oper[1].type){
                    //获取数据
                    case 'getData':
                      // console.debug("oper", oper);
                      getData(data[oper[1].attr], data, oper[0], oper[1].options).then(function(defer){
                        callback(undefined);
                      }, function(defer, error){
                        callback('itearator get data error', error);
                      });
                      break;
                    //默认函数
                    case 'function':
                      // console.debug(data[oper[0]]);
                      data[oper[0]] = function(scope, scopeDataField){
                        return getData(data[oper[1].attr], scope, scopeDataField, oper[1].options);
                      }
                      callback(undefined);
                      break;
                    case 'putFunction':
                      data[oper[0]] = function(data){
                        return this.putData(data[oper[1].attr], data);
                      }
                      callback(undefined);
                      break;
                    case 'existsFunction':
                      // console.debug(data[oper[1].attr]);
                      data[oper[0]] = function(callback){
                        return getData(data[oper[1].attr], {}, 'exist').then(function(defer){
                          callback(true);
                          defer(undefined, true);
                        }, function(defer){
                          callback(false);
                          defer(undefined, false);
                        });
                      }
                      callback(undefined);
                      break;
                    case 'const':
                      data[oper[0]] = oper[1].value;
                      callback(undefined);
                      break;
                    case 'transfer':
                      data[oper[0]] = oper[1].transfer(data[oper[1].attr]);
                      callback(undefined);
                      break;
                    default:
                      callback("can't find itearator operator: " + oper[1].type);
                  }
                }, function(error){
                  if (error) defer(error, error);
                  else defer(undefined);
                });
              })
            };

            //get data
            var retData;
            return Thenjs(function(defer){
              if (apiData.api.apiType === 'stream'){
                Restangular.allUrl(newLink).getList().then(function(response){
                  scope[scopeDataField] = response.data;
                  if (options && options.itearator){
                    //循环处理数据
                    async.each(scope[scopeDataField], function(data, callback){
                      // console.debug("getData data", data)
                      //虚幻处理iterator
                      iteratorData(data).then(function(defer){
                        callback(undefined);
                      },function(defer, error){
                        callback(error);
                      });
                    }, function(error){
                      if (error) defer(error);
                      else defer(undefined)
                    })
                  }else{
                    defer(undefined, response.data);
                  }
                }, function(error){
                  defer('Get list error', error);
                });
              }
              else if (apiData.api.apiType === 'object'){
                Restangular.oneUrl(newLink).get().then(function(response){
                  scope[scopeDataField] = response.data.rawData;
                  if (options && options.itearator){
                    iteratorData(scope[scopeDataField]).then(function(){
                      defer(undefined, scope[scopeDataField]);
                    },function(defer, error){
                      defer(error);
                    });
                  }else{
                    defer(undefined, scope[scopeDataField]);
                  }
                }, function(error){
                  defer('Get list error', error);
                })
              }
            });
          };
          return getData(apiLink, scope, scopeDataField, options);
        },
        postData: function(apiLink, data){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return false;
          }
          return Thenjs(function(defer){
            Restangular.all(_.template(apiData.api.api, apiData.params)).post(data).then(function(response){
              console.debug('Post data to link:' + JSON.stringify(response));
              defer(undefined, response);
            }, function(error){
              console.debug('Post data to link error:' + JSON.stringify(error));
              defer("Post data to link error:" + JSON.stringify(error));
            });
          });
        },//End of putData
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
        },//End of putData
        deleteData: function(apiLink){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return false;
          }
          return Restangular.oneUrl(_.template(apiData.api.api, apiData.params)).remove().then(function(response){
            console.debug('Delete data from link:' + JSON.stringify(response));
          }, function(error){
            console.debug('Delete data from link error:' + JSON.stringify(error));
          })
        },
        postModal: function(apiLink, options, eventHandles){
          var options = options || {};
          var eventHandles = eventHandles || {};
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return Thenjs(function(defer){
              defer("Can't find api");
            });
          }
          //初始化表单数据
          var tmpInitFunc = _.isFunction(eventHandles.init)? _.clone(eventHandles.init):function(){};
          eventHandles.init = function(scope){
            scope.formData = apiData.api.modalFormData;
            tmpInitFunc(scope);
          }
          var tmpOkFunc = _.isFunction(eventHandles.onOk)?eventHandles.onOk:function(){
            return Thenjs(function(defer){
              defer(undefined);
            })
          };
          eventHandles.onOk = function(form, scope){
            //校验表单是否正确
            if (form.$invalid) return;
            //回调传入的onOk函数
            tmpOkFunc(form, scope).then(function(defer){
              console.log('Commit form data:' + JSON.stringify(scope.formData));
              Restangular.all(_.template(apiData.api.api, apiData.params)).post(scope.formData).then(function(data){
                console.log('Commit success, get data:', data.data.rawData);
                //提交成功
                if (_.isFunction(eventHandles.onSuccess)){
                  eventHandles.onSuccess(form, scope, data.data.rawData);
                  defer(null);
                }
                //提交失败
                else{
                  scope.hideModal();
                  defer("Commit form error");
                }
              }, function(error){
                console.log('Commit form error:' + JSON.stringify(error));
                if (_.isFunction(eventHandles.onError)){
                  eventHandles.onError(error, form, scope);
                  defer("Commit form error");
                }
              })
            })
          }
          Modal.okCancelModal(apiData.api.modalTemplate, options, eventHandles);
        },//End of postModal
      };
    }; //End of this.$get 
  });
});




          // //http config
          // var httpConfig = {
          //   method:'GET',
          //   url: newLink,
          //   withCredentials: true,
          //   headers: {
          //     'Content-Type': 'application/json',
          //     'X-Requested-With': 'XMLHttpRequest',
          //     'Authorization': 'Bearer '+ localStorage.getItem('my-xsrf-header'),
          //   }
          // };


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