define(['app'], function(app){

  app.config(function($stateProvider, $urlRouterProvider) {


    var access = app.routingConfig.accessLevels;
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
      controller: 'TabsCtrl'
    })

    // Each tab has its own nav history stack:

    .state('tab.channels', {
      url: '/channels',
      views: {
        'tab-channels': {
          templateUrl: 'templates/channels.html',
          controller: 'ChannelsCtrl'
        }
      },
      data: {
        access: access.public
      }
    })
      .state('tab.channel', {
        url: '/channels/:channelId',
        views: {
          'tab-channels': {
            templateUrl: 'templates/channel.html',
            controller: 'ChannelCtrl'
          }
        },
        data: {
          access: access.public
        }
      })
      .state('tab.add-channel', {
        url: '/add-channel',
        views: {
          'tab-channels': {
            templateUrl: 'templates/add-channel.html',
            controller: 'AddChannelCtrl'
          }
        },
        data: {
          access: access.public
        }
      })
      .state('tab.channel-chat', {
        url: '/channel-chat/:chatId',
        views: {
          'tab-channels': {
            templateUrl: 'templates/chat.html',
            controller: 'ChatCtrl'
          }
        },
        data: {
          access: access.public
        }
      })

    .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chats.html',
            controller: 'ChatsCtrl'
          }
        },
        data: {
          access: access.public
        }
      })
      .state('tab.chat', {
        url: '/chats/:chatId',
        views: {
          'tab-chats': {
            templateUrl: 'templates/chat.html',
            controller: 'ChatCtrl'
          }
        },
        data: {
          access: access.public
        }
      })

    .state('tab.discover', {
        url: '/discover',
        views: {
          'tab-discover': {
            templateUrl: 'templates/discover.html',
            controller: 'DiscoverCtrl'
          }
        },
        data: {
          access: access.public
        }
      })

    .state('tab.profile-edit', {
      url: '/profile-edit',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile-edit.html',
        }
      },
      data: {
        access: access.public
      }
    })

    .state('tab.profile-setting', {
      url: '/profile-setting',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile-setting.html',
        }
      },
      data: {
        access: access.public
      }
    })

    .state('tab.profile-feels', {
      url: '/profile-feels',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile-feels.html',
          controller: 'ProfileCtrl'
        }
      },
      data: {
        access: access.public
      }
    })

    .state('tab.profile', {
      url: '/profile',
      views: {
        'tab-profile': {
          templateUrl: 'templates/profile.html',
          controller: 'ProfileCtrl'
        }
      },
      data: {
        access: access.public
      }
    })
      .state('tab.profile-chat', {
        url: '/profile-chat/:chatId',
        views: {
          'tab-profile': {
            templateUrl: 'templates/chat.html',
            controller: 'ChatCtrl'
          }
        },
        data: {
          access: access.public
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/channels');

  });
});