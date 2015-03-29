define(['app', 'services.Api', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$rootScope', '$stateParams', 'UI', 'Auth', 'Api', '$ionicLoading', 'apImageHelper',
    'Modal','upyun',
    function($scope, $rootScope, $stateParams, UI, Auth, Api, $ionicLoading, apImageHelper,
      Modal,upyun) {
      
      //setting only for ios8
      $scope.setting = (ionic.Platform.device().platform=="iOS" && ionic.Platform.device().version.substr(0,1)>=8);
      $scope.toSet = function(){
        window.plugins.pushNotification.toSetting();
      }

      $scope.Auth = Auth;
      //获取资料
      var getProfile = function(){
        return Api.getData('/user-profile/' + $scope.userData._id, $scope, 'formData', {
        }).then(function(defer){
          // console.log("bbb"+JSON.stringify($scope.formData));
          $scope.imageURI = ($scope.formData.logo.absUrl || $scope.formData.logo['100']);
          defer(undefined);
          // console.debug($scope.clips);
        }, function(defer, error){
          console.debug(error);
          defer(error);
        });
      };
      
      var init;
      (init = function(){
        $scope.clips = [];
        $scope.imageURI = 'img/upload-photo.png';
        $scope.formData = {logo:'',nickname:''};

        if (Auth.isLoggedIn()){
          Auth.updateUser();
          $scope.userData = Auth.currentUser().userData;
          console.debug($scope.userData);
        } else {
          return;
        }

        var bindStruct = Api.bindList($scope.userData.clips, $scope, 'clips', {
          last:true,
          itearator: {
            gameData: {
              type: 'getData',
              attr: 'game'
            }
          }
        });

        $ionicLoading.show();
        async.parallel([
          function(callback){
            getProfile().fin(function(defer){
              callback(undefined);
            })
          },
          function(callback){
            bindStruct.init().then(function(defer){
              // pull refresh
              $scope.pullRefresh = function() {
                bindStruct.refresh().then(function(defer){
                  $scope.$broadcast('scroll.refreshComplete');
                  $scope.hasMore = bindStruct.moreData.length;
                }, function(defer){
                  $scope.$broadcast('scroll.refreshComplete');
                  $scope.hasMore = bindStruct.moreData.length;
                })
              };
              $scope.loadMore = function() {
                bindStruct.more().then(function(defer){
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                  $scope.hasMore = bindStruct.moreData.length;
                }, function(defer){
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                  $scope.hasMore = bindStruct.moreData.length;
                })
              };
              defer(undefined);
            }, function(defer, error){
              console.debug(error);
              defer(error);
            })
            .fin(function(){
              callback(undefined);
            });
          }
        ], function(){
          $ionicLoading.hide();
        })
      })();

      $rootScope.$on('login', function(e, userData){
        console.debug('login');
        init();
      })
      $rootScope.$on('logout', function(e, userData){
        console.debug('logout');
        init();
      })
      
      //编辑资料
      $scope.getPicture = function(){
        // Modal.okCancelModal('templates/modal-profile-logo.html', {}, {
        //   init:function(){

        //   }
        // })
        var options = {
            'buttonLabels': ['拍照', '从手机相册选择'],
            'androidEnableCancelButton' : true, // default false
            'winphoneEnableCancelButton' : true, // default false
            'addCancelButtonWithLabel': '取消',
        };
        var callback = function(buttonIndex) {
            if(buttonIndex == 1){
              navigator.camera.getPicture(onSuccess, onFail, { 
                quality: 100, 
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
              });
            }else if(buttonIndex == 2){
              navigator.camera.getPicture(onSuccess, onFail, { 
                quality: 100, 
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM
              });
            }
            function onSuccess(imageURI) {
              Modal.okCancelModal('templates/modal-profile-logo.html', {}, {
                init: function(scope){
                  scope.canvasId = 'canvas' + Math.random();
                  scope.canvas = {
                    src: imageURI,
                    image: null,
                    frame: null,
                    scale: null,
                    offset: null
                  }
                  scope.zoomIn = function() {
                    scope.canvas.scale *= 1.2;
                  }
                  scope.zoomOut = function() {
                    scope.canvas.scale /= 1.2;
                  }
                },
                onOk: function(form, scope){
                  Thenjs(function(defer){
                    var maxSize = {
                      width: 1500,
                      height: 1500
                    };

                    var canvasData = apImageHelper.cropImage(scope.canvas.image, scope.canvas.frame, maxSize);
                    // $scope.imageURI = canvasData.dataURI;
                    defer(undefined);
                  }).then(function(defer){
                    var openGameTime = new Date().getTime();
                    window.canvas2ImagePlugin.saveImageDataToLibrary(
                      function(msg){
                        console.log("下载成功"+msg);
                        $scope.imageURI = 'img/upload-photo.png'; //图片重置
                        navigator.camera.takePhoto(function(photo){
                          $scope.imageURI = photo;
                          console.log("成功截图"+$scope.imageURI); 
                          window.canvas2ImagePlugin.removeImgFromLibrary(msg);
                          scope.hideModal();
                        }, 
                        function  (message) {
                          alert('Failed because: ' + message);
                        }, 
                        {
                          date: openGameTime,
                        });                                                                 
                      },
                      
                      function(err){
                        console.log("下载失败"+err);
                      },
                      document.getElementById(scope.canvasId)
                    );
                  })                 
                }
              })//End of Modal
            }//End of onSuccess

            function onFail(message) {
              console.log('Failed because: ' + message);
            }
        };
        window.plugins.actionsheet.show(options, callback);
      }

      $scope.save = function(){ 
        Thenjs(function(defer){
          upyun.upload($scope.imageURI, function(err, response, image){
            if (err) console.error(err);
            if (image.code === 200 && image.message === 'ok') {
              $scope.imageURI = image.absUrl;
              $scope.formData.logo = image;
              // console.log("图片信息："+JSON.stringify(image));
              defer(undefined);
            }
            $scope.$apply();
          }); 
                           
        }).then(function(defer){
          // console.log("aaa"+JSON.stringify($scope.formData));  
          Api.putData('/user-profile/' + $scope.userData._id, $scope.formData).then(function(defer, response){
            // console.log("aaa1"+response.data.rawData);
            getProfile();
            Auth.updateUser();
            alert("保存成功！")            
          });
        })  
      }      
    }
  ]);
});
