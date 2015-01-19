define(['app', 'services.RestRoute'], function(app)
{
  app.controller('DiscoverCtrl', ['$scope', '$stateParams', 'UI', 'RestRoute',
    function($scope, $stateParams, UI, RestRoute) {
      // RestRoute.getData($scope, 'game').then(function(){
      //   console.log(_.keys($scope));
      // });
    }
  ]);
});
