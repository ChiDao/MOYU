define(['app', 'services.RestRoute'], function(app)
{
  app.controller('AddChannelCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute', '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout',
    function($scope, $stateParams, UI, RestRoute, $ionicFrostedDelegate, $ionicScrollDelegate, $timeout) {
  //     	RestRoute.getLinkData('/clients-by-platform/ios?_last', $scope, 'channels').then(function(){
		// 	console.log($scope.channels);
		// });
  		RestRoute.getData($scope, 'channels');
    }
  ]);
});
