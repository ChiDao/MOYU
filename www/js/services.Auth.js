define(['app', 'services.Modal', 'services.RestRoute', 'services.Push'], function(app)
{
    app.factory('Auth', function($rootScope, $ionicHistory, $timeout, $state, 
      $http, $ionicModal, Restangular, Modal, RestRoute, PushProcessingService) {
      //Todo: 把定义从app.config移到这里
      var accessLevels = app.routingConfig.accessLevels,
          userRoles = app.routingConfig.userRoles,
          modalData = {};

      //Todo: 从缓存读取用户信息
      var userData = (localStorage.getItem('user') === null?{a:1}:JSON.parse(localStorage.getItem('user')));
      console.log(userData);
      var currentUser = (localStorage.getItem('user') === null?
                         { userName: '', role: app.routingConfig.userRoles.public, userData: {} }:
                         { userName: userData.email, role:app.routingConfig.userRoles.user, userData: userData}
                         )
      // var currentUser = { userName: '', role: routingConfig.userRoles.public, userData: {} }


      // Public API here
      return {
        pageAuth: function(pageAccessLevel){
          return pageAccessLevel & currentUser.role;
        },
        isUserExisted: function(username, success, error){
          //Todo
        },
        register: function(registerData, success, error){
          //Todo
        },
        disallow: function(){
          Modal.okCancelModal('templates/modal-allow-notification.html', {}, {
            onOk: function(form, scope){     
              PushProcessingService.initialize();                                                
              scope.push = false;
              scope.hideModal();
              Modal.okCancelModal('templates/modal-how-to-notification.html', {}, {
                init: function(scope){
                  scope.push = false;
                  //循环检查
                  recheck(scope);
                }
              })
            }
          });
        },
        login: function(success, error, close){ 
          //填写邮箱signup对话框
          (function(preRegistModal){
            RestRoute.postModal('/signup', {}, {
              onSuccess: function(form, signupScope){
                signupScope.hideModal();
                preRegistModal(signupScope.formData.email);
              }
            });
          })
          //填写验证码pre-register对话框
          ((function(allowNotification){
            return function(email){
              RestRoute.postModal('/pre-register', {}, {
                init: function(scope){
                  scope.formData.email = email
                  scope.mustChoise = false;
                  scope.resetcommitFormError = function(ev){
                    scope.commitFormError = false;
                  }
                },
                onOk: function(form, scope){
                  return Thenjs(function(defer){
                    scope.commitFormError = false;
                    defer(undefined);
                  });
                },
                onSuccess: function(form, scope){
                  var Me = Restangular.one("me");
                  Me.get().then(function(me){
                    console.log(me);
                    currentUser.userName = me.data.rawData.email;
                    currentUser.role = userRoles.user;
                    //存储用户信息到localStorage
                    localStorage.setItem('user', JSON.stringify(me.data.rawData));
                    console.log(me.data.rawData);
                    
                    scope.closeModal();
                  },function(error){
                    scope.commitFormError = true;
                    scope.commitFormErrorMsg = error.data.alertMsg;
                    console.log('login fail, get data: ' + JSON.stringify(error));
                  })
                  //如果没有开启推送，显示提醒开启推送
                  .then(function(){
                    var checkPush = PushProcessingService.checkResult();
                    console.log("checkPush"+checkPush);
                    if(checkPush != "Yes"){
                      allowNotification();
                    }else{
                      $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                      });
                      $state.go('app.wait-open');
                    }
                  })
                },
                onError: function (error, form, scope){
                  scope.commitFormError = true;
                  scope.commitFormErrorMsg = error.data.alertMsg;
                  console.log('login fail, get data: ' + JSON.stringify(error));
                }
              });//End of postModal
            };//End of function to be passed
          })
          //开通推送对话框
          ((function(howToNotificationModal){
            return function(){
              Modal.okCancelModal('templates/modal-allow-notification.html', {}, {
                onOk: function(form, scope){
                  howToNotificationModal();
                  scope.hideModal();
                }
              });
            };
          })
          //
          (function(){
            PushProcessingService.initialize(); 
            Modal.okCancelModal('templates/modal-how-to-notification.html', {}, {
              init: function(scope){                            
                scope.push = false;               
                //循环检查                
                recheck(scope);
              }
            });//End of okCancelModal
          })
          ));//End of pass function as param
        },
        isLoggedIn: function(){
          return currentUser.role == userRoles.user;
        },
        currentUser: function(){
          return currentUser;
        },
        refreshToken: function(){
          //Todo
        },
        logout:function(success){
          currentUser.userName = '';
          currentUser.role = userRoles.public;
          localStorage.removeItem('user', null);
          success();
        },
        testModal: function(modelName) {
          console.log(modelName);
          Modal.okCancelModal('templates/'+modelName+'.html', {}, {
            init: function(scope){
            }
          });//End of okCancelModal
        },
        testNoti: function (argument) {
          (function(){
            PushProcessingService.initialize(); 
            Modal.okCancelModal('templates/modal-how-to-notification.html', {}, {
              init: function(scope){                            
                scope.push = false;               
                //循环检查                
                recheck(scope);
              }
            });//End of okCancelModal
          })
        },

        ssoAuth: function(ssoData){
          //Todo: 返回授权结果给第三方应用
          var ssoCallBack = function(status, info, authCode){
            if (ionic.Platform.platform() === 'macintel'){
              console.log(ssoData.url + '://?status=' + status + '&info=' + encodeURIComponent(info) + (status==='0'?'&code=' + authCode:''));
            }
            if(ionic.Platform.isIOS()){
              console.log("ios loginByClient");
              window.open(ssoData.url + '://?status=' + status + '&info=' + encodeURIComponent(info) + (status==='0'?'&code=' + authCode:''), '_system');
            }
            if (ionic.Platform.isAndroid()){
              console.log("android loginByClient");
              window.open(ssoData.url + '://?status=' + status + '&info=' + encodeURIComponent(info) + (status==='0'?'&code=' + authCode:''), '_system');
            }
          };

          var confirmSso = function(){
            $ionicHistory.nextViewOptions({
              disableAnimate: true,
              disableBack: true
            });
            $state.go('app.wait-open');
            Restangular.oneUrl('user-client-authorize/' + ssoData.appId + '/' + ssoData.url).get().then(function(data){
              console.log('Get client authorize Success, Get data:' + JSON.stringify(data));;
              Modal.okCancelModal('templates/modal-sso-auth.html', {}, {
                init: function(scope){
                  scope.gameClientTitle = data.data.rawData.description;
                  scope.authCode = data.data.rawData.code;
                  scope.publisher = data.data.rawData.publisher;
                  scope.gameClientLogo = data.data.rawData.logo;
                  console.log(JSON.stringify(scope.gameClientLogo));
                },
                onOk: function(form, scope){
                  ssoCallBack('0', 'sso ok', data.data.rawData.code);
                  scope.hideModal();
                },
                onCancel: function(scope){
                  ssoCallBack('-2', 'sso cancel');
                  scope.hideModal();
                }
              });
            }, function(error){
              ssoCallBack('-3', 'sso fail');
              console.log('Get client authorize Error:' + JSON.stringify(error));
            })
            //Todo: 如果曾经授权，不需再授权
          };

          //没有登录
          if (!this.isLoggedIn()){
            //填写邮箱signup对话框
            (function(preRegistModal){
              RestRoute.postModal('http://42.120.45.236:8485/signup', {}, {
                init: function(scope){
                  scope.mustChoise = true;
                },
                onSuccess: function(form, signupScope){
                  signupScope.hideModal();
                  preRegistModal(signupScope.formData.email);
                },
                onCancel: function(){
                  ssoCallBack('-1', 'logined cancel');
                },
              });
            })
            //填写验证码pre-register对话框
            ((function(ssoAuth){
              return function(email){
                RestRoute.postModal('http://42.120.45.236:8485/pre-register', {}, {
                  init: function(scope){
                    scope.formData.email = email
                    scope.mustChoise = true;
                    scope.resetcommitFormError = function(ev){
                      scope.commitFormError = false;
                    }
                  },
                  onOk: function(form, scope){
                    scope.commitFormError = false;
                  },
                  onSuccess: function(form, scope){
                    var Me = Restangular.one("me");
                    Me.get().then(function(me){
                      console.log(me);
                      currentUser.userName = me.data.rawData.email;
                      currentUser.role = userRoles.user;
                      //存储用户信息到localStorage
                      localStorage.setItem('user', JSON.stringify(me.data.rawData));
                      console.log(me.data.rawData);
                      
                      scope.closeModal();
                    },function(error){
                      scope.commitFormError = true;
                      scope.commitFormErrorMsg = error.data.alertMsg;
                      console.log('login fail, get data: ' + JSON.stringify(error));
                    })
                    .then(function(){
                      ssoAuth();
                    })
                  },
                  onCancel: function(form, scope){
                    ssoCallBack('-1', 'logined cancel');
                  },
                  onError: function (error, form, scope){
                    scope.commitFormError = true;
                    scope.commitFormErrorMsg = error.data.alertMsg;
                    console.log('login fail, get data: ' + JSON.stringify(error));
                  }
                });//End of postModal
              };//End of function to be passed
            })
            //开通推送对话框
            (function(scope){
              confirmSso();
            }));
          }else{
            confirmSso();
          }

        },

        accessLevels: accessLevels,
        userRoles: userRoles
      };
      function recheck(scope){
        $timeout(function() {                         
          PushProcessingService.checkinitialize(); 
          $timeout(function() {                        
            var checkPush =  PushProcessingService.checkResult();                         
            console.log("checkPush is "+checkPush);                         
            if(checkPush != "Yes"){                        
              console.log("循环检查");                         
              recheck(scope);                         
            }else{
              scope.push =true;
              $timeout(function() {
                scope.hideModal();
              },5000)
              $ionicHistory.nextViewOptions({
                disableAnimate: true,
                disableBack: true
              });
              $state.go('app.wait-open');
            }
          },1);
        }, 1000);
      }
    })

  .run(['$rootScope', '$state', '$location', '$ionicNavBarDelegate', 'Auth', function ($rootScope, $state, $location, $ionicNavBarDelegate, Auth) {

      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

          console.log(toState.data.access);
          if (!Auth.pageAuth(toState.data.access)) {
            console.log('缺少权限访问' + toState.url);
            Auth.login(function(){
              console.log("登陆获得进入权限");
            },function(){
              //登陆失败
            },function(){
              //关闭登陆窗
              //Todo: 跳转，但不记录本次state
              alert('跳回上一页');
              // $state.go('app.playlists');
            });
          }else{
            console.log('具有权限访问' + toState.url);        
          }
      });

  }]);
});

