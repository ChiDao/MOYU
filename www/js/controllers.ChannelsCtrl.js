define(['app', 'services.RestRoute'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute', 'Auth',
    function($scope, $state, $stateParams, UI, RestRoute, Auth) {

    	// UI.testModal('modal-new-clip');

    	$scope.addChannel = function(){
    		$state.go('tab.add-channel');
    	}

    	if (!Auth.isLoggedIn()) $state.go('tab.add-channel');

        var tmp = {};
        RestRoute.getLinkData('/recent-played-games/' + Auth.currentUser().userData._id + '?_start=0', $scope, 'channels').then(function(){
            console.debug($scope.channels);
            _.forEach($scope.channels, function(interest){
                if (interest['@clips'] && interest['@clips']['slice']){
                    interest.lastClip = interest['@clips']['slice'][interest['@clips']['slice'].length - 1]
                }
                RestRoute.getLinkData(interest.game, interest, 'gameData').then(function(){
                    console.debug(interest);
                });
            })
        });
    	// RestRoute.getData();
		// 
    }
  ]);
    app.filter('timeBefore', function(){
        return function(dataTime){
            var secondDiff = (new Date().getTime() - new Date(dataTime).getTime())/1000;
            if (_.isNaN(secondDiff)){
                return '';
            }
            else if (secondDiff <= 3600){
                return "1小时内";
            }
            else if(secondDiff <= 24 * 3600){
                return parseInt(secondDiff / 3600) + "小时前";
            }
            else if(secondDiff <= 360 * 24 * 3600){
                return parseInt(secondDiff / 24 / 3600) + "天前";
            }else{
                return "1年前";
            }
            return secondDiff;
        };
    })
});
