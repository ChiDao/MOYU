require.config({
    paths: {
  		'cordova': 'cordova',
        'lodash': 'lib/lodash/dist/lodash',
        'restangular': 'lib/restangular/dist/restangular',

        'app': 'js/app',
        'routes': 'js/app.routes',
        'config': 'js/app.config',

        'services.Auth': 'js/services.Auth',
        'services.Modal': 'js/services.Modal',
        'services.Push': 'js/services.Push',
        'services.RestRoute': 'js/services.RestRoute',
        'services.UI': 'js/services.UI',
        'services.Data': 'js/services.Data',
        'services.FrostedGlass': 'js/services.FrostedGlass',

        'controllers.ChannelsCtrl': 'js/controllers.ChannelsCtrl',
        'controllers.ChannelCtrl': 'js/controllers.ChannelCtrl',
        'controllers.AddChannelCtrl': 'js/controllers.AddChannelCtrl',
        'controllers.ChatsCtrl': 'js/controllers.ChatsCtrl',
        'controllers.ChatCtrl': 'js/controllers.ChatCtrl',
        'controllers.DiscoverCtrl': 'js/controllers.DiscoverCtrl',
        'controllers.ProfileCtrl': 'js/controllers.ProfileCtrl',
    },
	shim: {
		'corodva': {
			exports: 'cordova'
		},
        'lodash': {
            exports: '_'
        },
        'restangular': {
            deps: ['lodash'],
            exports: 'Restangular'
        },
        'routes': {
            deps: [
                'controllers.ChannelsCtrl',
                'controllers.ChannelCtrl',
                'controllers.AddChannelCtrl',
                'controllers.ChatsCtrl',
                'controllers.ChatCtrl',
                'controllers.DiscoverCtrl',
                'controllers.ProfileCtrl',
            ]
        },
	}
});

require
(
    [
        'app',

        'services.Auth',
        'services.Modal',
        'services.RestRoute',
        'services.Push',
        'services.UI',
        'services.Data',
        'services.FrostedGlass',
        'routes',
        'config',
    ],
    function(app)
    {
        console.log('bootstrap');
        angular.bootstrap(document, ['starter']);
    }
);