// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

define([
    'cordova',
    'restangular',
    'angular-messages',
    'angular-translate',
    'angular-preload-image',
    'upyun',
    ], function(){

  var starter = angular.module('starter', [
    'ionic',
    'restangular',
    'ngMessages',
    'ngCookies',
    'pascalprecht.translate',
    'angular-preload-image',
    'upyun',
    'ap.canvas.ext'
    ]);

  /*
  * img2x
  * 高清圖片
  * img2x(src2x='File url without extension',ext='extension')
  */
  starter.directive('img2x', function() {
    return {
      scope: {
        src: '@src2x',
        ext: '@ext'
      },
      replace: true,
      restrict: "E",
      transclude: false,
      template: "<img src='{{src}}.{{ext}}' srcset='{{src}}@2x.{{ext}} 2x' >"
    };
  });

  starter.run(function($rootScope, $state, $ionicPlatform,PushProcessingService, DB, Api) {

    PushProcessingService.checkinitialize();

    //启动应用则取消全部本地推送
    if (window.plugin && window.plugin.notification){
      window.plugin.notification.local.cancelAll(function () {
        console.log("全部取消");
      });
    }

    if(localStorage.getItem('apnToken') != null){
          PushProcessingService.initialize();
    }
    $ionicPlatform.ready(function() {
      // ionic.Platform.fullScreen();

      DB.init();
      Api.getData('/start', $rootScope, 'start');

      //alert:
      if (ionic.Platform.isWebView()) {
        console.log("》Machine");
        window.alert = function (txt, title, button) {
          if (title == undefined) {
            title = 'Gamo';
          }
          if (button == undefined) {
            button = '关闭';
          }
          navigator.notification.alert(txt, null, title, button);
        }
      } else {
        console.log("》Chrome View");
      }


      if (typeof(Keyboard) !== "undefined") {
        if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
      }

      if (window.StatusBar) {
        // StatusBar.overlaysWebView(true);
        StatusBar.styleDefault();
        // StatusBar.backgroundColorByHexString("#eff5fa");
        // ionic.Platform.fullScreen()
      }

      console.debug(localStorage.getItem('user'));

      // if (localStorage.getItem('user') === null){
      //   $state.go('tab.add-channel');
      // }
    });
  });


  //角色配置
  (function(exports){
    var userRoles = {
        public: 1, // 001
        user:   2 // 010
    };
    exports.userRoles = userRoles;
    exports.accessLevels = {
        public: userRoles.public | // 11
                userRoles.user,
        user:   userRoles.user     // 10
    };
    })(typeof exports === 'undefined'? starter.routingConfig={}: exports);

  return starter;
});


