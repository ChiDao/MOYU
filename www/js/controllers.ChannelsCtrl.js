define(['app', 'services.Api','services.Modal'], function(app)
{
  app.controller('ChannelsCtrl', ['$scope', '$state', '$stateParams', 'UI', 'Api', 'Auth', '$ionicLoading',
    '$ionicFrostedDelegate','$ionicScrollDelegate', '$timeout', '$q', 'Modal', 'DB','$ionicPopup',
    '$rootScope',
    function($scope, $state, $stateParams, UI, Api, Auth, $ionicLoading,
      $ionicFrostedDelegate, $ionicScrollDelegate, $timeout, $q, Modal, DB,$ionicPopup,
      $rootScope) {

      // Auth.login();

      $scope.$on('login', function(event,data) {
        console.log("iflogin:"+data);
        if(data){
          $scope.isLoggedIn = true;
          $scope.bindInit();
        }
      });

      $scope.filterValid = function(value){
        // console.debug(value);
        return value['@game'];
      }

      //检查上传事件是否结束
      if (localStorage.getItem('playGameTm') !== null){
        $state.go('tab.channel',{gameId:localStorage.getItem('playGameId')});
      }

      $scope.bindInit = function(){
        $scope.channels = [0,1,2,3,4,5,6,7,8,9];
        var bindChannels = Api.bindList('/recent-played-games/' + Auth.currentUser().userData._id + '?_start=0', $scope, 'channels', {
          reverse: true,
          itearator: {
            lastClip:{
              type: 'transfer',
              attr: '@clips',
              transfer: function(clips){
                if (clips && clips['slice']){
                  return clips['slice'][clips['slice'].length - 1]
                }else{
                  return undefined;
                }
              }
            }
          }
        });

        bindChannels.setDBTable('channels', '_id')
        .fin(function(){
          $ionicLoading.show();
          bindChannels.init()
          .then(function(defer){
            // pull refresh
            $scope.doRefresh = function() {
              bindChannels.refresh().then(function(defer){
                $scope.$broadcast('scroll.refreshComplete');
                $scope.hasMore = bindChannels.moreData.length;
              }, function(defer){
                $scope.$broadcast('scroll.refreshComplete');
                $scope.hasMore = bindChannels.moreData.length;
              })
            };

            $scope.loadMore = function() {
              bindChannels.more().then(function(defer){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.hasMore = bindChannels.moreData.length;
              }, function(defer){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $scope.hasMore = bindChannels.moreData.length;
              })
            };

            $scope.enterRefresh = function(){
              if (Auth.isLoggedIn()){
                $ionicLoading.show();
                bindChannels.refresh().fin(function(){
                  $ionicLoading.hide();
                });
              }
            }

            $scope.$on("$ionicView.afterEnter", $scope.enterRefresh);
            defer(undefined);
          }, function(defer, error){
            defer(error)
          })
          .fin(function(defer){
            $ionicLoading.hide();
          })
        },3000)

      }

      $scope.unLoginInit = function(){
        $scope.channels = [0,1,2,3,4,5,6,7,8,9];
        // var bindChannels =
        Api.getData('/clients-by-platform/ios?_last' + '&r=' + Math.random(), $scope, 'channels', {
          itearator: {
            gameData: {
              type: 'getData',
              attr: 'game',
            }
          }
        }).then(function(){
          console.debug($scope.channels);
        })
      }
      var init = function(){
        if (Auth.isLoggedIn()){
          $scope.isLoggedIn = true;
          $scope.bindInit();
        }else{
          $scope.isLoggedIn = false;
          $scope.unLoginInit();
          // addChannelModal()
        }
      }
      init();
      $rootScope.$on('login', function(e, userData){
        init();
      })
      $rootScope.$on('logout', function(e){
        console.debug('logout')
        init();
      })


      function getGame(scope){
        var getChannels = function(){
          $ionicLoading.show();
          scope.channels = [0,1,2,3,4,5,6,7,8,9];
          Api.getData('/clients-by-platform/ios?_last' + '&r=' + Math.random(), scope, 'channels',{
            itearator: {
              // gameData: {
              //   type: 'getData',
              //   attr: 'game',
              // },
              installed: {
                type: 'const',
                attr: 'installed',
                value: 'checking',
              },
              followed: {
                type: 'transfer',
                attr: 'game',
                transfer: function(game){
                  return (_.contains(_.pluck(scope.interests,'game'), game)?'Yes':'No');
                }
              },
              doFollow: {
                type: 'putFunction',
                attr: 'follow'
              }
            }
          }).then(function(){
            console.log(scope.channels);
            $ionicLoading.hide();
            //异步检测应用是否存在函数
            function asyncCheck(channel){
              var deferred = $q.defer();

              // deferred.resolve("Yes");

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
          Api.getData('/user-interests/'+ Auth.currentUser().userData._id + '?_last=&r=' + Math.random(), scope, 'interests').then(function(defer){
            defer(undefined);
          }, function(defer, error){
            console.debug(error);
            if (error.status === 404){
              scope.interests = '';
              defer(undefined);
            }
            else defer('error');
          }).then(function(){
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
                var confirmPopup = $ionicPopup.confirm({
                  title: '下载游戏',
                  template: '您没有安装<b style="color:red">'+channle.name+'</b>，是否前往App Store安装?'
                 });
                confirmPopup.then(function(res) {
                  if(res) {
                    window.open(channle.store, '_system');
                  } else {
                    console.log('download cancel');
                  }
                });
              }else{
                if (!Auth.isLoggedIn()){
                  Auth.login(function(){
                    $scope.bindInit();
                    console.log("ok!" + Auth.currentUser().userData._id);
                    Api.getData('/user-interests/'+ Auth.currentUser().userData._id + '?_last=&r=' + Math.random(), scope, 'interests').then(function(defer){
                      console.log("login");
                      if((scope.interests.length)>0){
                        scope.hideModal();
                        $scope.enterRefresh();
                      }
                    }, function(defer, error){
                      getGame(scope);
                    })
                  });
                }
                else{
                  var parsedUrl = /(\w+)$/.exec(channle.follow);
                  // console.debug(parsedUrl[1]);
                  channle.doFollow({});
                  // Api.putData(channle.follow, {game:parsedUrl[1], user:Auth.currentUser().userData._id});
                  scope.ifAbled = "able";
                  channle.followed = "Yes";
                }
              }//end else1
            }

            scope.complete = function(){
              scope.hideModal();
              $scope.enterRefresh();
            }

          }
        })
      }
      $scope.addChannel = function(){
        addChannelModal()
      }

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

  app.filter('timeFormat', function(){
    return function(dataTime){
      return '時間';
    };
  })
});
