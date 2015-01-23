define(['app', 'services.Modal'], function(app)
{
    app.provider('RestRoute', function($stateProvider) {
    // Might use a resource here that returns a JSON array

    var apiConfigs = [
      {
        name: 'game',
        apiRegExp: /\/game\/(\w+)/,
        apiRegExpMap: ['gameId'],
        api: 'game/<%= gameId %>',
        apiType: 'detail',
        state: 'app.game',
      },
      {
        name: 'client',
        apiRegExp: /\/client\/(\w+)/,
        apiRegExpMap: ['clentId'],
        api: 'client/<%= clentId %>',
        apiType: 'detail',
      },
      {
        name: 'game-clients-order',
        apiRegExp: /\/game-clients\/(\w+).*(_first|_last)\=/,
        apiRegExpMap: ['gameId', 'order'],
        api: 'game-clients/<%= gameId %>?<%= order %>=',
        apiType: 'list',
      },
      {
        name: 'game-clients',
        apiRegExp: /\/game-clients\/(\w+)/,
        apiRegExpMap: ['gameId'],
        api: 'game-clients/<%= gameId %>',
        apiType: 'detail',
      },
      {
        name: 'clients-by-platform-last',
        apiRegExp: /\/clients-by-platform\/(\w+)\?_last/,
        apiRegExpMap: ['platform'],
        api: 'clients-by-platform/<%= platform %>\?_last',
        apiType: 'list',
      },
      {
        name: 'game-clips-last',
        apiRegExp: /\/game-clips\/(\w+)\?_last/,
        apiRegExpMap: ['clientId'],
        api: 'game-clips/<%= clientId %>\?_last',
        apiType: 'list',
      },
      {
        name: 'user',
        apiRegExp: /\/user\/(\w+)/,
        apiRegExpMap: ['userId'],
        api: 'user/<%= userId %>',
        apiType: 'detail',
      },
      {
        name: 'user-clips-last',
        apiRegExp: /\/user-clips\/(\w+)\?.*_last/,
        apiRegExpMap: ['userId'],
        api: 'user-clips/<%= userId %>\?_last',
        apiType: 'list',
      },
      {
        name: 'user-clips',
        apiRegExp: /\/user-clips\/(\w+)/,
        apiRegExpMap: ['userId'],
        api: 'user-clips/<%= userId %>',
        apiType: 'detail',
      },
      {
        name: 'recent-user-subscriptions',
        apiRegExp: /\/recent-user-subscriptions\/(\w+)\?_start=0/,
        apiRegExpMap: ['userId'],
        api: 'recent-user-subscriptions/<%= userId %>?_start=0',
        apiType: 'list',
      },
      {
        name: 'user-subscriptions-last',
        apiRegExp: /\/user-subscriptions\/(\w+)\?_last/,
        apiRegExpMap: ['userId'],
        api: 'user-subscriptions/<%= userId %>?_last',
        apiType: 'list',

        getData: [
          {
            name: 'game',
            deps: [],
            attr: 'game',
            saveAs: 'game',
          }
        ]
        // getAttrData: [
          // {
          //   name: 'game',
          //   deps: ['apiDataField'],
          //   attr: 'game',
          //   saveAs: 'game'
          // },
          // {
          //   name: 'clients-last',
          //   deps: ['clients'],
          //   attr: 'last',
          //   options: {
          //     extraFilter: {
          //       platform: 'local.platform'
          //     },
          //     toDetail: true
          //   }
          // },
        // ]
      },
      {
        name: 'clip',
        apiRegExp: /\/clip\/(\w+)/,
        apiRegExpMap: ['clipId'],
        api: 'clip/<%= clipId %>',
        apiType: 'detail',
      },
      {
        name: 'clip-comments-last',
        apiRegExp: /\/clip-comments\/(\w+)\?_last/,
        apiRegExpMap: ['clipId'],
        api: 'clip-comments/<%= clipId %>?_last',
        apiType: 'list',
      },
      {
        name: 'clip-comments-next',
        apiRegExp: /\/clip-comments\/(\w+)\?.*_next=(\w+)/,
        apiRegExpMap: ['clipId', 'commentId'],
        api: 'clip-comments/<%= clipId %>?_next=<%= commentId %>',
        apiType: 'list',
      },
      {
        name: 'follow-clip',
        apiRegExp: /\/follow-clip\/(\w+)/,
        apiRegExpMap: ['clipId'],
        api: 'follow-clip/<%= clipId %>',
        apiType: 'detail',
      },
      {
        name: 'event-user-last',
        apiRegExp: /\/event-user\?_last/,
        apiRegExpMap: [],
        api: 'event-user?_last',
        apiType: 'list',
      },
      {
        name: 'event-user-next',
        apiRegExp: /\/event-user\?.+_next=(\w+)/,
        apiRegExpMap: ['lastEventId'],
        api: 'event-user?_next=<%= lastEventId %>',
        apiType: 'list',
      },
      {
        name: 'recent-played-games',
        apiRegExp: /\/recent-played-games\/(\w+)?.*_start=(\d+)/,
        apiRegExpMap: ['userId', 'startNum'],
        api: 'recent-played-games/<%= userId %>?_start=<%= startNum %>',
        apiType: 'list',
      },
      {
        name: 'user-interests-last',
        apiRegExp: /\/user-interests\/(\w+)?.*_last=/,
        apiRegExpMap: ['userId'],
        api: 'user-interests/<%= userId %>?_last=',
        apiType: 'list',
      },
      {
        name: 'user-interests-count',
        apiRegExp: /\/user-interests\/(\w+)?.*_count=/,
        apiRegExpMap: ['userId'],
        api: 'user-interests/<%= userId %>?_count=',
        apiType: 'list',
      },
      {
        name: 'user-interests',
        apiRegExp: /\/user-interests\/(\w+)/,
        apiRegExpMap: ['userId'],
        api: 'user-interests/<%= userId %>',
        apiType: 'detail',
      },
      
      //---------
      //  POST
      //---------
      {
        name: 'follow-game',
        apiRegExp: /\/follow-game\/(\w+)/,
        apiRegExpMap: ['gameId'],
        api: 'follow-game/<%= gameId %>',
        apiType: 'post',
      },
      {
        name: 'new-comment',
        apiRegExp: /\/new-comment\/(\w+)/,
        apiRegExpMap: ['clipId'],
        api: 'new-comment/<%= clipId %>',
        apiType: 'post',
        resource: 'clip',
        resourceId: 'clipId'
      },
      {
        name: 'signup',
        apiRegExp: /\/signup/,
        api: 'signup',
        apiType: 'postModal',
        modalFormData: {email: ''}, 
        modalTemplate: 'templates/modal-signup.html',
      },
      {
        name: 'pre-register',
        apiRegExp: /\/pre-register/,
        api: 'pre-register',
        apiType: 'postModal',
        modalFormData: {password: ''}, 
        modalFormDataMap: {email: 'email'},
        modalTemplate: 'templates/modal-login.html',
      },
      {
        name: 'new-clip',
        apiRegExp: /\/new-clip\/(\w+)/,
        apiRegExpMap: ['clientId'],
        api: 'new-clip/<%= clientId %>',
        apiType: 'postModal',
        modalTemplate: 'templates/modal-new-clip.html',
      },
      {
        name: 'new-subscribe',
        apiRegExp: /\/new-subscribe\/(\w+)/,
        apiRegExpMap: ['clipId'],
        api: 'new-subscribe/<%= clipId %>',
        apiType: 'post',
      },

      //---------
      //  DELETE
      //---------
      {
        name: 'subscribe-edit',
        apiRegExp: /\/subscribe-edit\/(\w+)/,
        apiRegExpMap: ['subscribeId'],
        api: 'subscribe-edit/<%= subscribeId %>',
        apiType: 'delete',
      },
    ];

    this.$get = function(Restangular, Modal, $state, $stateParams){
      return {
        apiConfigs: apiConfigs,
        parseApiLink: function(apiLink){
          var apiData = {};
          //匹配路由并获得参数
          apiData.apiConfig = _.find(apiConfigs, function(apiConfig) {
            // console.debug(apiConfig.apiRegExp, apiConfig.apiRegExp.exec(apiLink));
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              apiData.params = _.zipObject(apiConfig.apiRegExpMap, matches);
              // console.debug('get link data params: ' + JSON.stringify(apiData.params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          return apiData;
        },
        getData: function($scope, scopeDataField){
          var getLinkData = this.getLinkData;
          //获取当前路由对应的api数据
          return Thenjs(function(defer){
            scopeDataField = scopeDataField || 'apiData';
            $scope.apiDataField = scopeDataField;
            var apiConfig = _.find(apiConfigs, function(apiConfig) {
              return apiConfig.state == $state.current.name;
            });
            if (apiConfig.apiType === 'list'){
              Restangular.allUrl(_.template(apiConfig.api,$stateParams)).getList().then(function(response){
                $scope[scopeDataField] = response.data;
                defer(undefined, apiConfig);
              });
            }
            else if (apiConfig.apiType === 'detail'){
              Restangular.oneUrl(_.template(apiConfig.api,$stateParams)).get().then(function(response){
                $scope[scopeDataField] = response.data.rawData;
                defer(undefined, apiConfig);
              });
            }
          })
          .then(function(defer, apiConfig){
            //获取属性设置的数据
            if (apiConfig['getAttrData']){
              var solvedAttrs = ['apiDataField'];
              var tmpData = {};
              var fetchData = function(){
                var tmpAttrData = [];
                //查找未获取且依赖已解决的属性
                _.forEach(apiConfig['getAttrData'], function(attrData){
                  if (!_.contains(solvedAttrs, attrData.name) && !_.difference(attrData.deps, solvedAttrs).length){
                    tmpAttrData.push(attrData);
                  }
                });
                async.each(tmpAttrData, function(attrData,callback){
                  console.log(attrData.name);
                  var apiLink;
                  //检查属性是否存在
                  if (attrData.deps[0] === 'apiDataField'){
                    if (!_.has($scope[$scope.apiDataField], attrData.attr)){
                      callback("Api attr " + attrData.attr + " not found");
                    }else{
                      apiLink = $scope[$scope.apiDataField][attrData.attr];
                    }
                  }
                  else {
                    if (!_.has(tmpData[attrData.deps[0]], attrData.attr)){
                      callback("Temp attr " + attrData.attr + " not found");
                    }else{
                      apiLink = tmpData[attrData.deps[0]][attrData.attr];
                    }
                  }
                  //获取数据
                  console.debug('Getting link data: ' + apiLink);
                  var getDataThen = getLinkData(apiLink, tmpData, attrData.name, attrData.options);
                  getDataThen.then(function(){
                    if (attrData.saveAs){
                      $scope[attrData.saveAs] = tmpData[attrData.name];
                    }
                    solvedAttrs.push(attrData.name);
                    callback(undefined);
                  })
                }, function(error){
                  if (error){
                    defer(error);
                    return;
                  }
                  console.log(solvedAttrs);

                  // 还有未处理的属性
                  if (solvedAttrs.length != apiConfig['getAttrData'].length + 1){
                    fetchData();
                  }
                  else{
                    defer(undefined);
                  }
                });

              };
              fetchData();
            }
            else{
              defer(undefined);
            }
          });
        },
        getAttrData: function(attr, $scope, scopeDataField){
          if (_.has($scope, 'apiDataField') && _.has($scope[$scope.apiDataField], attr)){
            return this.getLinkData($scope[$scope.apiDataField][attr], $scope, scopeDataField);
          }
        },
        getLinkData: function(apiLink, $scope, scopeDataField, options){
          var params;
          var options = options || {};
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            // console.debug(apiConfig.apiRegExp, apiConfig.apiRegExp.exec(apiLink));
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
              // console.debug('get link data params: ' + JSON.stringify(params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          if (!apiConfig) {
            console.log("Can't get link's data: "+ apiLink);
            return {
              then: function(callback){
                callback();
              }
            };
          };
          // console.debug('get data from link: ' + _.template(apiConfig.api, params)); 
          if (apiConfig.apiType === 'list'){
            return Restangular.allUrl(_.template(apiConfig.api, params)).getList().then(function(response){
              // console.debug('get link data options: ' + JSON.stringify(options)); 
              // console.log(JSON.stringify(response.data.meta));
              var tmpData = response.data;
              var filter = {};
              _.forOwn(options.extraFilter, function(rule, fieldName){
                if (rule === 'local.platform'){
                  var platform = ionic.Platform.isWebView()?ionic.Platform.platform():'ios';
                  filter[fieldName] = platform;
                }
              });
              // console.debug('get link data filter:' + JSON.stringify(filter));
              if (_.keys(filter).length) tmpData = _.filter(tmpData, filter);
              if (options.toDetail){
                $scope[scopeDataField] = tmpData[0];
              }else{
                $scope[scopeDataField] = tmpData;
              }
              // console.debug('get link data:' + JSON.stringify($scope[scopeDataField]));
            });
          }
          else if (apiConfig.apiType === 'detail'){
            return Restangular.oneUrl(_.template(apiConfig.api, params)).get().then(function(response){
              $scope[scopeDataField] = response.data.rawData;
              // console.debug('get link data:' + JSON.stringify($scope[scopeDataField]));
            })
          }
        },
        postDataToLink: function(apiLink, data){
          var params;
          var options = options || {};
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            // console.debug(apiConfig.apiRegExp, apiConfig.apiRegExp.exec(apiLink));
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
              console.debug('Post data to link params: ' + JSON.stringify(params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          if (!apiConfig) {
            console.log("Can't post data to link: "+ apiLink);
            return {
              then: function(callback){
                callback();
              }
            };
          };
          return Thenjs(function(defer){
            Restangular.allUrl(_.template(apiConfig.api, params)).post(data).then(function(response){
              console.debug('Post data to link:' + JSON.stringify(response));
              defer(undefined, response);
            }, function(error){
              console.debug('Post data to link error:' + JSON.stringify(error));
              defer("Post data to link error:" + JSON.stringify(error));
            });
          });
        },
        putDataToLink: function(apiLink, data){
          var params;
          var options = options || {};
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            // console.debug(apiConfig.apiRegExp, apiConfig.apiRegExp.exec(apiLink));
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
              console.debug('Post data to link params: ' + JSON.stringify(params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          if (!apiConfig) {
            console.log("Can't post data to link: "+ apiLink);
            return {
              then: function(callback){
                callback();
              }
            };
          };
          return Thenjs(function(defer){
            Restangular.one(_.template(apiConfig.api, params)).put(data).then(function(response){
              console.debug('Put data to link:' + JSON.stringify(response));
              defer(undefined, response);
            }, function(error){
              console.debug('Put data to link error:' + JSON.stringify(error));
              defer("Put data to link error:" + JSON.stringify(error));
            });
          });
        },
        deleteDataFromLink: function(apiLink){
          var params;
          var options = options || {};
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            // console.debug(apiConfig.apiRegExp, apiConfig.apiRegExp.exec(apiLink));
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
              console.debug('Post data to link params: ' + JSON.stringify(params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          if (!apiConfig) {
            console.log("Can't post data to link: "+ apiLink);
            return {
              then: function(callback){
                callback();
              }
            };
          };
          return Restangular.oneUrl(_.template(apiConfig.api, params)).remove().then(function(response){
            console.debug('Delete data from link:' + JSON.stringify(response));
          }, function(error){
            console.debug('Delete data from link error:' + JSON.stringify(error));
          })

        },
        //根据api跳转到对应的state
        jumpToLink: function(apiLink){
          var params;
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
            }
            return matches;
          });
          if (apiConfig){
            $state.go(apiConfig.state, params);
          }
        },
        postModal: function(apiLink, options, eventHandles){
          var options = options || {};
          var eventHandles = eventHandles || {};
          var params;
          //匹配路由并获得参数
          var apiConfig = _.find(apiConfigs, function(apiConfig) {
            var matches = apiConfig.apiRegExp.exec(apiLink);
            if (matches){
              matches.shift();
              params = _.zipObject(apiConfig.apiRegExpMap, matches);
              console.debug('get link data params: ' + JSON.stringify(params));
              console.log(apiConfig.apiRegExp);
            }
            return matches;
          });
          console.log(apiConfig, params);
          if (!apiConfig) {
            console.log("Can't show post modal: "+ apiLink);
            return {
              then: function(callback){
                callback();
              }
            };
          };
          //初始化表单数据
          var tmpInitFunc = _.isFunction(eventHandles.init)? _.clone(eventHandles.init):function(){};
          eventHandles.init = function($scope){
            $scope.formData = apiConfig.modalFormData;
            tmpInitFunc($scope);
          }
          var tmpOkFunc = _.isFunction(eventHandles.onOk)?eventHandles.onOk:function(){
            return Thenjs(function(defer){
              defer(undefined);
            })
          };
          eventHandles.onOk = function(form, $scope){
            //校验表单是否正确
            if (form.$invalid) return;
            //回调传入的onOk函数
            tmpOkFunc(form, $scope).then(function(defer){
              console.log('Commit form data:' + JSON.stringify($scope.formData));
              Restangular.all(_.template(apiConfig.api, params)).post($scope.formData).then(function(data){
                console.log('Commit success, get data:', data.data.rawData);
                //提交成功
                if (_.isFunction(eventHandles.onSuccess)){
                  eventHandles.onSuccess(form, $scope);
                  defer(null);
                }
                //提交失败
                else{
                  $scope.hideModal();
                  defer("Commit form error");
                }
              }, function(error){
                console.log('Commit form error:' + JSON.stringify(error));
                if (_.isFunction(eventHandles.onError)){
                  eventHandles.onError(error, form, $scope);
                  defer("Commit form error");
                }
              })
            })
          }
          Modal.okCancelModal(apiConfig.modalTemplate, options, eventHandles)
            .then(function(){console.log(11111111)});
        },

        createRoute: function(){
          // console.log(JSON.stringify(this.allApiStates()['tab.games'].views));
          _.forEach(apiConfigs, function(apiConfig){
            if (apiConfig.name !== 'start'){
              $stateProvider.state(apiConfig.state, {
                url: apiConfig.stateUrl,
                views: {
                  'menuContent': {
                    templateUrl: apiConfig.templateUrl,
                    controller: apiConfig.controller
                  }
                },
                data: {
                  // access: Auth.accessLevels.public
                }
              });
            }
          });
        },//End of createRoute

      }
    };

  })

  .run(function(RestRoute){
    // RestRoute.createRoute();
  });
});


