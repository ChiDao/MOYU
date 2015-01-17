define(['app'], function(app){

  app.config(function($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      controllerProvider: function($state){
        return function($scope, $state){
          $scope.hideTabs = function(){
            switch ($state.current.name) {
              case 'tab.channel':
                  return true;
              case 'tab.chat':
                  return true;
              default:
                  return false;
            }
          };
        };
      }
    })

    // Each tab has its own nav history stack:

    .state('tab.channels', {
      url: '/channels',
      views: {
        'tab-channels': {
          templateUrl: 'templates/channels.html',
          controller: 'ChannelsCtrl'
        }
      }
    })
      .state('tab.channel', {
        url: '/channels/:channelId',
        views: {
          'tab-channels': {
            templateUrl: 'templates/channel.html',
            controller: 'ChannelCtrl'
          }
        }
      })
      .state('tab.add-channel', {
        url: '/add-channel',
        views: {
          'tab-channels': {
            templateUrl: 'templates/add-channel.html',
            controller: 'AddChannelCtrl'
          }
        }
      })

    .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.chat', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat.html',
            controller: 'ChatCtrl'
          }
        }
      })

    .state('tab.discover', {
        url: '/discover',
        views: {
          'tab-discover': {
            templateUrl: 'templates/discover.html',
            controller: 'DiscoverCtrl'
          }
        }
      })

    .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/channels');

  });
});