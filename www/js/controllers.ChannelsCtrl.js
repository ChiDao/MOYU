define(['app', 'services.RestRoute','services.Modal'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'RestRoute', 'Auth','$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$q','Modal',
    function($scope, $state, $stateParams, UI, RestRoute, Auth,$ionicFrostedDelegate, $ionicScrollDelegate, $timeout, $q,Modal) {
 
    	// UI.testModal('modal-new-clip');

    	$scope.addChannel = function(){
    		addChannelModal()
    	}

        function getGame(scope){
            RestRoute.getLinkData('/clients-by-platform/ios?_last' + '&r=' + Math.random(), scope, 'channels').then(function(){
                console.log(scope.channels);
                _.forEach(scope.channels, function(add){
                    add.installed = "checking";
                    add.followed = "No";
                    if(_.contains(_.pluck(scope.interests,'game'), add.game)){
                        add.followed = "Yes";
                    };

                    RestRoute.getLinkData(add.game, add, 'gameData').then(function(){
                        console.log(add.gameData);
                    });
                })
                //异步检测应用是否存在函数
                function asyncCheck(channel){
                    var deferred = $q.defer();
                    if (typeof(appAvailability) !== 'undefined'){
                        appAvailability.check(
                            channel.url + "://", // URI Scheme
                            function() {  // Success callback
                                deferred.resolve("Yes");
                            },
                            function() {  // Error callback
                                deferred.resolve("No");
                            }
                        );
                    }else{
                        deferred.resolve("Yes");
                    }
                    return deferred.promise;
                }

                //加入到promises数组
                var promises=[];
                for(var key=0;key<scope.channels.length;key++){

                    promises.push(asyncCheck(scope.channels[key]));
                }
                
                //同步检测应用是否存在
                $q.all(promises).then(function(infos){
                    for(var key=0;key<infos.length;key++){
                        scope.channels[key].installed = (infos[key]);
                    }
                });
            });

        }

        function addChannelModal(){
            Modal.okCancelModal('templates/modal-add-channel.html', {}, {
                init: function(scope){  
                    scope.ifAbled = "disabled";
                    //检查是否已有关注
                    RestRoute.getLinkData('/user-interests/'+ Auth.currentUser().userData._id + '?_last=&r=' + Math.random(), scope, 'interests').then(function(){
                        if((scope.interests.length)>0) scope.ifAbled = "able";
                    });

                    getGame(scope);

                    //监听返回应用的事件
                    document.addEventListener("resume", onResume, false);

                    function onResume() {
                        console.log("qqqqq");
                        getGame(scope);
                    }

                    scope.followGame = function(channle){
                        console.debug('followGame')
                        if (channle.installed == "No"){
                            window.open(channle.store, '_system');
                        }else{
                            if (!Auth.isLoggedIn()){
                            Auth.login();
                            }
                            else{                                
                                var parsedUrl = /(\w+)$/.exec(channle.follow);
                            // console.debug(parsedUrl[1]);
                                RestRoute.putDataToLink(channle.follow, {game:parsedUrl[1], user:Auth.currentUser().userData._id});
                                scope.ifAbled = "able";
                                channle.followed = "Yes";
                            }
                        }//end else1
                    } 

                    // RestRoute.getLinkData('/user-interests/14b10ab5cb29dafe?_count=&r=' + Math.random(),scope, 'count').then(function(){
                    //     console.log("qqq"+JSON.stringify(scope.count));
                    //     if((scope.count.value)>0) scope.ifAbled = "able";
                    // });                   
                    scope.complete = function(){ 
                        scope.hideModal();
                    }

                }
            })
        }


    	if (!Auth.isLoggedIn()){
            addChannelModal()
        }

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
