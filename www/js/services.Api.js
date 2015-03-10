define(['app', 'services.Modal', 'services.DB'], function(app)
{
  app.provider('Api', function() {

    //定义api, Todo:服务端生成
    var apis = [];
    var createApi = function(apiType, apiName, apiParams, apiContext){
      var api = {
        name: apiName,
        apiType: apiType,
      };
      api.api = apiName;
      var apiRegExpStr = '\\/' + apiName + '\\b';
      if (apiParams){
        api.apiRegExpMap = apiParams[0],
        _.forEach(apiParams[0], function(param){
          apiRegExpStr += (apiContext && apiContext[param]?'(?:\\/([^?\/]+))?':'\\/([^?\/]+)');
          api.api += '/<%= ' + param + ' %>';
        })
      }
      if (_.indexOf(['stream', 'query'], apiType) >= 0){
        api.apiRegExpMap.push('urlParams');
        apiRegExpStr += '(\\?.*)?';
        api.api += '<%= urlParams %>';
      }
      api.apiRegExp = new RegExp(apiRegExpStr, 'i');
      return api;
    }

    var setApiRouteMap = function(apiName, routeMap){
      if (api = _.find(apis, {name:apiName})){
        api.routeMap = routeMap;
      }
    }

    //第三个参数要与api的参数配置一致
    var setApiResource = function(apiName, resource, resourceId){
      if (api = _.find(apis, {name:apiName})){
        api.resource = resource;
        api.resourceId = resourceId;
      }
    }

    var serverApis = this.serverApis = {};
    this.setServerApis = function(paramServerApis){
      _.merge(this.serverApis, paramServerApis);
      
      _.forEach(this.serverApis, function(serverSetting, serverName){
        serverSetting.apis = [];
        _.forEach(serverSetting.apisSetting, function(apiSetting){
          serverSetting.apis.push(createApi(apiSetting[0], apiSetting[1], apiSetting[2], apiSetting[3]));
        })
        if (serverSetting.isDefault){
          serverApis['default'] = serverSetting;
        }
        _.forEach(serverSetting.apiRouteMaps, function(apiRouteMap){
          if (api = _.find(serverSetting.apis, {name: apiRouteMap[0]})){
            api.routeMap = apiRouteMap[1];
          }
        })
        _.forEach(serverSetting.apiModals, function(apiModal){
          if (api = _.find(serverSetting.apis, {name: apiModal[0]})){
            api.modalTemplate = apiModal[1];
            if (apiModal[2]) api.modalFormData = apiModal[2];
          }
        })
        _.forEach(serverSetting.apiResources, function(apiResource){
          if (api = _.find(serverSetting.apis, {name: apiResource[0]})){
            api.resource = apiResource[1];
            api.resourceId = apiResource[2];
          }
        })
      })
      console.debug(this.serverApis);
    }

    var findApi = function(apiName){
      return _.find(serverApis['default'].apis, {name: apiName});
    };

    var buildUrl = function(apiName, paramsMap){
      if (api = findApi(apiName)){
        if (!paramsMap['urlParams']) paramsMap['urlParams'] = '';
        return '/' + _.template(api.api, paramsMap);
      }
    };

    this.$get = function(Restangular, Modal, $state, $stateParams, DB){
      return {
        getRestangular: function(serverName){
          if (serverApis[serverName]){
            if (!serverApis[serverName].Restangular){
              serverApis[serverName].Restangular = Restangular.withConfig(function(RestangularConfigurer) {
                RestangularConfigurer.setBaseUrl(serverApis[serverName].baseUrl);
              });
            }
            return serverApis[serverName].Restangular;
          } else {
            return undefined;
          }
        },
        getMoreAttr: function(serverName, type, order){
          if (serverApis[serverName]){
            if (type === 'query'){
              return serverApis[serverName].streamMeta.next[0];
            } else if (type === 'stream' && order === serverApis[serverName].streamMeta.first[0]){
              return serverApis[serverName].streamMeta.next[0];
            } else {
              return serverApis[serverName].streamMeta.prev[0];
            }
          }
        },
        getMoreDirection: function(serverName, isReverse){
          if (serverApis[serverName]){
            var directions = {
              'asc': {
                'false': 'top',
                'true': 'bottom'
              },
              'desc': {
                'true': 'top',
                'false': 'bottom'
              }
            }
            return directions[serverApis[serverName].lastOrder][isReverse];
          }
        },
        parse: function(apiLink){
          var apiData = {};
          console.log(apiLink);
          var matchApiServer = apiLink.match(/^(\w+)\|/);
          apiData.server = matchApiServer?matchApiServer[1]:'default';
          apiData.serverPrefix = apiData.server?apiData.server + '|':'';
          apiData.Restangular = this.getRestangular(apiData.server);
          //匹配路由并获得参数
          apiData.api = _.find(serverApis[apiData.server].apis, function(api) {
            // console.debug(apiData.server, api, api.apiRegExp, apiLink)
            var matches = api.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              // console.debug(api.apiRegExpMap);
              apiData.params = _.zipObject(api.apiRegExpMap, matches);
              // console.debug('get link data params: ' + JSON.stringify(apiData.params));
              // console.log(api.apiRegExp);
            }
            return matches;
          });
          return apiData;
        },
        getStateUrl: function(){
          var api = _.find(serverApis['default'].apis, function(api) {
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
          var Api = this;
          var getData = _.bind(arguments.callee, this);
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return Thenjs(function(defer){defer("Can't find api.");});
          }
          var serverPrefix = apiData.serverPrefix;

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
              newLink += (/\?/.test(newLink)? '&':'?') + '_last=';
            }
            if (options.count){
              newLink += (/\?/.test(newLink)? '&':'?') + '_count=';
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
                    getData(serverPrefix + data[oper[1].attr], data, oper[0], oper[1].options).then(function(defer){
                      callback(undefined);
                    }, function(defer, error){
                      if (error.status === 404){
                        callback(undefined);
                      } else {
                        callback('itearator get data error', error);
                      }
                    });
                    break;
                  //默认函数
                  case 'function':
                    // console.debug(data[oper[0]]);
                    data[oper[0]] = function(scope, scopeDataField){
                      console.debug(oper);
                      return getData(serverPrefix + data[oper[1].attr], scope, scopeDataField, oper[1].options);
                    }
                    callback(undefined);
                    break;
                  case 'putFunction':
                    data[oper[0]] = _.bind(function(apiLink, data){
                      return this.putData(apiLink, data);
                    }, Api, serverPrefix + data[oper[1].attr]);
                    callback(undefined);
                    break;
                  case 'postFunction':
                    data[oper[0]] = _.bind(function(apiLink, data){
                      return this.postData(apiLink, data);
                    }, Api, serverPrefix + data[oper[1].attr]);
                    callback(undefined);
                    break;
                  case 'exists':
                    // console.debug(]);
                    return getData(serverPrefix + data[oper[1].attr], {}, 'exist').then(function(defer, data){
                      data[oper[1].attr] = true;
                      callback(undefined);
                    }, function(defer, error){
                      data[oper[1].attr] = false;
                      callback(undefined);
                    });
                    break;
                  case 'existsFunction':
                    // console.debug(data[oper[1].attr]);
                    data[oper[0]] = function(callback){
                      return getData(serverPrefix + data[oper[1].attr], {}, 'exist').then(function(defer, data){
                        console.debug(data);
                        callback(true);
                        defer(undefined, true);
                      }, function(defer, error){
                        console.debug(data);
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
                  case 'callback':
                    oper[1].callback(data).then(function(){
                      callback(undefined);
                    });
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
            if (_.indexOf(['stream', 'query'], apiData.api.apiType) >= 0){
              apiData.Restangular.allUrl(newLink).getList().then(function(response){
                if (response.data && response.data.length && serverApis[apiData.server].createStreamMeta){
                  //Todo: 暂时写死，要分析url的参数
                  var tmpLink = newLink.replace(/\?\_last=1/, '').replace(/\?\_prev=\d+/, '');
                  response.data.meta._next = (serverApis['default'].baseUrl + '/' +  tmpLink + (/\?/.test(tmpLink)?'&':'?') + '_next=' + response.data[0].id);
                  response.data.meta._prev = (serverApis['default'].baseUrl + '/'  + tmpLink + (/\?/.test(tmpLink)?'&':'?') + '_prev=' + response.data[response.data.length - 1].id);
                }
                (options&&options.reverse)?response.data.reverse():response.data;
                //生成Url
                _.forEach(response.data, function(data){
                  if (apiData.api.buildUrl){
                    _.forEach(apiData.api.buildUrl, function(buildConfig, newAttr){
                      var paramsMap = {};
                      _.forEach(buildConfig.paramsMap, function(attr, param){
                        paramsMap[param] = data[attr];
                      })
                      data[newAttr] = buildUrl(buildConfig.api, paramsMap);
                    })
                  }
                })
                if (options && options.itearator){
                  //循环处理数据
                  async.each(response.data, function(data, callback){
                    //循环处理iterator
                    iteratorData(data).then(function(iteaDefer){
                      callback();
                    },function(defer, error){
                      callback(error);
                    });
                  }, function(error){
                    if (error){
                      defer(error);
                    }
                    else {
                      scope[scopeDataField] = response.data;
                      defer(undefined, response.data)
                    }
                  })
                }else{
                  scope[scopeDataField] = response.data;
                  defer(undefined, response.data);
                }
              }, function(error){
                defer(error);
              });
            }
            else if (apiData.api.apiType === 'object'){
              apiData.Restangular.oneUrl(newLink).get().then(function(response){
                scope[scopeDataField] = response.data.rawData;
                if (apiData.api.buildUrl){
                  _.forEach(apiData.api.buildUrl, function(buildConfig, newAttr){
                    var paramsMap = {};
                    _.forEach(buildConfig.paramsMap, function(attr, param){
                      paramsMap[param] = response.data.rawData[attr];
                    })
                    response.data.rawData[newAttr] = buildUrl(buildConfig.api, paramsMap);
                  })
                }
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
                defer(error);
              })
            }
          });
        },
        bindList: function(apiLink, scope, scopeDataField, options){
          var apiData = this.parse(apiLink);
          if (!apiData.api || _.indexOf(['stream', 'query'], apiData.api.apiType) < 0){
            console.debug("Can't find stream or query api:", apiLink);
            return undefined;
          }

          var Api = this;
          var bindStruct = {
            apiLink: apiLink,
            scope: scope,
            scopeDataField: scopeDataField,
            options: options,
            clearedOptions: _.omit(options, 'last'),
            moreAttr: this.getMoreAttr(apiData.server, apiData.api.apiType),
            newAttr: apiData.api.apiType === 'stream'?'next':undefined,
            moreDirection: this.getMoreDirection(apiData.server, options.reserve?'true':'false'),
            moreData: [],
            newMoreData: []
          };
          console.debug('bindStruct', bindStruct);

          bindStruct.setDBTable = function(tableName, idCol){
            bindStruct.dbTable = tableName;
            bindStruct.idCol = idCol;
            return DB.flatQueryAll(bindStruct.dbTable)
            .then(function(defer, result){
              bindStruct.scope[bindStruct.scopeDataField] = result;
              defer(undefined);
            }, function(defer, error){
              console.log(error);
              defer(error)
            });
          }

          bindStruct.init = function(){
            //获取首页数据
            return Api.getData(bindStruct.apiLink, bindStruct.scope, bindStruct.scopeDataField, bindStruct.options).then(function(defer, data){
              //缓存下一页数据
              if (bindStruct.dbTable && bindStruct.idCol) DB.flatSave(bindStruct.dbTable, bindStruct.idCol, data);
              var tmp = {};
              Api.getData(apiData.serverPrefix + scope[scopeDataField].meta[bindStruct.moreAttr], tmp, scopeDataField, bindStruct.clearedOptions).then(function(innerDefer, moreData){
                bindStruct.moreData.length = 0
                _.forEach(moreData, function(listItem){
                  bindStruct.moreData.push(listItem);
                })
                scope[scopeDataField].meta[bindStruct.moreAttr] = moreData.meta[bindStruct.moreAttr];
                defer(undefined, data);
              },function(innerDefer, error){
                if (error.status === 404) defer(undefined, data);
                else defer(error);
              })
            }, function(defer, error){
              if (error.status === 404) defer(undefined, error);
              else defer(error);
            });
          };

          bindStruct.refresh = function(){
            var tmp = {};
            // console.debug('fresh data', scope[scopeDataField]);
            return Api.getData(bindStruct.apiLink, tmp, bindStruct.scopeDataField, bindStruct.options).then(function(defer, data){
              if (bindStruct.dbTable && bindStruct.idCol) DB.flatSave(bindStruct.dbTable, bindStruct.idCol, data);
              Api.getData(apiData.serverPrefix + data.meta[bindStruct.moreAttr], tmp, 'scopeDataField', bindStruct.clearedOptions).then(function(innerDefer, moreData){
                bindStruct.moreData.length = 0
                _.forEach(moreData, function(listItem){
                  bindStruct.moreData.push(listItem);
                })
                //改用了merge，但未处理原有属性，后来变为空的情况
                // for(var index = 0; index < data.length; index++){
                //   if (scope[scopeDataField][index]){
                //     _.merge(scope[scopeDataField][index], data[index])
                //   } else {
                //     scope[scopeDataField].push(data[index]);
                //   }
                // }
                bindStruct.scope[bindStruct.scopeDataField].length = 0;
                _.forEach(data, function(listItem){
                  bindStruct.scope[bindStruct.scopeDataField].push(listItem);
                })
                scope[scopeDataField].meta[bindStruct.moreAttr] = moreData.meta[bindStruct.moreAttr];
                defer(undefined, scope[scopeDataField]);
              },function(innerDefer, error){
                if (error.status === 404) {
                  //改用了merge，但未处理原有属性，后来变为空的情况
                  // for(var index = 0; index < data.length; index++){
                  //   if (scope[scopeDataField][index]){
                  //     _.merge(scope[scopeDataField][index], data[index])
                  //   } else {
                  //     scope[scopeDataField].push(data[index]);
                  //   }
                  // }
                  bindStruct.scope[bindStruct.scopeDataField].length = 0;
                  _.forEach(data, function(listItem){
                    bindStruct.scope[bindStruct.scopeDataField].push(listItem);
                  })
                  defer(undefined, scope[scopeDataField]);
                }
                else defer(error);
              })
            }, function(defer, error){
              if (error.status === 404) defer(undefined, error);
              else {
                console.debug('fresh data error', scope[scopeDataField]);
                defer(error);
              }
            });
          };

          bindStruct.moreGetData = function(){
            var tmp = {};
            if (!bindStruct.moreData.length) return Thenjs(function(defer){defer(undefined);});
            var options = _.omit(bindStruct.options, 'last');
            return Api.getData(apiData.serverPrefix + scope[scopeDataField].meta[bindStruct.moreAttr], bindStruct, 'newMoreData', options).then(function(defer, newMoreData){
              defer(undefined, newMoreData);
            }, function(defer, error){
              bindStruct.newMoreData = error;
              if (error.status === 404){
                defer(undefined, error);
              }
              else{
                console.debug('get more data error');
                defer(error);
              }
            });
          }

          bindStruct.moreUpdateData = function(){
            if (!_.isArray(bindStruct.newMoreData) && bindStruct.newMoreData.status != 404) defer(bindStruct.newMoreData);
            var targetStruct = bindStruct.scope[bindStruct.scopeDataField];
            console.debug('get more data', bindStruct.moreAttr, targetStruct.meta[bindStruct.moreAttr]);
            var listItem;
            //更新数据
            if (bindStruct.moreDirection === 'top'){
              console.debug('tmpHash',1,options.reserve,bindStruct.moreAttr)
              while(listItem = bindStruct.moreData.pop()){
                targetStruct.unshift(listItem);
              }
            } else {
              console.debug('tmpHash',2, options.reserve,bindStruct.moreAttr)
              while(listItem = bindStruct.moreData.shift()){
                targetStruct.push(listItem);
              }
            }
            if (_.isArray(bindStruct.newMoreData)){
              _.forEach(bindStruct.newMoreData, function(listItem){
                bindStruct.moreData.push(listItem);
              })
              targetStruct.meta[bindStruct.moreAttr] = bindStruct.newMoreData.meta[bindStruct.moreAttr];
            }
          }

          bindStruct.more = function(){
            return bindStruct.moreGetData().then(function(defer){
              bindStruct.moreUpdateData();
              defer(undefined);
            }, function(defer, error){
              defer(error);
            });
          }

          bindStruct.newer = function(){
            var tmp = {};
            var targetStruct = bindStruct.scope[bindStruct.scopeDataField];
            console.debug('get new data', bindStruct.moreAttr, targetStruct.meta[bindStruct.newAttr]);
            return Api.getData(apiData.serverPrefix + targetStruct.meta[bindStruct.newAttr], tmp, 'scopeDataField', bindStruct.clearedOptions).then(function(defer, data){
              _.forEach(data, function(listItem){
                targetStruct.push(listItem);
              })
              targetStruct.meta[bindStruct.newAttr] = data.meta[bindStruct.newAttr];
              console.debug(targetStruct, data)
              defer(undefined, data);
            }, function(defer, error){
              if (error.status === 404) defer(undefined, undefined);
              else {
                console.debug('get newer data error', targetStruct);
                defer(error);
              }
            });
          };


          return bindStruct;

          // if (!scope[scopeDataField]){
          //   return this.getData(apiLink, scope, scopeDataField, options);
          // }
        },
        postData: function(apiLink, data){
          //get api
          var apiData = this.parse(apiLink);
          if (!apiData.api){
            console.debug("Can't find api:", apiLink);
            return false;
          }
          return Thenjs(function(defer){
            apiData.Restangular.all(_.template(apiData.api.api, apiData.params)).post(data).then(function(response){
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
            apiData.Restangular.one(_.template(apiData.api.api, apiData.params)).doPUT(data).then(function(response){
              console.debug('Put data to link:' + JSON.stringify(response));
              defer(undefined, response);
            }, function(error){
              console.debug('Put data to link error:' + JSON.stringify(error));
              defer(error);
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
          return apiData.Restangular.oneUrl(_.template(apiData.api.api, apiData.params)).remove().then(function(response){
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
              apiData.Restangular.all(_.template(apiData.api.api, apiData.params)).post(scope.formData).then(function(data){
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
          console.debug(apiData.api.modalTemplate);
          Modal.okCancelModal(apiData.api.modalTemplate, options, eventHandles);
        },//End of postModal
      };
    }; //End of this.$get 
  });
});
