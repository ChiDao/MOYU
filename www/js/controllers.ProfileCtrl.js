define(['app', 'services.Api', 'services.Auth'], function(app)
{
  app.controller('ProfileCtrl', ['$scope', '$stateParams', 'UI', 'Auth', 'Api',
    function($scope, $stateParams, UI, Auth, Api) {
      $scope.Auth = Auth;
      $scope.userData = Auth.currentUser().userData;
      console.debug($scope.userData);

      Api.getData($scope.userData.clips, $scope, 'clips', {
        last:true,
        itearator: {
          gameData: {
            type: 'getData',
            attr: 'game'
          }
        }
      }).then(function(){
        // console.debug($scope.clips);
	    });

      //获取资料
      $scope.imageURI = 'img/upload-photo.png';
      $scope.formData = {logo:'',nickname:''};
      var getProfile = function(){
        Api.getData('/user-profile/' + $scope.userData._id, $scope, 'formData', {
        }).then(function(){
          // console.log("bbb"+JSON.stringify($scope.formData));
          $scope.imageURI = $scope.formData.logo['100'];
          // console.debug($scope.clips);
        });
      };
      getProfile();

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
            ft.upload($scope.imageURI, encodeURI("http://42.120.45.236:8485/upload"), win, fail, options);
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
