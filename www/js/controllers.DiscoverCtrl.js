define(['app', 'services.Api'], function(app)
{
  app.controller('DiscoverCtrl', ['$scope', '$stateParams', 'UI', 'Api',
    function($scope, $stateParams, UI, Api) {
      // Api.getData($scope, 'game').then(function(){
      //   console.log(_.keys($scope));
      // });
    }
  ]);
});
