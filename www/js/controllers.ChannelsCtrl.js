define(['app', 'services.Api','services.Modal'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'Api', 'Auth','$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$q','Modal',
    function($scope, $state, $stateParams, UI, Api, Auth,$ionicFrostedDelegate, $ionicScrollDelegate, $timeout, $q,Modal) {
 
    	// UI.testModal('modal-new-clip');

    	$scope.addChannel = function(){
    		addChannelModal()
    	}

        var getFollowedGame = function(){
            var tmp = {};
            Api.getData('/recent-played-games/' + Auth.currentUser().userData._id + '?_start=0', $scope, 'channels').then(function(){
                console.debug($scope.channels);
                _.forEach($scope.channels, function(interest){
                    if (interest['@clips'] && interest['@clips']['slice']){
                        interest.lastClip = interest['@clips']['slice'][interest['@clips']['slice'].length - 1]
                    }
                    Api.getData(interest.game, interest, 'gameData').then(function(){
                        console.debug(interest);
                    });
                })
            });
        };

        function getGame(scope){
            var getChannels = function(){
                Api.getData('/clients-by-platform/ios?_last' + '&r=' + Math.random(), scope, 'channels').then(function(){
                    console.log(scope.channels);
                    _.forEach(scope.channels, function(add){
                        add.installed = "checking";
                        add.followed = "No";
                        if(_.contains(_.pluck(scope.interests,'game'), add.game)){
                            add.followed = "Yes";
                        };

                        Api.getData(add.game, add, 'gameData').then(function(){
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
            if (!Auth.isLoggedIn()){
                getChannels();
            }else{
                //检查是否已有关注
                Api.getData('/user-interests/'+ Auth.currentUser().userData._id + '?_last=&r=' + Math.random(), scope, 'interests').then(function(){
                    if((scope.interests.length)>0) scope.ifAbled = "able";
                    getChannels();                   
                });
            }          
        }

        function addChannelModal(){
            Modal.okCancelModal('templates/modal-add-channel.html', {}, {
                init: function(scope){  
                    scope.ifAbled = "disabled";

                    getGame(scope);

                    //监听返回应用的事件
                    document.addEventListener("resume", refresh, false);

                    function refresh() {
                        getGame(scope);
                        document.removeEventListener("resume",refresh,false); 
                    }

                    scope.followGame = function(channle){
                        console.debug('followGame')
                        if (channle.installed == "No"){
                            window.open(channle.store, '_system');
                        }else{
                            if (!Auth.isLoggedIn()){
                                Auth.login(function(){
                                    console.log("ok!" + Auth.currentUser().userData._id);
                                    getGame(scope);
                                });
                            }
                            else{                                
                                var parsedUrl = /(\w+)$/.exec(channle.follow);
                                // console.debug(parsedUrl[1]);
                                Api.putData(channle.follow, {game:parsedUrl[1], user:Auth.currentUser().userData._id});
                                scope.ifAbled = "able";
                                channle.followed = "Yes";
                            }
                        }//end else1
                    } 

                    scope.complete = function(){ 
                        getFollowedGame();
                        scope.hideModal();
                    }

                }
            })
        }


    	if (!Auth.isLoggedIn()){
            addChannelModal()
        }


        $scope.$on("$ionicView.afterEnter", function() {
            getFollowedGame();
        });
        
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
