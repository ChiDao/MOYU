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
    ], function(){

  var starter = angular.module('starter', [
    'ionic', 
    'restangular',
    'ngMessages', 
    'ngCookies', 
    'pascalprecht.translate',
    ]);


  starter.run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
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


