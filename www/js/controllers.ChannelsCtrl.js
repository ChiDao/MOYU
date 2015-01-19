define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute',
    function($scope, $state, $stateParams, UI, RestRoute) {

      // UI.testModal('modal-new-clip');

	  $scope.items = [1,2,3];
	  $scope.doRefresh = function() {
	  $http.get('/tab/channels/14a66eaac9ae6457')
	   .success(function(newItems) {
	     $scope.items = newItems;
	   })
	   .finally(function() {
	     // Stop the ion-refresher from spinning
	     $scope.$broadcast('scroll.refreshComplete');
	   });
	  };

      RestRoute.getLinkData('/all-clients/ios?_last', $scope, 'channels').then(function(){
        console.log($scope.channels);
      });
    }
  ]);
});
