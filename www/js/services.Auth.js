define(['app', 'services.Modal', 'services.Api', 'services.Push'], function(app)
{
    app.factory('Auth', function($rootScope, $ionicHistory, $timeout, $state, 
      $http, $ionicModal, Api, Modal, PushProcessingService) {
      //Todo: 把定义从app.config移到这里
      var accessLevels = app.routingConfig.accessLevels,
          userRoles = app.routingConfig.userRoles,
          modalData = {};

      //Todo: 从缓存读取用户信息
      var userData = (localStorage.getItem('user') === null?{a:1}:JSON.parse(localStorage.getItem('user')));
      console.log(userData);
      var currentUser = (localStorage.getItem('user') === null?
                         { userName: '', role: app.routingConfig.userRoles.public, userData: {} }:
                         { userName: userData.tel, role:app.routingConfig.userRoles.user, userData: userData}
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
          Modal.okCancelModal('templates/modal-a-notification.html', {}, {
            onOk: function(form, scope){     
              PushProcessingService.initialize();                                                
              scope.push = false;
              scope.hideModal();
              Modal.okCancelModal('templates/modal-b-notification.html', {}, {
                init: function(scope){
                  scope.push = false;
                  //循环检查
                  recheck(scope);
                }
              })
            }
          });
        },
        login: function(success){ 
          //填写邮箱signup对话框
          (function(preRegistModal){
            Modal.okCancelModal('templates/modal-welcome.html', {}, {
              onOk: function(form,scope){
                scope.hideModal();
                Api.postModal('/signup', {}, {
                  init:function(signupScope){
                    signupScope.disable = false;
                    signupScope.txt = "下一步";
                  },
                  onOk: function(form, signupScope){
                    signupScope.disable = true;
                    signupScope.txt = 60;
                    timedCount();
                    function timedCount(){
                      signupScope.txt = signupScope.txt -1;
                      if (signupScope.txt > 0){
                        $timeout(function(){
                          timedCount();
                        },1000);
                      }else{
                        signupScope.disable = false;
                        signupScope.txt = "下一步";
                      }               
                    }
                    return Thenjs(function(defer){
                      signupScope.formData.tel = signupScope.formData.tel.toString();
                      defer(undefined);
                    });
                  },
                  onSuccess: function(form, signupScope){
                    console.debug(signupScope.formData.tel);
                    signupScope.hideModal();
                    preRegistModal(signupScope.formData.tel);
                  }
                });
              }
            })
            
          }
          //填写验证码pre-register对话框
          ((function(allowNotification){
            return function(tel){
              Api.postModal('/login', {}, {
                init: function(scope){
                  scope.formData.tel = tel
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
                onSuccess: function(form, scope, data){
                  Api.getData(data.me, {}, 'me').then(function(defer, me){
                    console.log(me);
                    currentUser.userName = me.tel;
                    currentUser.role = userRoles.user;
                    me.homeData = data;
                    currentUser.userData = me;
                    //存储用户信息到localStorage
                    localStorage.setItem('user', JSON.stringify(me));
                    $rootScope.$broadcast('login', me);
                    console.log(me);
                    
                    scope.closeModal();
                    defer(undefined);
                  }, function(defer, error){
                    scope.commitFormError = true;
                    scope.commitFormErrorMsg = error.data.alertMsg;
                    console.log('login fail, get data: ' + JSON.stringify(error));
                    defer('login fail', JSON.stringify(error));
                  })
                  //如果没有开启推送，显示提醒开启推送
                  .then(function(){
                    var checkPush = PushProcessingService.checkResult();
                    console.log("checkPush"+checkPush);
                    // if(checkPush == "No"){
                    //   allowNotification();
                    // }else{
                      // $ionicHistory.nextViewOptions({
                      //   disableAnimate: true,
                      //   disableBack: true
                      // });
                      // $state.go('app.wait-open');
                    // }
                    success();
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
              Modal.okCancelModal('templates/modal-a-notification.html', {}, {
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
            Modal.okCancelModal('templates/modal-b-notification.html', {}, {
              init: function(scope){                            
                scope.push = false;               
                //循环检查                
                recheck(scope);
              }
            });//End of okCancelModal
          })
          )));//End of pass function as param
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
        updateUser: function(){
          Api.getData(currentUser.userData.homeData.me, {}, 'me').then(function(defer, me){
            console.log("update"+JSON.stringify(me));
            currentUser.userName = me.tel;
            currentUser.role = userRoles.user;
            me.homeData = currentUser.userData.homeData;
            currentUser.userData = me;
            //存储用户信息到localStorage
            localStorage.setItem('user', JSON.stringify(me));
            console.log("update1"+JSON.stringify(me));

            defer(undefined);
          }, function(defer, error){
            console.log('fail, get data: ' + JSON.stringify(error));
            defer('login fail', JSON.stringify(error));
          })
        },
        logout:function(success){
          currentUser.userName = '';
          currentUser.role = userRoles.public;
          localStorage.removeItem('user', null);
          $rootScope.$broadcast('logout');
          success();
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
              // $ionicHistory.nextViewOptions({
              //   disableAnimate: true,
              //   disableBack: true
              // });
              // $state.go('app.wait-open');
            }
          },1);
        }, 1000);
      }
    })

  .run(['$rootScope', '$state', '$stateParams', '$location', '$ionicNavBarDelegate', 'Auth', function ($rootScope, $state, $stateParams, $location, $ionicNavBarDelegate, Auth) {

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
            // alert('跳回上一页');
            // $state.go('app.playlists');
          });
        }else{
          console.log('具有权限访问' + toState.url);        
        }
      });
      $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
        toState.params = $stateParams;
      });
  }]);
});

