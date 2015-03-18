define(['app', 'services.Api', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'Auth', 'Api', '$ionicLoading', 'apImageHelper',
    function($scope, $stateParams, UI, Auth, Api, $ionicLoading, apImageHelper) {
      $scope.Auth = Auth;
      Auth.updateUser();
      $scope.userData = Auth.currentUser().userData;
      console.debug($scope.userData);
      //setting only for ios8
      $scope.setting = (ionic.Platform.device().platform=="iOS" && ionic.Platform.device().version.substr(0,1)>=8);
      $scope.toSet = function(){
        window.plugins.pushNotification.toSetting();
      }

      //获取资料
      $scope.imageURI = 'img/upload-photo.png';
      $scope.formData = {logo:'',nickname:''};
      var getProfile = function(){
        return Api.getData('/user-profile/' + $scope.userData._id, $scope, 'formData', {
        }).then(function(defer){
          // console.log("bbb"+JSON.stringify($scope.formData));
          $scope.imageURI = $scope.formData.logo['100'];
          defer(undefined);
          // console.debug($scope.clips);
        }, function(defer, error){
          console.debug(error);
          defer(error);
        });
      };
      
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
      

      //编辑资料
      $scope.getPicture = function(){
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
              $scope.imageURI = imageURI;
            }

            function onFail(message) {
              console.log('Failed because: ' + message);
            }
        };
        window.plugins.actionsheet.show(options, callback);
      }
      $scope.canvas = {
        src: null,
        image: null,
        frame: null,
        scale: null,
        offset: null
      }; 
      $scope.zoomIn = function() {
        $scope.canvas.scale *= 1.2;
      }
      $scope.zoomOut = function() {
        $scope.canvas.scale /= 1.2;
      }
      $scope.crop = function() {
        var maxSize = {
          width: 1500,
          height: 1500
        };

        var canvasData = apImageHelper.cropImage($scope.canvas.image, $scope.canvas.frame, maxSize);
        $scope.imageURI = canvasData.dataURI;
      }
      $scope.save = function(){
        Thenjs(function(defer){
          if($scope.imageURI.substr(0,4) != 'http'){
            var win = function (r) {
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
                var returnJson = JSON.parse(r.response);
                $scope.formData.logo = returnJson;
                defer(undefined);
            };

            var fail = function (error) {
                alert("An error has occurred: Code = " + JSON.stringify(error));
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
                defer("Upload image error");
            };

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = $scope.imageURI.substr($scope.imageURI.lastIndexOf('/') + 1);
            console.log("fileName:" + $scope.imageURI.substr($scope.imageURI.lastIndexOf('/') + 1));
            options.mimeType = "image/jpeg";
            //options.Authorization = "Basic emFra3poYW5nejgyMTE1MzY0"

            var ft = new FileTransfer();
            ft.upload($scope.imageURI, encodeURI(Auth.currentUser().userData.homeData.upload), win, fail, options);
          }else{
            defer(undefined);
          }                  
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
