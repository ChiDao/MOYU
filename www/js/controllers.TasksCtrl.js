define(['app', 'services.Api'], function(app)
{
  app.controller('TasksCtrl', ['$scope', '$stateParams', 'UI', 'Api','$rootScope',
    function($scope, $stateParams, UI, Api,$rootScope) {
    	Api.getData('http://42.120.45.236:8485/game-tasks/'+$stateParams.gameId+'?_last', $scope, 'tasks').then(function(defer, tasks){
    		console.log(tasks)
    	})
  	}
	]);
});